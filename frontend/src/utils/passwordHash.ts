/**
 * Hash de senha para verificação de LOGIN OFFLINE.
 *
 * Usa PBKDF2-SHA256 via Web Crypto (`crypto.subtle`), disponível nativamente
 * em WebViews modernas do Capacitor (iOS/Android) e em qualquer navegador —
 * não depende de nenhum plugin nativo adicional.
 *
 * Nunca a senha em texto puro é persistida — apenas hash + salt (ambos
 * necessários para reconstruir a verificação, nenhum dos dois reversível
 * para a senha original).
 */

const ITERATIONS_PADRAO = 150_000;
const TAMANHO_HASH_BITS = 256;
const TAMANHO_SALT_BYTES = 16;

export interface SenhaHash {
  hash: string;
  salt: string;
  iterations: number;
}

const bytesParaBase64 = (bytes: Uint8Array): string => {
  let binario = '';
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario);
};

const base64ParaBytes = (base64: string): Uint8Array => {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
};

const derivarBits = async (senha: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> => {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    material,
    TAMANHO_HASH_BITS
  );
  return new Uint8Array(bits);
};

/**
 * Gera hash + salt novos para uma senha (usado após login online bem-sucedido).
 */
export const gerarHashSenha = async (senha: string, iterations = ITERATIONS_PADRAO): Promise<SenhaHash> => {
  const salt = crypto.getRandomValues(new Uint8Array(TAMANHO_SALT_BYTES));
  const derivado = await derivarBits(senha, salt, iterations);
  return {
    hash: bytesParaBase64(derivado),
    salt: bytesParaBase64(salt),
    iterations,
  };
};

/**
 * Recalcula o hash da senha informada com o salt/iterações armazenados e
 * compara com o hash salvo. `true` só quando a senha bate exatamente.
 */
export const verificarSenha = async (senha: string, armazenado: SenhaHash): Promise<boolean> => {
  const salt = base64ParaBytes(armazenado.salt);
  const derivado = await derivarBits(senha, salt, armazenado.iterations);
  const calculado = bytesParaBase64(derivado);
  return calculado === armazenado.hash;
};
