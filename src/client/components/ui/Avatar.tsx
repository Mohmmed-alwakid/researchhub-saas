import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md',
  fallback,
  className = '',
  status,
  showStatus = false
}) => {
  // Size configurations
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  // Generate fallback from name
  const generateFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayFallback = fallback || generateFallback(alt);

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'rounded-full overflow-hidden flex items-center justify-center font-medium',
        'bg-primary-100 text-primary-800',
        sizes[size]
      )}>
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error to show fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="select-none">
            {displayFallback}
          </span>
        )}
      </div>
      
      {showStatus && status && (
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
          'w-3 h-3',
          statusColors[status]
        )} />
      )}
    </div>
  );
};

export default Avatar;
