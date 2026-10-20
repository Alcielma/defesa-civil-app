import {
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useState,
} from 'react';
import './Input.css';

/**
 * Alturas pré-definidas do campo de entrada.
 * - `sm` : 36px (compacto)
 * - `md` : 44px (padrão para formulários simples)
 * - `lg` : 56px (padrão do app - ideal para toque em mobile)
 */
export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Propriedades do componente Input.
 * Usa `Omit` para sobrescrever o atributo nativo `size` (que é `number` em HTML5)
 * pelo nosso `InputSize` customizado.
 *
 * Estende todos os atributos nativos de `<input>` (value, onChange, placeholder, type, etc).
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label exibida ACIMA do campo. */
  label?: string;
  /** Mensagem de erro (texto em vermelho, campo com borda vermelha). */
  error?: string;
  /** Texto de ajuda exibido ABAIXO do campo (só aparece se não houver erro). */
  helperText?: string;
  /** Altura do campo. Default: `lg`. */
  size?: InputSize;
  /** Ícone exibido no início do campo (esquerda). */
  leftIcon?: ReactNode;
  /** Ícone exibido no fim do campo (direita) — ignorado se `showPasswordToggle = true`. */
  rightIcon?: ReactNode;
  /** Quando `true` E `type = password`, exibe botão de 👁️ para alternar visibilidade da senha. */
  showPasswordToggle?: boolean;
  /** Quando `true`, o campo ocupa 100% da largura do container. Default: `true`. */
  fullWidth?: boolean;
}

/**
 * Ícone inline: "Olho aberto" — usado no toggle de senha quando a senha ESTÁ visível.
 */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/**
 * Ícone inline: "Olho riscado" — usado no toggle de senha quando a senha NÃO está visível.
 */
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);

/**
 * Componente de campo de entrada reutilizável.
 *
 * Features:
 * - Label flutuante acima do campo
 * - Validação visual (`error`) com cor + borda
 * - Texto de ajuda (`helperText`)
 * - Ícones customizáveis (esquerda / direita)
 * - **Toggle de senha embutido** (olho 👁️) quando `type = password` e `showPasswordToggle`
 * - Suporte a `forwardRef` (passa ref direto pro `<input>` nativo — útil para foco programático)
 * - Gerador automático de `id` caso não informado (mantém acessibilidade label ↔ input)
 *
 * @example
 * import Input from '../../components/Input';
 *
 * // Campo de e-mail com ícone e validação
 * <Input
 *   label="E-mail"
 *   type="email"
 *   placeholder="voce@exemplo.com"
 *   leftIcon={<EmailIcon />}
 *   value={email}
 *   error={erroEmail}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * // Campo de senha com botão "ver senha"
 * <Input
 *   label="Senha"
 *   type="password"
 *   showPasswordToggle
 *   value={senha}
 *   onChange={(e) => setSenha(e.target.value)}
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'lg',
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = true,
      type = 'text',
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    const isPassword = type === 'password';
    const finalType =
      isPassword && showPassword ? 'text' : type;

    const classes = [
      'app-input-wrapper',
      `app-input-wrapper--${size}`,
      fullWidth ? 'app-input-wrapper--full' : '',
      error ? 'app-input-wrapper--error' : '',
      disabled ? 'app-input-wrapper--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes}>
        {label && (
          <label className="app-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div className="app-input__container">
          {leftIcon && <span className="app-input__icon app-input__icon--left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={finalType}
            className="app-input__field"
            disabled={disabled}
            {...rest}
          />
          {rightIcon && !showPasswordToggle && (
            <span className="app-input__icon app-input__icon--right">{rightIcon}</span>
          )}
          {showPasswordToggle && isPassword && (
            <button
              type="button"
              className="app-input__icon app-input__icon--right app-input__toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && <span className="app-input__error">{error}</span>}
        {!error && helperText && <span className="app-input__helper">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
