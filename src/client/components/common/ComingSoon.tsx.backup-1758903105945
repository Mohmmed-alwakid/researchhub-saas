import React from 'react';
import { Clock, Star, Zap, AlertCircle } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  expectedRelease?: string;
  features?: string[];
  variant?: 'banner' | 'card' | 'overlay' | 'inline';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  expectedRelease,
  features = [],
  variant = 'card',
  size = 'medium',
  showIcon = true,
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'banner':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4';
      case 'card':
        return 'bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center';
      case 'overlay':
        return 'absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10';
      case 'inline':
        return 'bg-yellow-50 border border-yellow-200 rounded-md p-3';
      default:
        return 'bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  return (
    <div className={`${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {showIcon && (
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Clock 
              size={getIconSize()} 
              className="text-blue-500 animate-pulse" 
            />
            <Zap 
              size={getIconSize() / 2} 
              className="absolute -top-1 -right-1 text-yellow-500 animate-bounce" 
            />
          </div>
        </div>
      )}
      
      <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
        <Star size={16} className="text-blue-500" />
        {title}
        <Star size={16} className="text-blue-500" />
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-4">
          {description}
        </p>
      )}
      
      {features.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Upcoming Features:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {expectedRelease && (
        <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full inline-flex items-center gap-2">
          <AlertCircle size={14} />
          Expected: {expectedRelease}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        This feature is currently under development and will be available soon!
      </div>
    </div>
  );
};

// Preset configurations for common use cases
export const ComingSoonBanner: React.FC<Pick<ComingSoonProps, 'title' | 'description'>> = ({ title, description }) => (
  <ComingSoon 
    title={title}
    description={description}
    variant="banner"
    size="small"
    showIcon={false}
  />
);

export const ComingSoonOverlay: React.FC<Pick<ComingSoonProps, 'title' | 'description'>> = ({ title, description }) => (
  <ComingSoon 
    title={title}
    description={description}
    variant="overlay"
    size="large"
  />
);

export const ComingSoonCard: React.FC<ComingSoonProps> = (props) => (
  <ComingSoon {...props} variant="card" />
);
