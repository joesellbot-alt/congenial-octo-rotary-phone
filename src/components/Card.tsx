import React, { forwardRef } from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  elevated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, children, onClick, elevated = false }, ref) => {
    return (
      <div
        ref={ref}
        className={`card ${elevated ? 'card-elevated' : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-description">{description}</p>}
        {children && <div className="card-content">{children}</div>}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
