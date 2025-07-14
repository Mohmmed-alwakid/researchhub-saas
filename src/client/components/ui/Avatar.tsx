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
  // Size configurations with enhanced proportions
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl'
  };

  // Enhanced status colors with gradients
  const statusColors = {
    online: 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-200',
    offline: 'bg-gradient-to-r from-gray-400 to-slate-500 shadow-gray-200',
    busy: 'bg-gradient-to-r from-red-400 to-pink-500 shadow-red-200',
    away: 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-200'
  };

  // Generate fallback from name
  const generateFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayFallback = fallback || generateFallback(alt);

  return (
    <div className={cn('relative inline-block', className)}>
      <div className={cn(
        'rounded-full overflow-hidden flex items-center justify-center font-semibold transition-all duration-300 transform hover:scale-110 shadow-lg',
        'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-200',
        'hover:from-blue-200 hover:to-indigo-200 hover:shadow-xl',
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
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white shadow-lg',
          'w-4 h-4 animate-pulse',
          statusColors[status]
        )} 
        aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

export default Avatar;
