import { ReactNode, useId } from 'react';
import './CheckboxOption.css';

export interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftIcon?: ReactNode;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

const CheckMarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckboxOption = ({
  label,
  checked,
  onChange,
  leftIcon,
  disabled,
  helperText,
  error,
}: CheckboxOptionProps) => {
  const inputId = useId();

  return (
    <label
      className={[
        'checkbox-option',
        checked ? 'checkbox-option--checked' : '',
        disabled ? 'checkbox-option--disabled' : '',
        error ? 'checkbox-option--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        id={inputId}
        type="checkbox"
        className="checkbox-option__native"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="checkbox-option__box" aria-hidden="true">
        {checked && (
          <span className="checkbox-option__check">
            <CheckMarkIcon />
          </span>
        )}
      </span>
      {leftIcon && (
        <span className="checkbox-option__icon" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="checkbox-option__content">
        <span className="checkbox-option__label">{label}</span>
        {helperText && !error && (
          <span className="checkbox-option__helper">{helperText}</span>
        )}
        {error && <span className="checkbox-option__error">{error}</span>}
      </span>
    </label>
  );
};

export default CheckboxOption;
