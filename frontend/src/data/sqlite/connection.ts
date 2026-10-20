import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { env } from '../api/env';
import { runMigrations } from './migrations';

const sqlite = new SQLiteConnection(CapacitorSQLite);

let webStorePromise: Promise<void> | null = null;
let dbPromise: Promise<SQLiteDBConnection> | null = null;

/**
 * No navegador (dev/preview, sem build nativo) o plugin usa um polyfill
 * baseado em wasm que guarda o banco dentro do componente <jeep-sqlite>.
 * Precisa ser registrado e inicializado uma única vez antes de abrir
 * qualquer conexão. Em iOS/Android nativos isso é um no-op.
 */
const ensureWebStore = (): Promise<void> => {
  if (Capacitor.isNativePlatform()) return Promise.resolve();
  if (!webStorePromise) {
    webStorePromise = (async () => {
      const { defineCustomElements } = await import('jeep-sqlite/loader');
      defineCustomElements(window);

      type JeepSqliteEl = HTMLElement & { autoSave?: boolean; wasmPath?: string };
      let el = document.querySelector('jeep-sqlite') as JeepSqliteEl | null;
      if (!el) {
        el = document.createElement('jeep-sqlite') as JeepSqliteEl;
        el.autoSave = true;
        // Precisa apontar para onde `sql-wasm.wasm` (da versão de sql.js
        // fixada no package.json) é servido — ver public/assets/ e
        // scripts/copy-sqlite-wasm.mjs.
        el.wasmPath = '/assets';
        document.body.appendChild(el);
      }
      await customElements.whenDefined('jeep-sqlite');
      await sqlite.initWebStore();
    })();
  }
  return webStorePromise;
};

const abrirConexao = async (): Promise<SQLiteDBConnection> => {
  await ensureWebStore();

  const dbName = env.STORAGE_DB_NAME;
  const jaConectado = (await sqlite.isConnection(dbName, false)).result;
  const db = jaConectado
    ? await sqlite.retrieveConnection(dbName, false)
    : await sqlite.createConnection(dbName, false, 'no-encryption', env.STORAGE_DB_VERSION, false);

  await db.open();
  await runMigrations(db);
  return db;
};

/**
 * Retorna a conexão SQLite compartilhada pelo app, abrindo-a (e rodando
 * as migrações pendentes) na primeira chamada.
 */
export const getDb = (): Promise<SQLiteDBConnection> => {
  if (!dbPromise) {
    dbPromise = abrirConexao().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
};
