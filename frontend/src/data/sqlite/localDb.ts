import { getDb } from './connection';

export interface LocalVistoriaRow {
  id: string;
  payload: Record<string, unknown>;
  updatedAt: number;
  dirty: boolean;
}

export type SyncQueueStatus = 'pendente' | 'erro';

export interface LocalSyncQueueRow {
  id: string;
  entity: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  lastError?: string;
  /** `erro` = recusado de forma definitiva pelo servidor; não é reenviado. */
  status: SyncQueueStatus;
  /** Timestamp (ms) a partir do qual o item pode ser tentado de novo. */
  nextAttemptAt: number;
}

export interface LocalMetaRow {
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface LocalDBSchema {
  vistorias: {
    key: string;
    value: LocalVistoriaRow;
    indexes: { 'by-updatedAt': number; 'by-dirty': boolean };
  };
  sync_queue: {
    key: string;
    value: LocalSyncQueueRow;
    indexes: { 'by-createdAt': number; 'by-entity': string };
  };
  meta: {
    key: string;
    value: LocalMetaRow;
    indexes: never;
  };
}

type VistoriaSqlRow = {
  id: string;
  payload: string;
  updatedAt: number;
  dirty: number;
};

type SyncQueueSqlRow = {
  id: string;
  entity: string;
  operation: LocalSyncQueueRow['operation'];
  payload: string;
  createdAt: number;
  attempts: number;
  lastError: string | null;
  status: SyncQueueStatus | null;
  nextAttemptAt: number | null;
};

const vistoriaFromSql = (row: VistoriaSqlRow): LocalVistoriaRow => ({
  id: row.id,
  payload: JSON.parse(row.payload) as Record<string, unknown>,
  updatedAt: row.updatedAt,
  dirty: !!row.dirty,
});

const queueRowFromSql = (row: SyncQueueSqlRow): LocalSyncQueueRow => ({
  id: row.id,
  entity: row.entity,
  operation: row.operation,
  payload: JSON.parse(row.payload) as Record<string, unknown>,
  createdAt: row.createdAt,
  attempts: row.attempts,
  lastError: row.lastError ?? undefined,
  status: row.status ?? 'pendente',
  nextAttemptAt: row.nextAttemptAt ?? 0,
});

export const localDb = {
  async vistorias() {
    const db = await getDb();
    return {
      async getAll(): Promise<LocalVistoriaRow[]> {
        const res = await db.query('SELECT * FROM vistorias;');
        return ((res.values ?? []) as VistoriaSqlRow[]).map(vistoriaFromSql);
      },
      async getByDirty(dirty: boolean): Promise<LocalVistoriaRow[]> {
        const res = await db.query('SELECT * FROM vistorias WHERE dirty = ?;', [dirty ? 1 : 0]);
        return ((res.values ?? []) as VistoriaSqlRow[]).map(vistoriaFromSql);
      },
      async get(id: string): Promise<LocalVistoriaRow | undefined> {
        const res = await db.query('SELECT * FROM vistorias WHERE id = ? LIMIT 1;', [id]);
        const row = (res.values ?? [])[0] as VistoriaSqlRow | undefined;
        return row ? vistoriaFromSql(row) : undefined;
      },
      async put(
        value: Omit<LocalVistoriaRow, 'updatedAt'> & { updatedAt?: number }
      ): Promise<void> {
        const updatedAt = value.updatedAt ?? Date.now();
        await db.run(
          'INSERT OR REPLACE INTO vistorias (id, payload, updatedAt, dirty) VALUES (?, ?, ?, ?);',
          [value.id, JSON.stringify(value.payload), updatedAt, value.dirty ? 1 : 0]
        );
      },
      async bulkPut(values: LocalVistoriaRow[]): Promise<void> {
        if (values.length === 0) return;
        await db.executeSet(
          values.map((v) => ({
            statement: 'INSERT OR REPLACE INTO vistorias (id, payload, updatedAt, dirty) VALUES (?, ?, ?, ?);',
            values: [v.id, JSON.stringify(v.payload), v.updatedAt, v.dirty ? 1 : 0],
          }))
        );
      },
      async delete(id: string): Promise<void> {
        await db.run('DELETE FROM vistorias WHERE id = ?;', [id]);
      },
      /**
       * Troca todo o cache vindo do servidor pela lista nova, mantendo as
       * linhas `dirty` (criadas/alteradas no aparelho e ainda não enviadas).
       */
      async substituirSincronizadas(values: LocalVistoriaRow[]): Promise<void> {
        await db.executeSet([
          { statement: 'DELETE FROM vistorias WHERE dirty = 0;', values: [] },
          ...values.map((v) => ({
            statement: 'INSERT OR REPLACE INTO vistorias (id, payload, updatedAt, dirty) VALUES (?, ?, ?, ?);',
            values: [v.id, JSON.stringify(v.payload), v.updatedAt, v.dirty ? 1 : 0],
          })),
        ]);
      },
      async clear(): Promise<void> {
        await db.run('DELETE FROM vistorias;');
      },
      async count(): Promise<number> {
        const res = await db.query('SELECT COUNT(*) as total FROM vistorias;');
        return Number((res.values ?? [])[0]?.total ?? 0);
      },
      async clearDirtyFlag(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        await db.executeSet(
          ids.map((id) => ({
            statement: 'UPDATE vistorias SET dirty = 0 WHERE id = ?;',
            values: [id],
          }))
        );
      },
    };
  },

  async queue() {
    const db = await getDb();
    return {
      async getAllOrdered(): Promise<LocalSyncQueueRow[]> {
        const res = await db.query('SELECT * FROM sync_queue ORDER BY createdAt ASC;');
        return ((res.values ?? []) as SyncQueueSqlRow[]).map(queueRowFromSql);
      },
      /** Itens pendentes cuja espera já passou, na ordem em que foram criados. */
      async getProntos(agora: number = Date.now()): Promise<LocalSyncQueueRow[]> {
        const res = await db.query(
          "SELECT * FROM sync_queue WHERE status = 'pendente' AND nextAttemptAt <= ? ORDER BY createdAt ASC;",
          [agora]
        );
        return ((res.values ?? []) as SyncQueueSqlRow[]).map(queueRowFromSql);
      },
      async getByEntity(entity: string): Promise<LocalSyncQueueRow[]> {
        const res = await db.query(
          'SELECT * FROM sync_queue WHERE entity = ? ORDER BY createdAt ASC;',
          [entity]
        );
        return ((res.values ?? []) as SyncQueueSqlRow[]).map(queueRowFromSql);
      },
      async get(id: string): Promise<LocalSyncQueueRow | undefined> {
        const res = await db.query('SELECT * FROM sync_queue WHERE id = ? LIMIT 1;', [id]);
        const row = (res.values ?? [])[0] as SyncQueueSqlRow | undefined;
        return row ? queueRowFromSql(row) : undefined;
      },
      async push(
        value: Omit<
          LocalSyncQueueRow,
          'id' | 'createdAt' | 'attempts' | 'status' | 'nextAttemptAt'
        > & {
          id?: string;
          createdAt?: number;
          attempts?: number;
        }
      ): Promise<LocalSyncQueueRow> {
        const row: LocalSyncQueueRow = {
          id: value.id ?? `${value.entity}-${value.operation}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          entity: value.entity,
          operation: value.operation,
          payload: value.payload,
          createdAt: value.createdAt ?? Date.now(),
          attempts: value.attempts ?? 0,
          lastError: value.lastError,
          status: 'pendente',
          nextAttemptAt: 0,
        };
        await db.run(
          'INSERT OR REPLACE INTO sync_queue (id, entity, operation, payload, createdAt, attempts, lastError, status, nextAttemptAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [row.id, row.entity, row.operation, JSON.stringify(row.payload), row.createdAt, row.attempts, row.lastError ?? null, row.status, row.nextAttemptAt]
        );
        return row;
      },
      async update(id: string, patch: Partial<LocalSyncQueueRow>): Promise<LocalSyncQueueRow | null> {
        const res = await db.query('SELECT * FROM sync_queue WHERE id = ? LIMIT 1;', [id]);
        const existingRow = (res.values ?? [])[0] as SyncQueueSqlRow | undefined;
        if (!existingRow) return null;
        const next: LocalSyncQueueRow = { ...queueRowFromSql(existingRow), ...patch };
        await db.run(
          'UPDATE sync_queue SET entity = ?, operation = ?, payload = ?, createdAt = ?, attempts = ?, lastError = ?, status = ?, nextAttemptAt = ? WHERE id = ?;',
          [next.entity, next.operation, JSON.stringify(next.payload), next.createdAt, next.attempts, next.lastError ?? null, next.status, next.nextAttemptAt, id]
        );
        return next;
      },
      async remove(id: string): Promise<void> {
        await db.run('DELETE FROM sync_queue WHERE id = ?;', [id]);
      },
      /** Quantos itens ainda serão enviados (não conta os com `erro`). */
      async count(): Promise<number> {
        const res = await db.query("SELECT COUNT(*) as total FROM sync_queue WHERE status = 'pendente';");
        return Number((res.values ?? [])[0]?.total ?? 0);
      },
      async clear(): Promise<void> {
        await db.run('DELETE FROM sync_queue;');
      },
    };
  },

  async meta() {
    const db = await getDb();
    return {
      async get<T = unknown>(key: string): Promise<T | undefined> {
        const res = await db.query('SELECT value FROM meta WHERE key = ? LIMIT 1;', [key]);
        const row = (res.values ?? [])[0] as { value?: string } | undefined;
        if (!row?.value) return undefined;
        return JSON.parse(row.value) as T;
      },
      async set(key: string, value: unknown): Promise<void> {
        await db.run('INSERT OR REPLACE INTO meta (key, value, updatedAt) VALUES (?, ?, ?);', [
          key,
          JSON.stringify(value),
          Date.now(),
        ]);
      },
      async remove(key: string): Promise<void> {
        await db.run('DELETE FROM meta WHERE key = ?;', [key]);
      },
    };
  },
};
