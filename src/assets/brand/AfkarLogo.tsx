import React from 'react';

interface AfkarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
}

/**
 * Afkar Logo Component
 * 
 * @param variant - 'full' for logo with text, 'icon' for symbol only
 * @param size - Predefined sizes or use className for custom sizing
 * @param className - Additional CSS classes
 */
export const AfkarLogo: React.FC<AfkarLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: variant === 'full' ? 'h-6 w-auto' : 'h-4 w-4',
    md: variant === 'full' ? 'h-8 w-auto' : 'h-6 w-6', 
    lg: variant === 'full' ? 'h-12 w-auto' : 'h-8 w-8',
    xl: variant === 'full' ? 'h-16 w-auto' : 'h-12 w-12'
  };

  const logoSrc = variant === 'full' ? '/Afkar SVG.svg' : '/afkar-icon.svg';
  
  return (
    <img 
      src={logoSrc} 
      alt="Afkar" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default AfkarLogo;
