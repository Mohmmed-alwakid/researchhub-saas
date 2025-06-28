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
    
    // Base styles using design tokens approach
    const baseStyles = `
      block w-full border rounded-xl shadow-sm transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50
      placeholder:text-neutral-400
    `;
    
    // Variant styles
    const variants = {
      default: `
        border-neutral-300 bg-white text-neutral-900
        focus:border-primary-500 focus:ring-primary-500
        hover:border-neutral-400
      `,
      error: `
        border-error-500 bg-white text-neutral-900
        focus:border-error-600 focus:ring-error-500
        hover:border-error-600
      `,
      success: `
        border-success-500 bg-white text-neutral-900
        focus:border-success-600 focus:ring-success-500
        hover:border-success-600
      `,
    };
    
    // Size styles
    const sizes = {
      sm: `px-3 py-2 text-sm`,
      md: `px-4 py-3 text-base`,
      lg: `px-5 py-4 text-lg`,
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
            className="block text-sm font-medium text-neutral-700 mb-2"
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
