import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  elevated?: boolean;
}

function Card({ title, description, children, onClick, elevated = false, ref }: CardProps & { ref?: React.Ref<HTMLDivElement> }) {
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

export default Card;
