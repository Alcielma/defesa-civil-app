import { env } from './env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  raw?: unknown;
  /**
   * Marcador opcional para distinguir motivos específicos de falha que não
   * têm um status HTTP correspondente claro (ex: login offline sem
   * credencial local ainda validada). Usado pela UI para mensagens
   * precisas; ausente em erros vindos diretamente da API.
   */
  code?: string;
}

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === 'object' && e !== null && 'message' in e && 'status' in e;

export type TokenProvider = () => string | null;

let tokenProviderFn: TokenProvider | null = null;
let cachedToken: string | null = null;

export const setTokenProvider = (provider: TokenProvider | null): void => {
  tokenProviderFn = provider;
  cachedToken = provider ? provider() : null;
};

export const setCachedToken = (token: string | null): void => {
  cachedToken = token;
};

const readToken = (): string | null => {
  if (tokenProviderFn) {
    try {
      cachedToken = tokenProviderFn();
    } catch {
      /* ignore */
    }
  }
  return cachedToken;
};

const buildUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${env.API_BASE}${clean}`;
};

const buildHeaders = (authenticated: boolean, json: boolean): HeadersInit => {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (json) headers['Content-Type'] = 'application/json';
  const token = readToken();
  if (authenticated && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

class ApiClient {
  private csrfFetched = false;

  private async maybeFetchCsrfCookie(signal?: AbortSignal) {
    if (this.csrfFetched) return;
    if (!env.API_URL) return;
    try {
      await fetch(`${env.API_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal,
      });
    } catch {
      /* pode não existir em APIs só token */
    } finally {
      this.csrfFetched = true;
    }
  }

  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      authenticated = true,
      headers: extraHeaders = {},
      timeoutMs = 15_000,
      signal: userSignal,
    } = options;

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
    userSignal?.addEventListener('abort', () => ctrl.abort());

    const isJson = body !== undefined && !(body instanceof FormData);

    try {
      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        await this.maybeFetchCsrfCookie(ctrl.signal);
      }
      const res = await fetch(buildUrl(path), {
        method,
        headers: { ...buildHeaders(authenticated, isJson), ...extraHeaders },
        body: body === undefined ? undefined : isJson ? JSON.stringify(body) : (body as BodyInit),
        credentials: 'same-origin',
        signal: ctrl.signal,
      });

      let data: unknown = null;
      const text = await res.text();
      if (text.length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!res.ok) {
        const err = (data as { message?: string; errors?: Record<string, string[]> } | null) ?? {};
        const apiError: ApiError = {
          message:
            err.message ||
            (typeof data === 'string' && data.length > 0 ? data : `Erro HTTP ${res.status}`),
          status: res.status,
          errors: err.errors,
          raw: data,
        };
        throw apiError;
      }

      return data as T;
    } catch (e) {
      if (isApiError(e)) throw e;
      if ((e as { name?: string })?.name === 'AbortError') {
        throw { message: 'Tempo de conexão esgotado.', status: 0 } as ApiError;
      }
      throw {
        message:
          'Falha de conexão com a API. Verifique sua internet e se o backend está rodando.',
        status: 0,
        raw: e,
      } as ApiError;
    } finally {
      clearTimeout(timeout);
    }
  }

  get<T = unknown>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'GET' });
  }

  post<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'POST', body });
  }

  put<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'PUT', body });
  }

  patch<T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'PATCH', body });
  }

  del<T = unknown>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...opts, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
