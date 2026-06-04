import React, { forwardRef, useRef, useImperativeHandle } from 'react';

interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export interface InputHandle {
  focus: () => void;
  clear: () => void;
}

const Input = forwardRef<InputHandle, InputProps>(
  ({ label, type = 'text', placeholder, value, onChange, error }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
    }));

    return (
      <div className="input-group">
        <label>{label}</label>
        <input
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? 'input-error' : ''}
        />
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
