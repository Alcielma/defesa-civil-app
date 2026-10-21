import { vi } from 'vitest';
import type { LocalSyncQueueRow, LocalVistoriaRow } from '../data';
import { StatusVistoria } from '../domain/entities';

// Banco local e API em memória, no lugar do SQLite e do fetch.
const db = vi.hoisted(() => ({
  vistorias: new Map<string, LocalVistoriaRow>(),
  fila: new Map<string, LocalSyncQueueRow>(),
  online: false,
  seq: 0,
}));
const api = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), del: vi.fn() }));

vi.mock('../data', () => ({
  apiClient: api,
  isApiError: (e: unknown) => typeof e === 'object' && e !== null && 'status' in e,
  localDb: {
    vistorias: async () => ({
      put: async (v: LocalVistoriaRow) => db.vistorias.set(v.id, v),
      delete: async (id: string) => db.vistorias.delete(id),
      count: async () => db.vistorias.size,
    }),
    queue: async () => ({
      push: async (v: Partial<LocalSyncQueueRow>) => {
        const row = { ...v, id: `q${db.seq++}`, createdAt: db.seq, attempts: 0 } as LocalSyncQueueRow;
        db.fila.set(row.id, row);
        return row;
      },
      getByEntity: async (entity: string) => [...db.fila.values()].filter((i) => i.entity === entity),
      update: async (id: string, patch: Partial<LocalSyncQueueRow>) =>
        db.fila.set(id, { ...db.fila.get(id)!, ...patch }),
      remove: async (id: string) => {
        db.fila.delete(id);
      },
    }),
  },
}));

vi.mock('../sync', () => ({
  networkAdapter: { isOnline: () => db.online },
  syncEngine: { sincronizarEmBreve: vi.fn() },
}));

const { vistoriaService, sincronizarItemVistoria } = await import('./VistoriaService');

const rascunho = {
  nomeSolicitante: 'Maria',
  endereco: 'Rua A',
  protocolo: 'P-1',
  status: StatusVistoria.PENDENTE,
};

const respostaApi = (id: number, nome = 'Maria') => ({
  id,
  nome_solicitante: nome,
  endereco: 'Rua A',
  status: 'PENDENTE',
});

const itensDaFila = () => [...db.fila.values()];

beforeEach(() => {
  db.vistorias.clear();
  db.fila.clear();
  db.online = false;
  vi.clearAllMocks();
});

describe('vistoria criada offline', () => {
  it('ao sincronizar, troca o id local pelo id do servidor (sem duplicar)', async () => {
    const local = await vistoriaService.criar(rascunho);
    expect(local.id).toMatch(/^local-/);

    api.post.mockResolvedValue(respostaApi(42));
    await sincronizarItemVistoria(itensDaFila()[0]);

    expect([...db.vistorias.keys()]).toEqual(['42']);
    // O localId não vai para a API.
    expect(api.post.mock.calls[0][1]).not.toHaveProperty('localId');
  });

  it('itens seguintes da fila passam a usar o id do servidor', async () => {
    const local = await vistoriaService.criar(rascunho);
    const [create] = itensDaFila();
    // Simula um item antigo da fila que ainda aponta para o id local.
    db.fila.set('legado', {
      ...create,
      id: 'legado',
      operation: 'update',
      payload: { id: local.id, nome_solicitante: 'Outra' },
    });

    api.post.mockResolvedValue(respostaApi(42));
    await sincronizarItemVistoria(create);

    expect(db.fila.get('legado')?.payload.id).toBe('42');
  });

  it('editar antes de sincronizar altera o create pendente, sem PUT para id local', async () => {
    db.online = true;
    api.post.mockRejectedValue({ message: 'falhou', status: 0 });
    const local = await vistoriaService.criar(rascunho);

    await vistoriaService.atualizar({ ...local, nomeSolicitante: 'Maria Editada' });

    expect(api.put).not.toHaveBeenCalled();
    expect(itensDaFila()).toHaveLength(1);
    expect(itensDaFila()[0]).toMatchObject({
      operation: 'create',
      payload: { localId: local.id, nome_solicitante: 'Maria Editada' },
    });
  });

  it('excluir antes de sincronizar só tira da fila, sem chamar a API', async () => {
    const local = await vistoriaService.criar(rascunho);

    await vistoriaService.excluir(local.id);

    expect(itensDaFila()).toHaveLength(0);
    expect(db.vistorias.size).toBe(0);
    expect(api.del).not.toHaveBeenCalled();
  });
});

describe('sincronizarItemVistoria', () => {
  it('trata 404 na exclusão como sucesso', async () => {
    api.del.mockRejectedValue({ message: 'Not found', status: 404 });
    await expect(
      sincronizarItemVistoria({ operation: 'delete', payload: { id: '7' } } as unknown as LocalSyncQueueRow)
    ).resolves.toBeUndefined();
  });
});
