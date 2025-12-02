'use client';

import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'selected' | 'interactive';
  onClick?: () => void;
}

function Card({ children, className = '', variant = 'default', onClick }: CardProps) {
  const baseStyles = 'rounded-xl border-2 transition-all duration-150';

  const variantStyles = {
    default: 'border-[var(--color-light)] bg-white',
    selected: 'border-[var(--color-teal)] bg-[var(--color-teal-light)]',
    interactive:
      'border-[var(--color-light)] bg-white hover:border-[var(--color-medium)] cursor-pointer',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${onClick ? 'w-full text-left' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b border-[var(--color-light)] ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export { Card, CardHeader, CardContent };
export type { CardProps };
