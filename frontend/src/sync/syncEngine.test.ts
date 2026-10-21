import { vi } from 'vitest';
import { LocalSyncQueueRow } from '../data';
import { calcularEspera, SyncEngine, SyncQueue } from './syncEngine';

const AGORA = 1_000_000;

const item = (id: string, entity = 'formularios', extra: Partial<LocalSyncQueueRow> = {}): LocalSyncQueueRow => ({
  id,
  entity,
  operation: 'create',
  payload: {},
  createdAt: 0,
  attempts: 0,
  status: 'pendente',
  nextAttemptAt: 0,
  ...extra,
});

/** Fila em memória com a mesma regra de "pronto" da fila SQLite. */
const criarFila = (itens: LocalSyncQueueRow[]) => {
  const linhas = new Map(itens.map((i) => [i.id, { ...i }]));
  const fila: SyncQueue = {
    getProntos: async (agora) =>
      [...linhas.values()].filter((i) => i.status === 'pendente' && i.nextAttemptAt <= agora),
    update: async (id, patch) => linhas.set(id, { ...linhas.get(id)!, ...patch }),
    remove: async (id) => {
      linhas.delete(id);
    },
    count: async () => [...linhas.values()].filter((i) => i.status === 'pendente').length,
  };
  return { fila, linhas };
};

const criarMotor = (itens: LocalSyncQueueRow[], online = true) => {
  const { fila, linhas } = criarFila(itens);
  const motor = new SyncEngine({ fila: async () => fila, isOnline: () => online, agora: () => AGORA });
  return { motor, linhas };
};

const apiErro = (status: number) => ({ message: `HTTP ${status}`, status });

describe('SyncEngine', () => {
  it('remove da fila os itens enviados com sucesso', async () => {
    const { motor, linhas } = criarMotor([item('a'), item('b')]);
    const enviados: string[] = [];
    motor.registrar('formularios', async (i) => {
      enviados.push(i.id);
    });

    const resultado = await motor.sincronizar();

    expect(enviados).toEqual(['a', 'b']);
    expect(resultado).toMatchObject({ total: 2, sucessos: 2, falhas: 0 });
    expect(linhas.size).toBe(0);
  });

  it('marca como erro definitivo quando o servidor recusa os dados (422)', async () => {
    const { motor, linhas } = criarMotor([item('a')]);
    motor.registrar('formularios', async () => {
      throw apiErro(422);
    });

    await motor.sincronizar();

    expect(linhas.get('a')).toMatchObject({ status: 'erro', attempts: 1, lastError: 'HTTP 422' });
    expect(await motor.pendentes()).toBe(0);
  });

  it('agenda nova tentativa com espera crescente em erro de servidor (500)', async () => {
    const { motor, linhas } = criarMotor([item('a', 'formularios', { attempts: 2 })]);
    motor.registrar('formularios', async () => {
      throw apiErro(500);
    });

    await motor.sincronizar();

    expect(linhas.get('a')).toMatchObject({
      status: 'pendente',
      attempts: 3,
      nextAttemptAt: AGORA + calcularEspera(3),
    });
  });

  it('não reenvia itens que ainda estão esperando', async () => {
    const { motor } = criarMotor([item('a', 'formularios', { nextAttemptAt: AGORA + 1 })]);
    const handler = vi.fn();
    motor.registrar('formularios', handler);

    await motor.sincronizar();

    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    [0, 'offline'],
    [401, 'sessao'],
  ])('para a rodada sem punir os itens quando o erro é %s', async (status, motivo) => {
    const { motor, linhas } = criarMotor([item('a'), item('b')]);
    const handler = vi.fn(async () => {
      throw apiErro(status);
    });
    motor.registrar('formularios', handler);

    const resultado = await motor.sincronizar();

    expect(resultado.interrompidoPor).toBe(motivo);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(linhas.get('a')).toMatchObject({ attempts: 0, status: 'pendente' });
  });

  it('não faz nada sem internet', async () => {
    const { motor } = criarMotor([item('a')], false);
    const handler = vi.fn();
    motor.registrar('formularios', handler);

    expect(await motor.sincronizar()).toMatchObject({ total: 0, interrompidoPor: 'offline' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('marca como erro um item de entidade sem handler', async () => {
    const { motor, linhas } = criarMotor([item('a', 'desconhecida')]);
    await motor.sincronizar();
    expect(linhas.get('a')?.status).toBe('erro');
  });

  it('não roda duas rodadas ao mesmo tempo', async () => {
    const { motor } = criarMotor([item('a')]);
    const handler = vi.fn(async () => {});
    motor.registrar('formularios', handler);

    const [r1, r2] = await Promise.all([motor.sincronizar(), motor.sincronizar()]);

    expect(r1).toBe(r2);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('avisa os assinantes ao fim de uma rodada com envios', async () => {
    const { motor } = criarMotor([item('a')]);
    motor.registrar('formularios', async () => {});
    const listener = vi.fn();
    const cancelar = motor.assinar(listener);

    await motor.sincronizar();
    cancelar();

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ sucessos: 1 }));
  });
});

describe('calcularEspera', () => {
  it('dobra a cada tentativa e para em 1 hora', () => {
    expect(calcularEspera(1)).toBe(30_000);
    expect(calcularEspera(2)).toBe(60_000);
    expect(calcularEspera(3)).toBe(120_000);
    expect(calcularEspera(50)).toBe(60 * 60_000);
  });
});
