/**
 * Accessibility-Enhanced Consolidated Components
 * 
 * This file extends our consolidated components with comprehensive accessibility features
 * following WCAG 2.1 AA standards and systematic completion criteria.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../shared/utils';

// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================
export const useAriaLiveRegion = (message: string, type: 'polite' | 'assertive' = 'polite') => {
  React.useEffect(() => {
    if (!message) return;
    
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    return () => {
      document.body.removeChild(liveRegion);
    };
  }, [message, type]);
};

export const useFocusManagement = () => {
  const focusableElementsSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(focusableElementsSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  };

  return { trapFocus };
};

// =============================================================================
// ACCESSIBLE BUTTON COMPONENT
// =============================================================================
const buttonVariants = cva(
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
        sm: "h-8 px-3 text-xs min-w-[44px]", // Minimum touch target
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
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  /** Screen reader description for the button action */
  'aria-label'?: string;
  /** Describes the button's current state for screen readers */
  'aria-describedby'?: string;
  /** Indicates if button triggers a popup/menu */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /** Indicates if associated popup is expanded */
  'aria-expanded'?: boolean;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
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
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-haspopup': ariaHasPopup,
    'aria-expanded': ariaExpanded,
    ...props 
  }, ref) => {
    const buttonId = React.useId();
    const loadingId = `${buttonId}-loading`;
    
    // Announce loading state changes
    useAriaLiveRegion(loading ? loadingText : '', 'assertive');

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={loading ? `${ariaDescribedBy} ${loadingId}` : ariaDescribedBy}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
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
// ACCESSIBLE INPUT COMPONENT
// =============================================================================
const inputVariants = cva(
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
    VariantProps<typeof inputVariants> {
  label: string; // Required for accessibility
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Additional screen reader instructions */
  'aria-describedby'?: string;
  /** Indicates if input is required */
  'aria-required'?: boolean;
  /** Indicates if input value is invalid */
  'aria-invalid'?: boolean;
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
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
    'aria-describedby': ariaDescribedBy,
    'aria-required': ariaRequired,
    'aria-invalid': ariaInvalid,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    
    const describedByIds = [
      ariaDescribedBy,
      hintId,
      errorId
    ].filter(Boolean).join(' ');

    return (
      <div className="space-y-1">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {(required || ariaRequired) && (
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
              inputVariants({ variant: error ? "error" : variant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : ariaInvalid}
            aria-required={required || ariaRequired}
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
// ACCESSIBLE MODAL COMPONENT
// =============================================================================
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // Required for accessibility
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
  /** Additional description for screen readers */
  'aria-describedby'?: string;
  /** Prevents modal from closing on backdrop click */
  preventBackdropClose?: boolean;
  /** Initial focus target selector */
  initialFocus?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  'aria-describedby': ariaDescribedBy,
  preventBackdropClose = false,
  initialFocus
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();
  const titleId = React.useId();
  const descriptionId = ariaDescribedBy || React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    // Trap focus and handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventBackdropClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    // Store previously focused element
    const previouslyFocused = document.activeElement as HTMLElement;
    
    // Setup focus trap
    let cleanupFocusTrap: (() => void) | undefined;
    if (modalRef.current) {
      cleanupFocusTrap = trapFocus(modalRef.current);
      
      // Focus initial element if specified
      if (initialFocus) {
        const target = modalRef.current.querySelector(initialFocus) as HTMLElement;
        target?.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      cleanupFocusTrap?.();
      
      // Restore focus to previously focused element
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, preventBackdropClose, trapFocus, initialFocus]);

  // Announce modal open/close state
  useAriaLiveRegion(isOpen ? `${title} dialog opened` : '', 'assertive');

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-white rounded-lg shadow-xl transition-all",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`Close ${title} dialog`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4" id={descriptionId}>
          {children}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ACCESSIBLE ALERT COMPONENT
// =============================================================================
const alertVariants = cva(
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
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Importance level for screen readers */
  level?: 'polite' | 'assertive';
}

export const AccessibleAlert = React.forwardRef<HTMLDivElement, AccessibleAlertProps>(
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
    const alertId = React.useId();
    const titleId = title ? `${alertId}-title` : undefined;

    return (
      <div 
        ref={ref} 
        className={cn(alertVariants({ variant }), className)} 
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
              className="ml-4 opacity-60 hover:opacity-100 transition-opacity rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
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
  AccessibleAlert,
  useAriaLiveRegion,
  useFocusManagement
};
