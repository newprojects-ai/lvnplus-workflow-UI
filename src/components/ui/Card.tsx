import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  footer?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'default' | 'outline' | 'filled';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  footer,
  onClick,
  hoverable = false,
  variant = 'default'
}) => {
  const baseStyles = 'rounded-lg overflow-hidden transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white shadow-sm border border-gray-200',
    outline: 'border border-gray-200 bg-transparent',
    filled: 'bg-gray-50 border border-gray-200',
  };
  
  const hoverStyles = hoverable ? 'cursor-pointer hover:shadow-md transform hover:-translate-y-1' : '';
  
  const cardStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${hoverStyles}
    ${className}
  `;

  return (
    <div 
      className={cardStyles}
      onClick={onClick}
    >
      {title && (
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;