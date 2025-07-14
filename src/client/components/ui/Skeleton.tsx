import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string | string[];
  height?: string;
  animated?: boolean;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    lines = 1, 
    width = "100%", 
    height = "1rem",
    animated = true,
    ...props 
  }, ref) => {
    const baseStyles = `
      bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg
      ${animated ? 'animate-pulse' : ''}
    `;

    if (lines === 1) {
      return (
        <div
          className={cn(baseStyles, className)}
          style={{ width: Array.isArray(width) ? width[0] : width, height }}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className="space-y-3" ref={ref} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseStyles, className)}
            style={{
              width: Array.isArray(width) ? width[index] || width[0] : width,
              height
            }}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Specialized skeleton components
export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 p-7 space-y-4">
    <Skeleton height="1.5rem" width="60%" />
    <Skeleton lines={3} width={["100%", "90%", "70%"]} />
  </div>
);

export const ButtonSkeleton = ({ size = "md" }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeStyles = {
    sm: { width: "80px", height: "36px" },
    md: { width: "120px", height: "44px" },
    lg: { width: "140px", height: "52px" },
  };
  
  return (
    <Skeleton 
      className="rounded-xl" 
      width={sizeStyles[size].width} 
      height={sizeStyles[size].height} 
    />
  );
};

export const InputSkeleton = () => (
  <div className="space-y-2">
    <Skeleton height="1.25rem" width="25%" />
    <Skeleton height="44px" width="100%" className="rounded-xl" />
  </div>
);

export default Skeleton;
