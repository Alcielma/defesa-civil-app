import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import '../Input/Input.css';
import './TextArea.css';

/**
 * Campo de texto com várias linhas, com o mesmo visual do `Input`.
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label exibida ACIMA do campo. */
  label?: string;
  /** Mensagem de erro (texto em vermelho, campo com borda vermelha). */
  error?: string;
  /** Texto de ajuda exibido ABAIXO do campo (só aparece se não houver erro). */
  helperText?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, id, rows = 5, className = '', disabled, ...rest }, ref) => {
    const idGerado = useId();
    const textAreaId = id || idGerado;

    const classes = [
      'app-input-wrapper',
      'app-input-wrapper--full',
      'app-textarea',
      error ? 'app-input-wrapper--error' : '',
      disabled ? 'app-input-wrapper--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={classes}>
        {label && (
          <label className="app-input__label" htmlFor={textAreaId}>
            {label}
          </label>
        )}
        <div className="app-input__container">
          <textarea
            ref={ref}
            id={textAreaId}
            rows={rows}
            className="app-input__field app-textarea__field"
            disabled={disabled}
            {...rest}
          />
        </div>
        {error && <span className="app-input__error">{error}</span>}
        {!error && helperText && <span className="app-input__helper">{helperText}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;
