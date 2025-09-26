import React, { ReactNode } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ChevronRight,
  Clock,
  Check,
  X
} from 'lucide-react';


/**
 * Enhanced Design System for AfakarM ResearchHub
 * Comprehensive UI components and utilities for consistent user experience
 */

// ================================
// Color System
// ================================
export const colors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main secondary
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// ================================
// Typography System
// ================================
export const typography = {
  headingXL: 'text-4xl font-bold leading-tight tracking-tight',
  headingL: 'text-3xl font-bold leading-tight',
  headingM: 'text-2xl font-semibold leading-tight',
  headingS: 'text-xl font-semibold leading-relaxed',
  bodyL: 'text-base leading-relaxed',
  bodyM: 'text-sm leading-relaxed',
  bodyS: 'text-xs leading-relaxed',
  caption: 'text-xs leading-tight text-gray-500',
  label: 'text-sm font-medium leading-tight',
};

// ================================
// Spacing System
// ================================
export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
};

// ================================
// Button Component
// ================================
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300'
  };
  
  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

// ================================
// Input Component
// ================================
interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled = false,
  required = false,
  className = '',
  name,
  id
}) => {
  const inputClasses = [
    'block w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// ================================
// Textarea Component
// ================================
interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  disabled = false,
  required = false,
  className = '',
  name,
  id
}) => {
  const textareaClasses = [
    'block w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// ================================
// Card Component
// ================================
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const classes = [
    'bg-white rounded-lg border border-gray-200',
    paddingClasses[padding],
    shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ');
  
  return <div className={classes}>{children}</div>;
};

// ================================
// Alert Component
// ================================
interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className = ''
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-400'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-400'
    }
  };
  
  const { container, icon: Icon, iconColor } = variants[variant];
  
  return (
    <div className={`rounded-md border p-4 ${container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3">
          {children}
        </div>
      </div>
    </div>
  );
};

// ================================
// Progress Bar Component
// ================================
interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    secondary: 'bg-gradient-to-r from-purple-500 to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600'
  };
  
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

// ================================
// Step Navigation Component
// ================================
interface StepNavigationProps {
  steps: Array<{
    id: number;
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    estimatedTime?: string;
  }>;
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
  disabled?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  disabled = false
}) => {
  return (
    <nav aria-label="Progress" className="overflow-x-auto">
      <ol className="flex items-center space-x-4 min-w-max">
        {steps.map((step, stepIdx) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={disabled}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200
                  ${isCurrent
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : isCompleted
                    ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600 group-hover:bg-gray-400'
                  }
                `}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-sm">{step.title}</div>
                  {step.estimatedTime && (
                    <div className="text-xs opacity-75 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{step.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </button>
              
              {stepIdx < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-2 flex-shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ================================
// Auto Save Indicator Component
// ================================
interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-blue-600">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-600">Save failed</span>
        </>
      )}
    </div>
  );
};

// ================================
// Modal Component
// ================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[95vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-auto max-h-[calc(95vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// ================================
// Loading Spinner Component
// ================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    primary: 'border-indigo-600 border-t-transparent',
    secondary: 'border-purple-600 border-t-transparent',
    white: 'border-white border-t-transparent'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${colorClasses[color]} ${className}`}
    />
  );
};

// ================================
// Export all components
// ================================
export default {
  colors,
  typography,
  spacing,
  Button,
  Input,
  Textarea,
  Card,
  Alert,
  ProgressBar,
  StepNavigation,
  AutoSaveIndicator,
  Modal,
  LoadingSpinner,
};
