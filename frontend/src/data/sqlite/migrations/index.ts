import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Migration, migration001Initial } from './001_initial';
import { migration002AuthOffline } from './002_auth_offline';
import { migration003SyncQueueStatus } from './003_sync_queue_status';

export type { Migration };
export { migration001Initial, migration002AuthOffline, migration003SyncQueueStatus };

/**
 * Lista de migrações em ordem crescente de versão.
 * Para evoluir o schema, adicione um novo arquivo `00X_descricao.ts`
 * exportando um `Migration` e inclua-o aqui.
 */
export const MIGRATIONS: Migration[] = [
  migration001Initial,
  migration002AuthOffline,
  migration003SyncQueueStatus,
];

const SCHEMA_VERSION_KEY = 'schema_version';

/**
 * Lê a versão de schema já aplicada.
 * Retorna 0 quando a tabela `meta` ainda não existe (banco novo) —
 * nesse caso a primeira migração é responsável por criá-la.
 */
const lerVersaoAtual = async (db: SQLiteDBConnection): Promise<number> => {
  try {
    const res = await db.query('SELECT value FROM meta WHERE key = ?;', [SCHEMA_VERSION_KEY]);
    const row = res.values?.[0] as { value?: string } | undefined;
    return row?.value ? Number(JSON.parse(row.value)) : 0;
  } catch {
    return 0;
  }
};

const gravarVersao = async (db: SQLiteDBConnection, version: number): Promise<void> => {
  await db.run('INSERT OR REPLACE INTO meta (key, value, updatedAt) VALUES (?, ?, ?);', [
    SCHEMA_VERSION_KEY,
    JSON.stringify(version),
    Date.now(),
  ]);
};

/**
 * Aplica, em ordem, todas as migrações com versão maior que a atual.
 * Idempotente: pode ser chamado toda vez que a conexão é aberta.
 */
export const runMigrations = async (db: SQLiteDBConnection): Promise<void> => {
  const versaoAtual = await lerVersaoAtual(db);
  const pendentes = MIGRATIONS.filter((m) => m.version > versaoAtual).sort(
    (a, b) => a.version - b.version
  );
  for (const migration of pendentes) {
    for (const statement of migration.statements) {
      await db.execute(statement);
    }
    await gravarVersao(db, migration.version);
  }
};
