import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
  icon
}) => {
  // Base styles using design tokens approach
  const baseStyles = 'inline-flex items-center font-medium border transition-colors duration-200';
  
  // Variant styles using consistent token naming
  const variants = {
    default: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    info: 'bg-info-100 text-info-800 border-info-200',
  };
  
  // Size styles using spacing tokens
  const sizes = {
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-2.5 py-0.5 text-xs rounded-full',
    lg: 'px-3 py-1 text-sm rounded-full',
  };

  return (
    <span 
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && (
        <span className="mr-1.5 -ml-0.5" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};
