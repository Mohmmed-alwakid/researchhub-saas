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
  // Base styles with enhanced professional styling
  const baseStyles = 'inline-flex items-center font-medium border transition-all duration-300 transform hover:scale-105 shadow-sm backdrop-blur-sm';
  
  // Enhanced variant styles with gradients and improved colors
  const variants = {
    default: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 hover:from-blue-100 hover:to-indigo-100 shadow-blue-100/50',
    secondary: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200 hover:from-gray-100 hover:to-slate-100 shadow-gray-100/50',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200 hover:from-green-100 hover:to-emerald-100 shadow-green-100/50',
    warning: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-amber-800 border-yellow-200 hover:from-yellow-100 hover:to-orange-100 shadow-yellow-100/50',
    error: 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200 hover:from-red-100 hover:to-pink-100 shadow-red-100/50',
    info: 'bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-800 border-cyan-200 hover:from-cyan-100 hover:to-sky-100 shadow-cyan-100/50',
  };
  
  // Enhanced size styles with better proportions
  const sizes = {
    sm: 'px-2.5 py-1 text-xs rounded-full',
    md: 'px-3 py-1.5 text-sm rounded-full',
    lg: 'px-4 py-2 text-sm rounded-full',
  };

  return (
    <span 
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon && (
        <span className="mr-1.5 -ml-0.5 opacity-80" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};
