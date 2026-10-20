import { ReactNode } from 'react';
import './CheckboxGroup.css';

export interface CheckboxGroupProps {
  label: string;
  children: ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
}

const CheckboxGroup = ({ label, children, helperText, error, required }: CheckboxGroupProps) => {
  return (
    <fieldset className="checkbox-group">
      <legend className="checkbox-group__label">
        {label}
        {required && <span className="checkbox-group__required" aria-hidden="true"> *</span>}
      </legend>
      {helperText && !error && (
        <p className="checkbox-group__helper">{helperText}</p>
      )}
      {error && <p className="checkbox-group__error">{error}</p>}
      <div className="checkbox-group__options" role="group">
        {children}
      </div>
    </fieldset>
  );
};

export default CheckboxGroup;
