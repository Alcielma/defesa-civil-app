import { Usuario } from '../store/useAuthStore';
import {
  apiClient,
  authOfflineStore,
  env,
  isApiError,
  storageKeyValue,
  ApiError,
  setCachedToken,
} from '../data';
import { gerarHashSenha, verificarSenha } from '../utils/passwordHash';

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export type OrigemLogin = 'online' | 'offline';

export interface LoginResponse {
  token: string;
  user: Usuario;
  origem: OrigemLogin;
}

type LaravelUserShape = {
  id: number | string;
  name: string;
  email: string;
  [key: string]: unknown;
};

const EMAIL_MOCK_FALLBACK = 'agente@defesa-civil.com';
const SENHA_MOCK_FALLBACK = '123456';

const MOCK_LOGIN_HABILITADO =
  (import.meta.env.VITE_ENABLE_MOCK_LOGIN as string | undefined)?.toString().trim().toLowerCase() === 'true';

const USUARIO_MOCK_OFFLINE: Usuario = {
  id: '1',
  nome: 'Agente Credenciado',
  email: EMAIL_MOCK_FALLBACK,
  cargo: 'Técnico em Vistorias',
  matricula: 'DC-2026-001',
};

const mapearUsuario = (raw: unknown): Usuario | null => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<LaravelUserShape & { nome?: string }>;
  const id = obj.id != null ? String(obj.id) : '';
  const nome = (obj.nome as string | undefined) ?? (obj.name as string | undefined) ?? '';
  const email = (obj.email as string | undefined) ?? '';
  if (!id || !email) return null;
  return {
    id,
    nome,
    email,
    cargo: obj.cargo as string | undefined,
    matricula: obj.matricula as string | undefined,
  };
};

export interface AuthServiceInterface {
  login(email: string, senha: string): Promise<LoginResponse>;
  logout(token?: string | null): Promise<void>;
  me(): Promise<Usuario>;
}

export class AuthService implements AuthServiceInterface {
  private lerSessaoOffline(): { usuario: Usuario | null; token: string | null } {
    const usuario = storageKeyValue.getJson<Usuario>(env.OFFLINE_USER_KEY);
    const token = storageKeyValue.get(env.OFFLINE_TOKEN_KEY);
    return { usuario, token };
  }

  private salvarSessao(resposta: LoginResponse): void {
    storageKeyValue.setJson(env.OFFLINE_USER_KEY, resposta.user);
    storageKeyValue.set(env.OFFLINE_TOKEN_KEY, resposta.token);
    setCachedToken(resposta.token);
  }

  private limparSessao(): void {
    storageKeyValue.remove(env.OFFLINE_USER_KEY);
    storageKeyValue.remove(env.OFFLINE_TOKEN_KEY);
    setCachedToken(null);
  }

  /**
   * Grava a credencial de verificação offline (hash+salt da senha) após um
   * login ONLINE bem-sucedido — é o que autoriza logins offline futuros
   * para este e-mail neste dispositivo. Falhar aqui não deve impedir o
   * login online, que já foi validado pela API; por isso os erros são
   * apenas registrados e engolidos.
   */
  private async gravarCredencialOffline(email: string, senha: string, resposta: LoginResponse): Promise<void> {
    try {
      const { hash, salt, iterations } = await gerarHashSenha(senha);
      await authOfflineStore.salvar({
        userId: resposta.user.id,
        email,
        usuario: { ...resposta.user },
        token: resposta.token,
        passwordHash: hash,
        passwordSalt: salt,
        passwordIterations: iterations,
        lastOnlineLoginAt: Date.now(),
      });
    } catch (e) {
      console.warn('Não foi possível salvar a credencial de login offline.', e);
    }
  }

  /**
   * Login sem conexão com a API: só é aceito se este dispositivo já tiver
   * uma credencial offline gravada (por um login online anterior) para o
   * mesmo e-mail, e a senha informada bater com o hash salvo.
   */
  private async tentarLoginOffline(email: string, senha: string): Promise<LoginResponse> {
    const credencial = await authOfflineStore.ler();
    if (!credencial || credencial.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw {
        message: 'Primeiro acesso: conecte-se à internet para validar seu login neste dispositivo.',
        status: 401,
        code: 'OFFLINE_SEM_CREDENCIAL',
      } as ApiError;
    }

    const senhaValida = await verificarSenha(senha, {
      hash: credencial.passwordHash,
      salt: credencial.passwordSalt,
      iterations: credencial.passwordIterations,
    });
    if (!senhaValida) {
      throw { message: 'Senha incorreta.', status: 401, code: 'OFFLINE_SENHA_INVALIDA' } as ApiError;
    }

    const usuario = mapearUsuario(credencial.usuario);
    if (!usuario) {
      throw { message: 'Dados de usuário offline corrompidos.', status: 500 } as ApiError;
    }

    const sessao: LoginResponse = { token: credencial.token, user: usuario, origem: 'offline' };
    this.salvarSessao(sessao);
    return sessao;
  }

  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      const payload: LoginPayload = { email, password: senha, device_name: 'app-vistorias-web' };
      const resposta = await apiClient.request<{
        message?: string;
        token?: string;
        user?: unknown;
        data?: { token?: string; user?: unknown };
      }>('/login', {
        method: 'POST',
        body: payload,
        authenticated: false,
        timeoutMs: 20_000,
      });

      const token = resposta?.token ?? resposta?.data?.token;
      const userRaw = resposta?.user ?? resposta?.data?.user;
      const usuario = mapearUsuario(userRaw);

      if (token && usuario) {
        const sessao: LoginResponse = { token, user: usuario, origem: 'online' };
        this.salvarSessao(sessao);
        // Não bloqueia a entrada no app: isso só prepara o acesso offline
        // futuro (hash PBKDF2 + gravação no SQLite, que na primeira vez
        // também inicializa a conexão) e pode rodar em segundo plano.
        void this.gravarCredencialOffline(email, senha, sessao);
        return sessao;
      }

      throw { message: resposta?.message || 'Resposta inválida da API de login.', status: 500 } as ApiError;
    } catch (err) {
      // A API respondeu (senha rejeitada, validação, etc.) — não é falta de
      // conectividade, então o erro real é propagado em vez de cair para o
      // fallback offline (senão qualquer senha errada online "vazaria" para
      // uma tentativa de login offline).
      if (isApiError(err) && err.status !== 0) {
        throw err;
      }

      try {
        return await this.tentarLoginOffline(email, senha);
      } catch (erroOffline) {
        const mockValido =
          MOCK_LOGIN_HABILITADO &&
          email.toLowerCase() === EMAIL_MOCK_FALLBACK &&
          senha === SENHA_MOCK_FALLBACK;
        if (mockValido) {
          const offline = this.lerSessaoOffline();
          const sessao: LoginResponse = {
            token: offline.token ?? `offline-token-${Date.now()}`,
            user: offline.usuario ?? USUARIO_MOCK_OFFLINE,
            origem: 'offline',
          };
          this.salvarSessao(sessao);
          return sessao;
        }
        throw erroOffline;
      }
    }
  }

  async logout(tokenAtual?: string | null): Promise<void> {
    const token = tokenAtual ?? this.lerSessaoOffline().token;
    try {
      if (token) {
        await apiClient
          .post('/logout', undefined, { timeoutMs: 6000 })
          .catch(() => undefined);
      }
    } finally {
      this.limparSessao();
    }
  }

  async me(): Promise<Usuario> {
    try {
      const raw = await apiClient.get<unknown | { data: unknown }>('/user', { timeoutMs: 8000 });
      const resolved = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data: unknown }).data : raw;
      const usuario = mapearUsuario(resolved);
      if (usuario) {
        storageKeyValue.setJson(env.OFFLINE_USER_KEY, usuario);
        return usuario;
      }
      throw { message: 'Dados de usuário inválidos.', status: 500 } as ApiError;
    } catch {
      const { usuario } = this.lerSessaoOffline();
      if (usuario) return usuario;
      throw { message: 'Sessão offline não encontrada.', status: 401 } as ApiError;
    }
  }
}

export const authService = new AuthService();
