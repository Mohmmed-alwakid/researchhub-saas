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
    // Base styles using design tokens approach
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl 
      transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 
      focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]
      ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    `;
    
    // Variant styles using consistent token naming
    const variants = {
      primary: `text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-soft hover:shadow-medium`,
      secondary: `text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 focus:ring-primary-500 shadow-soft hover:shadow-medium`,
      outline: `text-primary-700 bg-transparent border border-primary-300 hover:bg-primary-50 focus:ring-primary-500`,
      ghost: `text-neutral-700 bg-transparent hover:bg-neutral-100 focus:ring-neutral-500`,
      danger: `text-white bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 focus:ring-error-500 shadow-soft hover:shadow-medium`,
    };
    
    // Size styles using consistent spacing
    const sizes = {
      sm: `px-4 py-2 text-sm`,
      md: `px-6 py-3 text-base`,
      lg: `px-8 py-4 text-lg`,
      xl: `px-10 py-5 text-xl`,
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
