import { ReactNode, useId } from 'react';
import './RadioOption.css';

export interface RadioOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  value?: string;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  rightSlot?: ReactNode;
}

const RadioOption = ({
  label,
  checked,
  onChange,
  disabled,
  helperText,
  error,
}: RadioOptionProps) => {
  const inputId = useId();

  return (
    <label
      className={[
        'radio-option',
        checked ? 'radio-option--checked' : '',
        disabled ? 'radio-option--disabled' : '',
        error ? 'radio-option--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        id={inputId}
        type="radio"
        className="radio-option__native"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="radio-option__circle" aria-hidden="true">
        {checked && <span className="radio-option__dot" aria-hidden="true" />}
      </span>
      <span className="radio-option__content">
        <span className="radio-option__label">{label}</span>
        {helperText && !error && (
          <span className="radio-option__helper">{helperText}</span>
        )}
        {error && <span className="radio-option__error">{error}</span>}
      </span>
    </label>
  );
};

export default RadioOption;
