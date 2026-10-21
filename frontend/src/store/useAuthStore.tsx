import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { authService } from '../services/AuthService';
import { env, storageKeyValue, setTokenProvider, setCachedToken } from '../data';
import { networkAdapter } from '../sync';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  matricula?: string;
}

export interface Credenciais {
  email: string;
  senha: string;
}

/**
 * De onde veio a sessão atual do usuário:
 * - `restaurada`: app abriu e já havia uma sessão salva localmente (nenhum login novo nesta execução).
 * - `online`: login mais recente foi validado contra a API.
 * - `offline`: login mais recente foi aceito via credencial offline (sem conexão com a API).
 * - `null`: nenhuma sessão ativa (ex: logout, ou app nunca autenticado neste dispositivo).
 */
export type OrigemSessao = 'restaurada' | 'online' | 'offline' | null;

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  isAutenticado: boolean;
  isLoading: boolean;
  statusSessao: 'online' | 'offline' | 'indefinido';
  origemSessao: OrigemSessao;
  login: (credenciais: Credenciais) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const lerArmazenamento = (): { usuario: Usuario | null; token: string | null } => {
  const usuario = storageKeyValue.getJson<Usuario>(env.OFFLINE_USER_KEY);
  const token = storageKeyValue.get(env.OFFLINE_TOKEN_KEY);
  return { usuario, token };
};

const salvarArmazenamento = (usuario: Usuario, token: string) => {
  storageKeyValue.setJson(env.OFFLINE_USER_KEY, usuario);
  storageKeyValue.set(env.OFFLINE_TOKEN_KEY, token);
};

const limparArmazenamento = () => {
  storageKeyValue.remove(env.OFFLINE_USER_KEY);
  storageKeyValue.remove(env.OFFLINE_TOKEN_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [dadosIniciais] = useState(() => lerArmazenamento());
  const [usuario, setUsuario] = useState<Usuario | null>(dadosIniciais.usuario);
  const [token, setToken] = useState<string | null>(dadosIniciais.token);
  const [isLoading, setIsLoading] = useState(false);
  const [statusSessao, setStatusSessao] = useState<'online' | 'offline' | 'indefinido'>('indefinido');
  const [origemSessao, setOrigemSessao] = useState<OrigemSessao>(() =>
    dadosIniciais.usuario && dadosIniciais.token ? 'restaurada' : null
  );

  useEffect(() => {
    setTokenProvider(() => storageKeyValue.get(env.OFFLINE_TOKEN_KEY));
    setCachedToken(dadosIniciais.token);
  }, [dadosIniciais.token]);

  useEffect(() => {
    const inicializar = async () => {
      const s = await networkAdapter.refreshStatus();
      setStatusSessao(s);
      if (usuario && token && s === 'online') {
        try {
          const atualizado = await authService.me();
          if (atualizado.id !== usuario.id || atualizado.nome !== usuario.nome) {
            setUsuario(atualizado);
            salvarArmazenamento(atualizado, token);
          }
        } catch {
          /* continua com o usuário offline salvo */
        }
      }
    };
    inicializar();
    return networkAdapter.subscribe((s) => setStatusSessao(s));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async ({ email, senha }: Credenciais) => {
    setIsLoading(true);
    try {
      const resposta = await authService.login(email, senha);
      salvarArmazenamento(resposta.user, resposta.token);
      setUsuario(resposta.user);
      setToken(resposta.token);
      setOrigemSessao(resposta.origem);
      setStatusSessao(networkAdapter.status());
    } catch (err) {
      limparArmazenamento();
      setUsuario(null);
      setToken(null);
      setOrigemSessao(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout(token);
    } finally {
      limparArmazenamento();
      setUsuario(null);
      setToken(null);
      setOrigemSessao(null);
      setIsLoading(false);
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const atualizado = await authService.me();
      setUsuario(atualizado);
      salvarArmazenamento(atualizado, token);
    } catch {
      /* ignora */
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      token,
      isAutenticado: !!usuario && !!token,
      isLoading,
      statusSessao,
      origemSessao,
      login,
      logout,
      refreshUser,
    }),
    [usuario, token, isLoading, statusSessao, origemSessao, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthStore = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthStore deve ser usado dentro de AuthProvider');
  }
  return ctx;
};
