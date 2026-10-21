export interface Migration {
  version: number;
  statements: string[];
}

/**
 * Cria as 3 tabelas usadas pela camada offline do app:
 * `vistorias` (cache local + flag de sincronização), `sync_queue`
 * (fila de operações pendentes) e `meta` (chave/valor genérico,
 * inclui o controle de versão do schema).
 */
export const migration001Initial: Migration = {
  version: 1,
  statements: [
    `CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS vistorias (
      id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updatedAt INTEGER NOT NULL,
      dirty INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_vistorias_updatedAt ON vistorias (updatedAt);`,
    `CREATE INDEX IF NOT EXISTS idx_vistorias_dirty ON vistorias (dirty);`,
    `CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      lastError TEXT
    );`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_createdAt ON sync_queue (createdAt);`,
    `CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue (entity);`,
  ],
};
