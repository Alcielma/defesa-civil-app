import { Vistoria, StatusVistoria, ContagemVistorias } from '../domain/entities';
import { apiClient, isApiError, localDb, LocalDBSchema } from '../data';
import { contarVistoriasPorStatus } from '../domain/useCases';
import { networkAdapter, syncEngine, SyncResult } from '../sync';
import { formularioService } from './FormularioService';

export const VISTORIAS_ENTITY = 'vistorias';

/** Ids gerados no aparelho, antes de o servidor devolver o id real. */
const PREFIXO_ID_LOCAL = 'local-';
const ehIdLocal = (id: string) => id.startsWith(PREFIXO_ID_LOCAL);

type LaravelVistoriaShape = {
  id: number | string;
  nome_solicitante?: string;
  nomeSolicitante?: string;
  endereco?: string;
  protocolo?: string;
  status?: string;
  data_criacao?: string;
  dataCriacao?: string;
  agente_responsavel_id?: number | string | null;
  agenteResponsavelId?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type SyncQueueItem = LocalDBSchema['sync_queue']['value'];

const STATUS_BACKEND_TO_ENUM: Record<string, StatusVistoria> = {
  PENDENTE: StatusVistoria.PENDENTE,
  pendente: StatusVistoria.PENDENTE,
  PENDING: StatusVistoria.PENDENTE,
  'EM ANDAMENTO': StatusVistoria.EM_CURSO,
  'EM_ANDAMENTO': StatusVistoria.EM_CURSO,
  EM_CURSO: StatusVistoria.EM_CURSO,
  em_curso: StatusVistoria.EM_CURSO,
  IN_PROGRESS: StatusVistoria.EM_CURSO,
  CONCLUIDA: StatusVistoria.CONCLUIDA,
  CONCLUÍDA: StatusVistoria.CONCLUIDA,
  concluida: StatusVistoria.CONCLUIDA,
  COMPLETED: StatusVistoria.CONCLUIDA,
  FINALIZADA: StatusVistoria.CONCLUIDA,
};

const mapearParaEntity = (raw: unknown): Vistoria | null => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as LaravelVistoriaShape;
  const id = obj.id != null ? String(obj.id) : '';
  const nomeSolicitante = (obj.nomeSolicitante as string | undefined) ?? (obj.nome_solicitante as string | undefined) ?? '';
  const endereco = (obj.endereco as string | undefined) ?? '';
  const protocolo = (obj.protocolo as string | undefined) ?? '';
  const statusRaw = ((obj.status as string | undefined) ?? 'PENDENTE').toUpperCase();
  const status = STATUS_BACKEND_TO_ENUM[statusRaw] ?? StatusVistoria.PENDENTE;
  const dataRaw =
    (obj.dataCriacao as string | undefined) ??
    (obj.data_criacao as string | undefined) ??
    (obj.created_at as string | undefined) ??
    new Date().toISOString();
  const agenteResponsavelId = (() => {
    const v = obj.agenteResponsavelId ?? obj.agente_responsavel_id;
    return v == null || v === '' ? undefined : String(v);
  })();
  if (!id || !nomeSolicitante) return null;
  return {
    id,
    nomeSolicitante,
    endereco,
    protocolo,
    status,
    dataCriacao: new Date(dataRaw),
    agenteResponsavelId,
  };
};

const mapearParaBackend = (v: Vistoria): Record<string, unknown> => ({
  nome_solicitante: v.nomeSolicitante,
  endereco: v.endereco,
  protocolo: v.protocolo,
  status: v.status,
  data_criacao: v.dataCriacao instanceof Date ? v.dataCriacao.toISOString() : v.dataCriacao,
  agente_responsavel_id: v.agenteResponsavelId ?? null,
});

const paraLinhaLocal = (v: Vistoria, dirty: boolean): Omit<LocalDBSchema['vistorias']['value'], 'updatedAt'> => ({
  id: v.id,
  payload: { ...v, dataCriacao: v.dataCriacao instanceof Date ? v.dataCriacao.toISOString() : v.dataCriacao },
  dirty,
});

/** `create` pendente na fila para uma vistoria que só existe no aparelho. */
const buscarCreatePendente = async (localId: string): Promise<SyncQueueItem | undefined> => {
  const fila = await localDb.queue();
  const itens = await fila.getByEntity(VISTORIAS_ENTITY);
  return itens.find((i) => i.operation === 'create' && i.payload.localId === localId);
};

/**
 * Envia para a API um item da fila de `vistorias`.
 * Registrado no `syncEngine` por `iniciarSincronizacao()`.
 */
export const sincronizarItemVistoria = async (item: SyncQueueItem): Promise<void> => {
  const store = await localDb.vistorias();
  const { id, localId, ...dados } = item.payload as { id?: string; localId?: string };

  if (item.operation === 'create') {
    const criada = mapearParaEntity(await apiClient.post<unknown>('/vistorias', dados, { timeoutMs: 10_000 }));
    if (!criada) return;
    if (localId && localId !== criada.id) {
      await store.delete(localId);
      // Itens que ainda apontam para o id local passam a usar o id do servidor.
      const fila = await localDb.queue();
      for (const pendente of await fila.getByEntity(VISTORIAS_ENTITY)) {
        if (pendente.payload.id === localId) {
          await fila.update(pendente.id, { payload: { ...pendente.payload, id: criada.id } });
        }
      }
    }
    await store.put(paraLinhaLocal(criada, false));
    return;
  }

  if (!id) throw new Error(`Item ${item.operation} de vistoria sem id.`);

  if (item.operation === 'update') {
    const atualizada = mapearParaEntity(
      await apiClient.put<unknown>(`/vistorias/${encodeURIComponent(id)}`, dados, { timeoutMs: 10_000 })
    );
    if (atualizada) await store.put(paraLinhaLocal(atualizada, false));
    return;
  }

  try {
    await apiClient.del(`/vistorias/${encodeURIComponent(id)}`, { timeoutMs: 8000 });
  } catch (e) {
    // Já não existe no servidor: o objetivo da exclusão foi atingido.
    if (!(isApiError(e) && e.status === 404)) throw e;
  }
};

export interface IVistoriaService {
  listarTodas(agenteId?: string): Promise<Vistoria[]>;
  listarPorAgente(agenteId: string): Promise<Vistoria[]>;
  contar(agenteId?: string): Promise<ContagemVistorias>;
  criar(rascunho: Omit<Vistoria, 'id' | 'dataCriacao'> & Partial<Pick<Vistoria, 'id' | 'dataCriacao'>>): Promise<Vistoria>;
  atualizar(entity: Vistoria): Promise<Vistoria>;
  excluir(id: string): Promise<void>;
  sincronizar(): Promise<SyncResult>;
  itensPendentesSincronia(): Promise<number>;
}

export class VistoriaService implements IVistoriaService {
  private async lerTodasLocal(): Promise<Vistoria[]> {
    const store = await localDb.vistorias();
    const rows = await store.getAll();
    return rows
      .map((r) => mapearParaEntity(r.payload))
      .filter((v): v is Vistoria => !!v);
  }

  /** Guarda a última lista vinda do servidor para uso offline. */
  private async substituirCacheLocal(lista: Vistoria[]): Promise<void> {
    const store = await localDb.vistorias();
    await store.substituirSincronizadas(
      lista.map((v) => ({ ...paraLinhaLocal(v, false), updatedAt: Date.now() }))
    );
  }

  private async enfileirar(
    entity: typeof VISTORIAS_ENTITY,
    operation: SyncQueueItem['operation'],
    payload: Record<string, unknown>
  ): Promise<void> {
    const queue = await localDb.queue();
    await queue.push({ entity, operation, payload });
    syncEngine.sincronizarEmBreve();
  }

  private async tentarApi<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<{ data: T; fromApi: boolean }> {
    const online = networkAdapter.isOnline();
    if (online) {
      try {
        return { data: await fn(), fromApi: true };
      } catch (e) {
        if (isApiError(e) && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 403) {
          throw e;
        }
      }
    }
    return { data: await fallback(), fromApi: false };
  }

  /**
   * Lista da Home: formulários já enviados (`GET /formularios`, ou o cache
   * local quando offline) + os que ainda estão na fila aguardando envio.
   * Ordenada do mais recente para o mais antigo.
   */
  async listarTodas(agenteId?: string): Promise<Vistoria[]> {
    const { data: enviados } = await this.tentarApi(
      async () => {
        const lista = await formularioService.listarEnviados();
        await this.substituirCacheLocal(lista);
        return lista;
      },
      async () => {
        const locais = await this.lerTodasLocal();
        if (!agenteId) return locais;
        return locais.filter(
          (v) => !v.agenteResponsavelId || v.agenteResponsavelId === agenteId
        );
      }
    );
    const naFila = await formularioService.listarNaFila();
    return [...naFila, ...enviados].sort(
      (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime()
    );
  }

  async listarPorAgente(agenteId: string): Promise<Vistoria[]> {
    return this.listarTodas(agenteId);
  }

  async contar(agenteId?: string): Promise<ContagemVistorias> {
    const lista = await this.listarTodas(agenteId);
    return contarVistoriasPorStatus(lista);
  }

  async criar(
    rascunho: Omit<Vistoria, 'id' | 'dataCriacao'> & Partial<Pick<Vistoria, 'id' | 'dataCriacao'>>
  ): Promise<Vistoria> {
    const id = rascunho.id ?? `${PREFIXO_ID_LOCAL}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entity: Vistoria = {
      id,
      nomeSolicitante: rascunho.nomeSolicitante,
      endereco: rascunho.endereco,
      protocolo: rascunho.protocolo,
      status: rascunho.status ?? StatusVistoria.PENDENTE,
      dataCriacao: rascunho.dataCriacao ?? new Date(),
      agenteResponsavelId: rascunho.agenteResponsavelId,
    };
    const store = await localDb.vistorias();
    await store.put(paraLinhaLocal(entity, true));
    const payload = { localId: entity.id, ...mapearParaBackend(entity) };
    if (networkAdapter.isOnline()) {
      try {
        const criada = mapearParaEntity(await apiClient.post<unknown>('/vistorias', mapearParaBackend(entity), { timeoutMs: 10_000 }));
        if (criada && criada.id) {
          if (criada.id !== entity.id) {
            await store.delete(entity.id);
          }
          await store.put(paraLinhaLocal(criada, false));
          return criada;
        }
      } catch {
        await this.enfileirar(VISTORIAS_ENTITY, 'create', payload);
      }
    } else {
      await this.enfileirar(VISTORIAS_ENTITY, 'create', payload);
    }
    return entity;
  }

  async atualizar(entity: Vistoria): Promise<Vistoria> {
    const store = await localDb.vistorias();
    await store.put(paraLinhaLocal(entity, true));

    // Ainda não chegou ao servidor: basta atualizar o `create` pendente.
    if (ehIdLocal(entity.id)) {
      const pendente = await buscarCreatePendente(entity.id);
      if (pendente) {
        const fila = await localDb.queue();
        await fila.update(pendente.id, {
          payload: { localId: entity.id, ...mapearParaBackend(entity) },
        });
        syncEngine.sincronizarEmBreve();
        return entity;
      }
    }

    const payload = { id: entity.id, ...mapearParaBackend(entity) };
    if (networkAdapter.isOnline()) {
      try {
        const raw = await apiClient.put<unknown>(`/vistorias/${encodeURIComponent(entity.id)}`, mapearParaBackend(entity), { timeoutMs: 10_000 });
        const atualizada = mapearParaEntity(raw);
        if (atualizada && atualizada.id) {
          await store.put(paraLinhaLocal(atualizada, false));
          return atualizada;
        }
      } catch {
        await this.enfileirar(VISTORIAS_ENTITY, 'update', payload);
      }
    } else {
      await this.enfileirar(VISTORIAS_ENTITY, 'update', payload);
    }
    return entity;
  }

  async excluir(id: string): Promise<void> {
    const store = await localDb.vistorias();
    await store.delete(id);

    // Nunca chegou ao servidor: some da fila e pronto.
    if (ehIdLocal(id)) {
      const pendente = await buscarCreatePendente(id);
      if (pendente) {
        const fila = await localDb.queue();
        await fila.remove(pendente.id);
        return;
      }
    }

    if (networkAdapter.isOnline()) {
      try {
        await apiClient.del(`/vistorias/${encodeURIComponent(id)}`, { timeoutMs: 8000 });
      } catch {
        await this.enfileirar(VISTORIAS_ENTITY, 'delete', { id });
      }
    } else {
      await this.enfileirar(VISTORIAS_ENTITY, 'delete', { id });
    }
  }

  async itensPendentesSincronia(): Promise<number> {
    return syncEngine.pendentes();
  }

  /** Processa a fila offline inteira (todas as entidades) e recarrega a lista. */
  async sincronizar(): Promise<SyncResult> {
    const resultado = await syncEngine.sincronizar();
    if (resultado.sucessos > 0) {
      try {
        await this.listarTodas();
      } catch {
        /* a lista local continua válida */
      }
    }
    return resultado;
  }
}

export const vistoriaService = new VistoriaService();
