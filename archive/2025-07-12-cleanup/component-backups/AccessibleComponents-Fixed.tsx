/**
 * Accessible Components - WCAG 2.1 AA Compliant
 * 
 * Enhanced versions of our consolidated components with comprehensive accessibility features.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../shared/utils';
import { useAriaLiveRegion, useFocusManagement, useUniqueId } from '../../hooks/accessibility';

// =============================================================================
// ACCESSIBLE BUTTON
// =============================================================================
const accessibleButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
      },
      size: {
        sm: "h-8 px-3 text-xs min-w-[44px]", // WCAG minimum touch target
        md: "h-10 px-4 text-sm min-w-[44px]", 
        lg: "h-12 px-6 text-base min-w-[44px]",
        xl: "h-14 px-8 text-lg min-w-[44px]"
      },
      fullWidth: {
        true: "w-full"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

interface AccessibleButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    loadingText = "Loading...",
    ...props 
  }, ref) => {
    const buttonId = useUniqueId('button');
    const loadingId = `${buttonId}-loading`;
    
    // Announce loading state changes
    useAriaLiveRegion(loading ? loadingText : '', 'assertive');

    return (
      <button
        ref={ref}
        className={cn(accessibleButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-describedby={loading ? loadingId : undefined}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <div 
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            <span id={loadingId} className="sr-only">{loadingText}</span>
          </>
        ) : leftIcon ? (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        ) : null}
        
        <span>{children}</span>
        
        {rightIcon && !loading && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

// =============================================================================
// ACCESSIBLE INPUT
// =============================================================================
const accessibleInputVariants = cva(
  "flex w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus-visible:ring-blue-500",
        error: "border-red-300 focus-visible:ring-red-500 bg-red-50",
        success: "border-green-300 focus-visible:ring-green-500 bg-green-50"
      },
      size: {
        sm: "h-8 text-xs min-h-[44px]", // Accessible touch target
        md: "h-10 text-sm min-h-[44px]",
        lg: "h-12 text-base min-h-[44px]"
      }
    },
    defaultVariants: {
      variant: "default", 
      size: "md"
    }
  }
);

interface AccessibleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof accessibleInputVariants> {
  label: string; // Required for accessibility
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon, 
    id, 
    required,
    ...props 
  }, ref) => {
    const generatedId = useUniqueId('input');
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    
    const describedByIds = [hintId, errorId].filter(Boolean).join(' ');

    return (
      <div className="space-y-1">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              accessibleInputVariants({ variant: error ? "error" : variant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-required={required}
            aria-describedby={describedByIds || undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-red-600" role="alert" aria-live="polite">
            <span className="sr-only">Error: </span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";

// =============================================================================
// ACCESSIBLE MODAL
// =============================================================================
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // Required for accessibility
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  preventBackdropClose?: boolean;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  preventBackdropClose = false
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();
  const titleId = useUniqueId('modal-title');

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    const previouslyFocused = document.activeElement as HTMLElement;
    
    let cleanupFocusTrap: (() => void) | undefined;
    if (modalRef.current) {
      cleanupFocusTrap = trapFocus(modalRef.current);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      cleanupFocusTrap?.();
      
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, preventBackdropClose, trapFocus]);

  useAriaLiveRegion(isOpen ? `${title} dialog opened` : '', 'assertive');

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={preventBackdropClose ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-xl transition-all",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-w-[44px] min-h-[44px]"
              aria-label={`Close ${title} dialog`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ACCESSIBLE ALERT
// =============================================================================
const accessibleAlertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-800",
        success: "bg-green-50 border-green-200 text-green-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800", 
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface AccessibleAlertProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof accessibleAlertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  level?: 'polite' | 'assertive';
}

const AccessibleAlert = React.forwardRef<HTMLDivElement, AccessibleAlertProps>(
  ({ 
    className, 
    variant, 
    title, 
    dismissible, 
    onDismiss, 
    level = 'polite',
    children, 
    ...props 
  }, ref) => {
    const generatedTitleId = useUniqueId('alert-title');
    const titleId = title ? generatedTitleId : undefined;

    return (
      <div 
        ref={ref} 
        className={cn(accessibleAlertVariants({ variant }), className)} 
        role="alert" 
        aria-live={level}
        aria-labelledby={titleId}
        {...props}
      >
        <div className="flex">
          <div className="flex-1">
            {title && (
              <h3 id={titleId} className="mb-1 font-medium leading-none tracking-tight">
                {title}
              </h3>
            )}
            <div className="text-sm opacity-90">
              {children}
            </div>
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-4 opacity-60 hover:opacity-100 transition-opacity rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={title ? `Dismiss ${title} alert` : 'Dismiss alert'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

AccessibleAlert.displayName = "AccessibleAlert";

// =============================================================================
// EXPORTS
// =============================================================================
export { 
  AccessibleButton, 
  AccessibleInput, 
  AccessibleModal, 
  AccessibleAlert
};
