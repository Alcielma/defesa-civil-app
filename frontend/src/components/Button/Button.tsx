import { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

/**
 * Estilos visuais do botão.
 * - `primary`    : fundo laranja sólido (CTA principal)
 * - `secondary`  : fundo azul escuro (ação secundária)
 * - `outline`    : fundo transparente com borda
 * - `ghost`      : fundo transparente sem borda
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Tamanhos pré-definidos do botão.
 * - `sm` : 32px de altura (ícones / ações pequenas)
 * - `md` : 44px de altura (padrão)
 * - `lg` : 56px de altura (destacado em formulários)
 * - `xl` : 64px de altura (CTA grande, ex: "Entrar" no login)
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Propriedades do componente Button.
 * Estende todos os atributos nativos de `<button>` (onClick, type, disabled, etc).
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Conteúdo do botão (texto, emoji, etc). */
  children: ReactNode;
  /** Estilo visual do botão. Default: `primary`. */
  variant?: ButtonVariant;
  /** Altura pré-definida. Default: `md`. */
  size?: ButtonSize;
  /** Quando `true`, o botão ocupa 100% da largura do container. Default: `false`. */
  fullWidth?: boolean;
  /** Quando `true`, mostra spinner interno e desativa o clique. Default: `false`. */
  loading?: boolean;
  /** Ícone exibido ANTES do texto (esquerda). */
  leftIcon?: ReactNode;
  /** Ícone exibido DEPOIS do texto (direita). */
  rightIcon?: ReactNode;
}

/**
 * Componente de botão reutilizável com múltiplas variantes, tamanhos e estado de loading.
 * Acessibilidade: `aria-busy` implícito via `loading`, label em texto dentro do span.
 *
 * @example
 * import Button from '../../components/Button';
 *
 * // Botão primário padrão
 * <Button onClick={() => alert('Olá!')}>Clique aqui</Button>
 *
 * // Botão de submit com loading
 * <Button type="submit" size="lg" loading={isLoading}>Salvar</Button>
 *
 * // Botão com ícone à esquerda
 * <Button leftIcon={<PlusIcon />}>Novo Registro</Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...rest
}: ButtonProps) => {
  const classes = [
    'app-button',
    `app-button--${variant}`,
    `app-button--${size}`,
    fullWidth ? 'app-button--full' : '',
    loading ? 'app-button--loading' : '',
    disabled ? 'app-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="app-button__spinner" aria-hidden="true" />
      ) : (
        <>
          {leftIcon && <span className="app-button__icon--left">{leftIcon}</span>}
          <span className="app-button__label">{children}</span>
          {rightIcon && <span className="app-button__icon--right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
