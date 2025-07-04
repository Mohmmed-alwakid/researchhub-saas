/**
 * Mobile-Optimized Components
 * Touch-friendly, responsive components with proper sizing and interactions
 */

import React, { useState, useEffect, useRef } from 'react';
import { TOUCH_TARGET_SIZE, BREAKPOINTS } from '../../hooks/mobile';

// Use inline accessibility props instead of importing hook with issues
const generateId = () => `mobile-${Math.random().toString(36).substr(2, 9)}`;

// Mobile-optimized touch targets (44px minimum)
const TOUCH_TARGET_SIZE_LOCAL = TOUCH_TARGET_SIZE;

// Responsive breakpoints
const BREAKPOINTS_LOCAL = BREAKPOINTS;

/**
 * Mobile-optimized button with proper touch targets
 */
interface MobileButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ariaLabel
}) => {
  const buttonId = `mobile-btn-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    small: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm',
    medium: 'min-h-[48px] min-w-[48px] px-6 py-3 text-base',
    large: 'min-h-[52px] min-w-[52px] px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
  };

  const handleTouch = (event: React.TouchEvent<HTMLButtonElement>) => {
    // Add visual feedback for touch
    const target = event.currentTarget;
    target.style.transform = 'scale(0.98)';
    setTimeout(() => {
      target.style.transform = 'scale(1)';
    }, 150);
  };

  return (
    <button
      id={buttonId}
      aria-label={ariaLabel || children?.toString() || 'Button'}
      onClick={onClick}
      onTouchStart={handleTouch}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-medium
        transition-all duration-150 ease-in-out
        touch-manipulation
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * Mobile-optimized input field with proper touch targets
 */
interface MobileInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = ''
}) => {
  const inputId = `mobile-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        aria-label={label}
        aria-describedby={error ? `${inputId}-error` : undefined}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full min-h-[48px] px-4 py-3
          border border-gray-300 rounded-lg
          text-base leading-6
          bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          touch-manipulation
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Mobile-optimized modal with proper touch interactions
 */
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium'
}) => {
  const modalId = `mobile-modal-${Math.random().toString(36).substr(2, 9)}`;

  const [startY, setStartY] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle swipe-down to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY === null) return;
    
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startY;
    
    // If swipe down more than 100px, close modal
    if (diff > 100) {
      onClose();
    }
    
    setStartY(null);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS Safari bounce scroll
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm mx-4',
    medium: 'max-w-md mx-4',
    large: 'max-w-2xl mx-4',
    fullscreen: 'w-full h-full m-0 rounded-none'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        id={modalId}
        aria-label={title}
        aria-describedby="Modal dialog"
        role="dialog"
        aria-modal="true"
        className={`
          ${sizeClasses[size]}
          bg-white rounded-t-lg sm:rounded-lg
          max-h-[90vh] overflow-y-auto
          touch-manipulation
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <MobileButton
            onClick={onClose}
            variant="secondary"
            size="small"
            ariaLabel="Close modal"
            className="p-2"
          >
            ✕
          </MobileButton>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-optimized navigation with touch-friendly targets
 */
interface MobileNavProps {
  items: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  onItemClick: (href: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative">
      {/* Mobile menu button */}
      <MobileButton
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        ariaLabel="Toggle navigation menu"
        className="md:hidden"
      >
        ☰
      </MobileButton>

      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-4">
        {items.map((item) => (
          <MobileButton
            key={item.href}
            onClick={() => onItemClick(item.href)}
            variant={item.active ? 'primary' : 'secondary'}
            ariaLabel={`Navigate to ${item.label}`}
          >
            {item.label}
          </MobileButton>
        ))}
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg md:hidden z-50">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                onItemClick(item.href);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 min-h-[48px]
                hover:bg-gray-50 active:bg-gray-100
                ${item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}
                first:rounded-t-lg last:rounded-b-lg
                touch-manipulation
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

/**
 * Mobile-optimized card component
 */
interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  onClick,
  className = ''
}) => {
  const isInteractive = Boolean(onClick);

  const handleTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (isInteractive) {
      const target = event.currentTarget;
      target.style.transform = 'scale(0.98)';
      setTimeout(() => {
        target.style.transform = 'scale(1)';
      }, 150);
    }
  };

  return (
    <div
      onClick={onClick}
      onTouchStart={isInteractive ? handleTouch : undefined}
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        p-4 sm:p-6
        ${isInteractive ? 'cursor-pointer touch-manipulation active:scale-95 transition-transform' : ''}
        ${className}
      `}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Mobile-optimized form with proper spacing and touch targets
 */
interface MobileFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  children,
  onSubmit,
  className = ''
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`
        space-y-6
        w-full max-w-md mx-auto
        ${className}
      `}
    >
      {children}
    </form>
  );
};

export default {
  MobileButton,
  MobileInput,
  MobileModal,
  MobileNav,
  MobileCard,
  MobileForm
};
