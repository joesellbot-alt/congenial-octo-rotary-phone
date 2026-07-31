import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

function Tooltip({ content, position = 'top', children, ref }: TooltipProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      ref={ref}
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>{content}</div>
      )}
    </div>
  );
}

export default Tooltip;
