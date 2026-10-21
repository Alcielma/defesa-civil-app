import { ReactNode } from 'react';
import './RadioGroup.css';

export interface RadioGroupProps {
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const RadioGroup = ({ label, children, helperText, error, required }: RadioGroupProps) => {
  return (
    <fieldset className="radio-group">
      <legend className="radio-group__label">
        {label}
        {required && <span className="radio-group__required" aria-hidden="true"> *</span>}
      </legend>
      {helperText && !error && (
        <p className="radio-group__helper">{helperText}</p>
      )}
      {error && <p className="radio-group__error">{error}</p>}
      <div className="radio-group__options" role="radiogroup">
        {children}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
