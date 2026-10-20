import { FormEvent, useEffect, useState } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import { useAuthStore } from '../../store/useAuthStore';
import { isApiError } from '../../data';
import { validarEmail } from '../../utils/validation';
import './Login.css';

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const Login = () => {
  const router = useIonRouter();
  const { login, isLoading, isAutenticado } = useAuthStore();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});

  useEffect(() => {
    if (isAutenticado) {
      router.push('/home', 'root', 'replace');
    }
  }, [isAutenticado, router]);

  const validar = () => {
    const novosErros: typeof erros = {};
    if (!email.trim()) {
      novosErros.email = 'Informe seu e-mail';
    } else if (!validarEmail(email)) {
      novosErros.email = 'E-mail inválido';
    }
    if (!senha.trim()) {
      novosErros.senha = 'Informe sua senha';
    } else if (senha.length < 6) {
      novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    try {
      setErros({});
      await login({ email, senha });
    } catch (err) {
      let mensagem = 'Falha ao entrar. Verifique suas credenciais.';
      if (isApiError(err)) {
        if (err.code === 'OFFLINE_SEM_CREDENCIAL') {
          mensagem = 'Primeiro acesso: conecte-se à internet para validar seu login neste dispositivo.';
        } else if (err.code === 'OFFLINE_SENHA_INVALIDA') {
          mensagem = 'Senha incorreta.';
        } else if (err.status === 0) {
          mensagem = 'Não foi possível conectar. Verifique sua internet e tente novamente.';
        }
      }
      setErros({ geral: mensagem });
    }
  };

  return (
    <IonPage className="login-page">
      <IonContent scrollY className="login-content">
        <div className="login-scroll">
          <div className="login-wrapper">
            <div className="login-brand">
              <div className="login-logo">
                <img
                  src="/logo-defesa-civil.png"
                  alt="Defesa Civil Garanhuns-PE"
                  draggable={false}
                />
              </div>
              <h1 className="login-title">Vistoria de Campo</h1>
              <p className="login-subtitle">
                Acesso Restrito a agentes credenciados para vistorias técnicas
              </p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <Input
                label="E-mail"
                type="email"
                placeholder="Digite seu e-mail"
                autoComplete="email"
                inputMode="email"
                leftIcon={<EmailIcon />}
                value={email}
                error={erros.email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                leftIcon={<LockIcon />}
                showPasswordToggle
                value={senha}
                error={erros.senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              {erros.geral && <div className="login-error-msg">{erros.geral}</div>}

              <div className="login-actions">
                <Button type="submit" size="xl" fullWidth loading={isLoading}>
                  Entrar
                </Button>
              </div>
            </form>

            {isLoading && (
              <div className="login-loading">
                <Loading label="Autenticando..." size="md" color="orange" />
              </div>
            )}
          </div>

          <footer className="login-footer">
            Sistema Municipal de Proteção Civil v1.0
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
