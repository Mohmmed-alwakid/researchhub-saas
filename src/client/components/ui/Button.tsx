import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    // Enhanced base styles with professional animations
    const baseStyles = `
      inline-flex items-center justify-center font-semibold rounded-xl 
      transition-all duration-300 ease-out focus:outline-none focus:ring-2 
      focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]
      shadow-sm hover:shadow-lg active:shadow-md
      backdrop-blur-sm border border-transparent
      ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer'}
    `;
    
    // Enhanced variant styles with professional gradients and effects
    const variants = {
      primary: `
        text-white bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
        hover:from-blue-700 hover:via-blue-800 hover:to-purple-800
        focus:ring-blue-500 shadow-blue-500/25 hover:shadow-blue-600/30
        border-blue-600/20
      `,
      secondary: `
        text-gray-700 bg-gradient-to-br from-white to-gray-50 
        border-gray-300 hover:from-gray-50 hover:to-gray-100
        focus:ring-blue-500 shadow-gray-400/20 hover:shadow-gray-500/25
        hover:border-gray-400
      `,
      outline: `
        text-blue-700 bg-transparent border-2 border-blue-300 
        hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100
        focus:ring-blue-500 hover:border-blue-400 hover:text-blue-800
        shadow-blue-200/30 hover:shadow-blue-300/40
      `,
      ghost: `
        text-gray-700 bg-transparent hover:bg-gradient-to-br 
        hover:from-gray-100 hover:to-gray-200
        focus:ring-gray-500 hover:shadow-gray-300/30
      `,
      danger: `
        text-white bg-gradient-to-br from-red-600 via-red-700 to-pink-700
        hover:from-red-700 hover:via-red-800 hover:to-pink-800
        focus:ring-red-500 shadow-red-500/25 hover:shadow-red-600/30
        border-red-600/20
      `,
    };
    
    // Enhanced size styles with better proportions
    const sizes = {
      sm: `px-4 py-2.5 text-sm font-medium`,
      md: `px-6 py-3 text-base font-semibold`,
      lg: `px-8 py-4 text-lg font-semibold`,
      xl: `px-10 py-5 text-xl font-bold`,
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {leftIcon && !isLoading && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
