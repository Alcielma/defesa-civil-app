import { isApiError, localDb, LocalSyncQueueRow } from '../data';
import { networkAdapter } from './network';

/**
 * Envia UM item da fila para a API. Deve lançar o erro original
 * (normalmente um `ApiError`) quando falhar — o motor decide se reenvia.
 */
export type SyncHandler = (item: LocalSyncQueueRow) => Promise<void>;

export interface SyncResultItem {
  id: string;
  entity: string;
  operation: LocalSyncQueueRow['operation'];
  sucesso: boolean;
  erro?: string;
}

export interface SyncResult {
  total: number;
  sucessos: number;
  falhas: number;
  items: SyncResultItem[];
  /** Motivo de a rodada ter parado antes do fim da fila, se parou. */
  interrompidoPor?: 'offline' | 'sessao';
}

export type SyncListener = (resultado: SyncResult) => void;

/** Fila usada pelo motor — abstraída para permitir testes sem SQLite. */
export interface SyncQueue {
  getProntos(agora: number): Promise<LocalSyncQueueRow[]>;
  update(id: string, patch: Partial<LocalSyncQueueRow>): Promise<unknown>;
  remove(id: string): Promise<void>;
  count(): Promise<number>;
}

export interface SyncEngineDeps {
  fila: () => Promise<SyncQueue>;
  isOnline: () => boolean;
  agora?: () => number;
}

/** O que fazer com um item depois de uma falha. */
type Decisao = 'reenviar' | 'erro-definitivo' | 'parar-offline' | 'parar-sessao';

const ESPERA_BASE_MS = 30_000;
const ESPERA_MAXIMA_MS = 60 * 60_000;

/** 30s, 1min, 2min, 4min… até no máximo 1h entre tentativas. */
export const calcularEspera = (tentativas: number): number =>
  Math.min(ESPERA_BASE_MS * 2 ** Math.max(0, tentativas - 1), ESPERA_MAXIMA_MS);

const classificarFalha = (erro: unknown): Decisao => {
  if (!isApiError(erro)) return 'erro-definitivo';
  const { status } = erro;
  if (status === 0) return 'parar-offline';
  if (status === 401 || status === 419) return 'parar-sessao';
  if (status === 408 || status === 429 || status >= 500) return 'reenviar';
  // Demais 4xx (422 validação, 403, 404…): reenviar não muda o resultado.
  return 'erro-definitivo';
};

const mensagemDe = (erro: unknown): string =>
  isApiError(erro) ? erro.message : (erro as Error)?.message ?? 'Erro desconhecido';

export class SyncEngine {
  private readonly handlers = new Map<string, SyncHandler>();
  private readonly listeners = new Set<SyncListener>();
  private emAndamento: Promise<SyncResult> | null = null;
  private agendado: ReturnType<typeof setTimeout> | null = null;
  private readonly agora: () => number;

  constructor(private readonly deps: SyncEngineDeps) {
    this.agora = deps.agora ?? Date.now;
  }

  /** Registra quem sabe enviar os itens de uma entidade (ex: `vistorias`). */
  registrar(entity: string, handler: SyncHandler): void {
    this.handlers.set(entity, handler);
  }

  /** Avisado ao fim de cada rodada de sincronização. Retorna o cancelamento. */
  assinar(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async pendentes(): Promise<number> {
    return (await this.deps.fila()).count();
  }

  /**
   * Processa a fila uma vez. Se já houver uma rodada em andamento,
   * devolve a mesma Promise em vez de rodar duas vezes em paralelo.
   */
  sincronizar(): Promise<SyncResult> {
    if (!this.emAndamento) {
      this.emAndamento = this.processar().finally(() => {
        this.emAndamento = null;
      });
    }
    return this.emAndamento;
  }

  /** Agenda uma rodada em breve, agrupando vários pedidos seguidos em um só. */
  sincronizarEmBreve(atrasoMs = 1500): void {
    if (this.agendado) clearTimeout(this.agendado);
    this.agendado = setTimeout(() => {
      this.agendado = null;
      void this.sincronizar().catch((e) =>
        console.warn('Falha ao sincronizar a fila offline.', e)
      );
    }, atrasoMs);
  }

  private async processar(): Promise<SyncResult> {
    const resultado: SyncResult = { total: 0, sucessos: 0, falhas: 0, items: [] };
    if (!this.deps.isOnline()) {
      resultado.interrompidoPor = 'offline';
      return resultado;
    }

    const fila = await this.deps.fila();
    const itens = await fila.getProntos(this.agora());
    resultado.total = itens.length;

    for (const item of itens) {
      const registro = { id: item.id, entity: item.entity, operation: item.operation };
      const handler = this.handlers.get(item.entity);
      try {
        if (!handler) throw new Error(`Entidade sem handler de sincronização: ${item.entity}`);
        await handler(item);
        await fila.remove(item.id);
        resultado.sucessos++;
        resultado.items.push({ ...registro, sucesso: true });
      } catch (erro) {
        const decisao = classificarFalha(erro);
        // Sem rede ou sessão expirada: o item não tem culpa. Para a rodada
        // sem contar tentativa; o próximo gatilho tenta de novo.
        if (decisao === 'parar-offline' || decisao === 'parar-sessao') {
          resultado.interrompidoPor = decisao === 'parar-offline' ? 'offline' : 'sessao';
          break;
        }
        const attempts = item.attempts + 1;
        await fila.update(item.id, {
          attempts,
          lastError: mensagemDe(erro),
          status: decisao === 'erro-definitivo' ? 'erro' : 'pendente',
          nextAttemptAt: this.agora() + calcularEspera(attempts),
        });
        resultado.falhas++;
        resultado.items.push({ ...registro, sucesso: false, erro: mensagemDe(erro) });
      }
    }

    if (resultado.items.length > 0) {
      this.listeners.forEach((l) => l(resultado));
    }
    return resultado;
  }
}

export const syncEngine = new SyncEngine({
  fila: () => localDb.queue(),
  isOnline: () => networkAdapter.isOnline(),
});
