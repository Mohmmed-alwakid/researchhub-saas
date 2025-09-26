import React from 'react';
import { Loader2, Zap } from 'lucide-react';


interface LoadingProps {
  variant?: 'default' | 'page' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  showIcon?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  variant = 'default', 
  size = 'md', 
  text, 
  subtext, 
  showIcon = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-6 h-6';
      case 'lg': return 'w-8 h-8';
      default: return 'w-6 h-6';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const spinner = (
    <Loader2 className={`${getSizeClasses()} text-blue-600 animate-spin`} />
  );

  const content = (
    <div className="flex flex-col items-center space-y-2">
      {showIcon && (
        <div className="flex items-center space-x-2">
          {spinner}
          <Zap className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} text-blue-500`} />
        </div>
      )}
      {text && (
        <div className={`font-medium text-gray-700 ${getTextSizeClasses()}`}>
          {text}
        </div>
      )}
      {subtext && (
        <div className={`text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
          {subtext}
        </div>
      )}
    </div>
  );

  switch (variant) {
    case 'page':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            {content}
          </div>
        </div>
      );

    case 'overlay':
      return (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            {content}
          </div>
        </div>
      );

    case 'inline':
      return (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            {showIcon && spinner}
            {text && <span className={`text-gray-600 ${getTextSizeClasses()}`}>{text}</span>}
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            {content}
          </div>
        </div>
      );
  }
};

export default Loading;

// Specialized loading components
export const PageLoading: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <Loading variant="page" size="lg" text={text} showIcon />
);

export const InlineLoading: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  text = "Loading...", 
  size = 'sm' 
}) => (
  <Loading variant="inline" size={size} text={text} showIcon />
);

export const OverlayLoading: React.FC<{ text?: string; subtext?: string }> = ({ 
  text = "Loading...", 
  subtext 
}) => (
  <Loading variant="overlay" size="md" text={text} subtext={subtext} showIcon />
);

// Loading skeleton components for better perceived performance
export const LoadingSkeleton: React.FC<{ 
  className?: string; 
  animate?: boolean;
}> = ({ className = '', animate = true }) => (
  <div 
    className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`} 
  />
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="space-y-3">
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-20 w-full" />
      <div className="flex space-x-2">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex space-x-4 p-4 animate-pulse">
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-4 w-1/3" />
        <LoadingSkeleton className="h-4 w-1/4" />
        <LoadingSkeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);
