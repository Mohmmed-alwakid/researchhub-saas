import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';


// Design System - Enhanced UI Components
// Comprehensive component library for study creation flow

// Design System Tokens
export const DesignTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      300: '#d1d5db',
      500: '#6b7280',
      700: '#374151',
      900: '#111827'
    }
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px  
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem'     // 64px
  },
  typography: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }]
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  borderRadius: {
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem'     // 16px
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  }
};

// Enhanced Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onClick,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-sm',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const fullWidthClasses = fullWidth ? 'w-full' : '';

  const className = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    isDisabled && disabledClasses,
    fullWidthClasses
  ].filter(Boolean).join(' ');

  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

// Enhanced Form Field Component
interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  success,
  required = false,
  children,
  id
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {description && !error && !success && (
        <p className="text-sm text-gray-500 flex items-start">
          <Info className="w-4 h-4 mt-0.5 mr-1 flex-shrink-0 text-gray-400" />
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-error-600 flex items-start">
          <AlertCircle className="w-4 h-4 mt-0.5 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
      
      {success && (
        <p className="text-sm text-success-600 flex items-start">
          <CheckCircle className="w-4 h-4 mt-0.5 mr-1 flex-shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
};

// Enhanced Input Component
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  id?: string;
  name?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  hasError?: boolean;
  hasSuccess?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  hasError = false,
  hasSuccess = false,
  size = 'md',
  disabled = false,
  readOnly = false,
  ...props
}) => {
  const baseClasses = 'block w-full border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm', 
    lg: 'px-4 py-3 text-base'
  };

  const stateClasses = hasError
    ? 'border-error-300 text-error-900 placeholder-error-400 focus:ring-error-500 focus:border-error-500'
    : hasSuccess
    ? 'border-success-300 text-success-900 placeholder-success-400 focus:ring-success-500 focus:border-success-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500';

  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';
  const readOnlyClasses = readOnly ? 'bg-gray-50' : '';

  const className = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    disabledClasses,
    readOnlyClasses
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      className={className}
      disabled={disabled}
      readOnly={readOnly}
      {...props}
    />
  );
};

// Enhanced Textarea Component  
interface TextareaProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  rows?: number;
  cols?: number;
  id?: string;
  name?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  hasError?: boolean;
  hasSuccess?: boolean;
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea: React.FC<TextareaProps> = ({
  hasError = false,
  hasSuccess = false,
  size = 'md',
  disabled = false,
  readOnly = false,
  resize = 'vertical',
  rows = 3,
  ...props
}) => {
  const baseClasses = 'block w-full border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x', 
    both: 'resize'
  };

  const stateClasses = hasError
    ? 'border-error-300 text-error-900 placeholder-error-400 focus:ring-error-500 focus:border-error-500'
    : hasSuccess
    ? 'border-success-300 text-success-900 placeholder-success-400 focus:ring-success-500 focus:border-success-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500';

  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';
  const readOnlyClasses = readOnly ? 'bg-gray-50' : '';

  const className = [
    baseClasses,
    sizeClasses[size],
    resizeClasses[resize],
    stateClasses,
    disabledClasses,
    readOnlyClasses
  ].filter(Boolean).join(' ');

  return (
    <textarea
      rows={rows}
      className={className}
      disabled={disabled}
      readOnly={readOnly}
      {...props}
    />
  );
};

// Enhanced Checkbox Component
interface CheckboxProps {
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  hasError = false,
  size = 'md',
  disabled = false,
  children,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const baseClasses = 'rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors';
  const errorClasses = hasError ? 'border-error-300 text-error-600 focus:ring-error-500' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const className = [
    baseClasses,
    sizeClasses[size],
    errorClasses,
    disabledClasses
  ].filter(Boolean).join(' ');

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={checkboxId}
        className={className}
        disabled={disabled}
        {...props}
      />
      {children && (
        <label htmlFor={checkboxId} className={`ml-2 text-sm text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          {children}
        </label>
      )}
    </div>
  );
};

// Progress Indicator Component
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  };

  const animatedClasses = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full ${variantClasses[variant]} ${animatedClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Alert Component
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  closable = false
}) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle
  };

  const variantClasses = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800'
  };

  const iconColors = {
    info: 'text-primary-400',
    success: 'text-success-400', 
    warning: 'text-warning-400',
    error: 'text-error-400'
  };

  const Icon = icons[variant];

  return (
    <div className={`rounded-md border p-4 ${variantClasses[variant]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors[variant]}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {closable && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  variant === 'info' ? 'text-primary-500 hover:bg-primary-100 focus:ring-primary-600' :
                  variant === 'success' ? 'text-success-500 hover:bg-success-100 focus:ring-success-600' :
                  variant === 'warning' ? 'text-warning-500 hover:bg-warning-100 focus:ring-warning-600' :
                  'text-error-500 hover:bg-error-100 focus:ring-error-600'
                }`}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  };

  const baseClasses = 'rounded-lg';

  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};
