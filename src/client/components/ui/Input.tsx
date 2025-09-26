import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';


export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helpText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant = 'default',
    size = 'md',
    label,
    helpText,
    errorMessage,
    leftIcon,
    rightIcon,
    isLoading = false,
    disabled,
    id,
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Enhanced base styles with professional effects
    const baseStyles = `
      block w-full border rounded-xl shadow-sm transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:shadow-lg
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
      placeholder:text-gray-400 backdrop-blur-sm
      hover:shadow-md transform hover:scale-[1.01] focus:scale-[1.01]
    `;
    
    // Enhanced variant styles with beautiful focus states
    const variants = {
      default: `
        border-gray-300/60 bg-white/90 text-gray-900
        focus:border-blue-500 focus:ring-blue-500/30 focus:bg-white
        hover:border-gray-400/80 hover:bg-white
      `,
      error: `
        border-red-400/60 bg-red-50/30 text-gray-900
        focus:border-red-500 focus:ring-red-500/30 focus:bg-red-50/50
        hover:border-red-500/80 hover:bg-red-50/40
      `,
      success: `
        border-green-400/60 bg-green-50/30 text-gray-900
        focus:border-green-500 focus:ring-green-500/30 focus:bg-green-50/50
        hover:border-green-500/80 hover:bg-green-50/40
      `,
    };
    
    // Enhanced size styles with better proportions
    const sizes = {
      sm: `px-4 py-2.5 text-sm`,
      md: `px-5 py-3.5 text-base`,
      lg: `px-6 py-4.5 text-lg`,
    };
    
    // Icon sizing
    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5', 
      lg: 'h-6 w-6',
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2"
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={cn('text-neutral-400', iconSizes[size])} aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}
          
          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseStyles,
              variants[variant],
              sizes[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            disabled={disabled || isLoading}
            aria-invalid={variant === 'error'}
            aria-describedby={
              helpText || errorMessage 
                ? `${inputId}-description`
                : undefined
            }
            {...props}
          />
          
          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className={cn('text-neutral-400', iconSizes[size])} aria-hidden="true">
                {rightIcon}
              </span>
            </div>
          )}
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg
                className={cn('animate-spin text-neutral-400', iconSizes[size])}
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
            </div>
          )}
        </div>
        
        {/* Help Text / Error Message */}
        {(helpText || errorMessage) && (
          <p
            id={`${inputId}-description`}
            className={cn(
              'mt-2 text-sm',
              variant === 'error' 
                ? 'text-error-600' 
                : 'text-neutral-600'
            )}
          >
            {errorMessage || helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
