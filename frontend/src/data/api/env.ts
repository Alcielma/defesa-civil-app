const readEnv = (key: string, fallback = ''): string => {
  const val = (import.meta as unknown as { env: Record<string, string | undefined> }).env?.[key];
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
};

export const env = {
  API_URL: (() => {
    const raw = readEnv('VITE_API_URL', 'http://127.0.0.1:8001');
    return raw.replace(/\/$/, '');
  })(),
  API_PREFIX: readEnv('VITE_API_PREFIX', '/api'),
  get API_BASE(): string {
    return `${this.API_URL}${this.API_PREFIX}`;
  },
  SOCKET_URL: readEnv('VITE_SOCKET_URL'),
  STORAGE_DB_NAME: readEnv('VITE_STORAGE_DB', 'defesa_civil_db'),
  STORAGE_DB_VERSION: Number(readEnv('VITE_STORAGE_DB_VERSION', '1')) || 1,
  OFFLINE_TOKEN_KEY: 'defesa_civil_token',
  OFFLINE_USER_KEY: 'defesa_civil_usuario',
};
