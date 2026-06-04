import React, { forwardRef } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, onClick, disabled }, ref) => {
    const className = `btn btn-${variant} btn-${size}`;
    return (
      <button ref={ref} className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
