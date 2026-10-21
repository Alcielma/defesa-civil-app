import { Migration } from './001_initial';

/**
 * Tabela para viabilizar LOGIN OFFLINE.
 *
 * Guarda, por dispositivo, a última credencial validada com sucesso pela
 * API (e-mail, snapshot do usuário, token) e o HASH+SALT da senha (nunca a
 * senha em texto puro) usado para verificar tentativas de login sem
 * internet. É uma linha "singleton" (id fixo = 1): o app guarda apenas a
 * credencial offline do último usuário autenticado online neste aparelho,
 * o mesmo padrão de sessão única já usado em `storageKeyValue`.
 */
export const migration002AuthOffline: Migration = {
  version: 2,
  statements: [
    `CREATE TABLE IF NOT EXISTS auth_offline_credential (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      userId TEXT NOT NULL,
      email TEXT NOT NULL,
      usuario TEXT NOT NULL,
      token TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      passwordIterations INTEGER NOT NULL,
      lastOnlineLoginAt INTEGER NOT NULL
    );`,
  ],
};
