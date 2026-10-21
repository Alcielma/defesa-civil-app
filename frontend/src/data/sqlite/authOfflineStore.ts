import { getDb } from './connection';

/**
 * Credencial offline de um dispositivo: a última autenticação online
 * bem-sucedida, guardada para permitir login sem internet depois.
 * `usuario` fica como blob genérico (mesmo padrão de `payload` em
 * `localDb.ts`) para não acoplar esta camada de dados ao tipo `Usuario`
 * da camada de store/serviços.
 */
export interface AuthOfflineCredential {
  userId: string;
  email: string;
  usuario: Record<string, unknown>;
  token: string;
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
  lastOnlineLoginAt: number;
}

type AuthOfflineSqlRow = {
  userId: string;
  email: string;
  usuario: string;
  token: string;
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
  lastOnlineLoginAt: number;
};

const fromSql = (row: AuthOfflineSqlRow): AuthOfflineCredential => ({
  userId: row.userId,
  email: row.email,
  usuario: JSON.parse(row.usuario) as Record<string, unknown>,
  token: row.token,
  passwordHash: row.passwordHash,
  passwordSalt: row.passwordSalt,
  passwordIterations: row.passwordIterations,
  lastOnlineLoginAt: row.lastOnlineLoginAt,
});

export const authOfflineStore = {
  /**
   * Grava (substituindo a anterior) a credencial offline do dispositivo.
   * Só deve ser chamado após uma autenticação ONLINE bem-sucedida.
   */
  async salvar(credencial: AuthOfflineCredential): Promise<void> {
    const db = await getDb();
    await db.run(
      `INSERT OR REPLACE INTO auth_offline_credential
        (id, userId, email, usuario, token, passwordHash, passwordSalt, passwordIterations, lastOnlineLoginAt)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        credencial.userId,
        credencial.email.toLowerCase(),
        JSON.stringify(credencial.usuario),
        credencial.token,
        credencial.passwordHash,
        credencial.passwordSalt,
        credencial.passwordIterations,
        credencial.lastOnlineLoginAt,
      ]
    );
  },

  async ler(): Promise<AuthOfflineCredential | undefined> {
    const db = await getDb();
    const res = await db.query('SELECT * FROM auth_offline_credential WHERE id = 1 LIMIT 1;');
    const row = (res.values ?? [])[0] as AuthOfflineSqlRow | undefined;
    return row ? fromSql(row) : undefined;
  },

  async limpar(): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM auth_offline_credential WHERE id = 1;');
  },
};
