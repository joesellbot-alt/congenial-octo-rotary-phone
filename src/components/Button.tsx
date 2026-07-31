import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function Button({ variant = 'primary', size = 'md', children, onClick, disabled, ref }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const className = `btn btn-${variant} btn-${size}`;
  return (
    <button ref={ref} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
