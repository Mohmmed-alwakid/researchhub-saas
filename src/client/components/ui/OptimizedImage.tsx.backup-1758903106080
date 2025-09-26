import React, { useState } from 'react';

/**
 * Optimized image component with lazy loading and responsive images
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError,
  fallbackSrc = '/placeholder-image.svg'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  // Generate responsive srcSet for common breakpoints with WebP support
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes('placeholder') || baseSrc.includes('data:')) {
      return undefined;
    }
    
    const ext = baseSrc.split('.').pop();
    const basePath = baseSrc.replace(`.${ext}`, '');
    
    // Generate both WebP and original format sources
    const webpSources = [
      `${basePath}-320w.webp 320w`,
      `${basePath}-640w.webp 640w`,
      `${basePath}-1024w.webp 1024w`,
      `${basePath}-1280w.webp 1280w`
    ].join(', ');
    
    const fallbackSources = [
      `${basePath}-320w.${ext} 320w`,
      `${basePath}-640w.${ext} 640w`,
      `${basePath}-1024w.${ext} 1024w`,
      `${basePath}-1280w.${ext} 1280w`
    ].join(', ');
    
    return { webp: webpSources, fallback: fallbackSources };
  };

  const srcSet = generateSrcSet(currentSrc);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* Use picture element for WebP support with fallback */}
      <picture>
        {srcSet && (
          <source
            srcSet={srcSet.webp}
            sizes={sizes}
            type="image/webp"
          />
        )}
        <img
          src={currentSrc}
          srcSet={srcSet?.fallback}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${hasError ? 'opacity-50' : ''}
            w-full h-full object-cover
          `}
        />
      </picture>
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Avatar component with optimized image loading
 */
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  if (!src) {
    return (
      <div className={`
        ${sizeClasses[size]}
        bg-gray-200 rounded-full flex items-center justify-center
        font-medium text-gray-600
        ${className}
      `}>
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full"
        sizes="(max-width: 768px) 10vw, 5vw"
        fallbackSrc=""
        onError={() => {
          // Will be handled by parent component fallback
        }}
      />
    </div>
  );
};

export default OptimizedImage;
