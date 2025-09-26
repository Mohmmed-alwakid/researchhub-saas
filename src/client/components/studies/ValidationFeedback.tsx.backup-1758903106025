import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ValidationError, ValidationResult } from '../../utils/validation';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  showSuccessMessage?: boolean;
  className?: string;
}

interface ValidationMessageProps {
  error: ValidationError;
  onDismiss?: (error: ValidationError) => void;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ error, onDismiss }) => {
  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (error.type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (error.type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${getBgColor()}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${getTextColor()}`}>
          {error.field && (
            <span className="font-semibold">{error.field}: </span>
          )}
          {error.message}
        </div>
        {error.code && (
          <div className="text-xs text-gray-600 mt-1">
            Error code: {error.code}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(error)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  showSuccessMessage = true,
  className = ''
}) => {
  const hasMessages = validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0;

  if (!hasMessages && !showSuccessMessage) {
    return null;
  }

  if (!hasMessages && showSuccessMessage && validation.isValid) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-sm font-medium text-green-800">
          All validations passed! Your study is ready.
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {validation.errors.map((error, index) => (
        <ValidationMessage key={`error-${index}`} error={error} />
      ))}

      {/* Warnings */}
      {validation.warnings.map((warning, index) => (
        <ValidationMessage key={`warning-${index}`} error={warning} />
      ))}

      {/* Suggestions */}
      {validation.suggestions.map((suggestion, index) => (
        <ValidationMessage key={`suggestion-${index}`} error={suggestion} />
      ))}
    </div>
  );
};

// Validation summary component
interface ValidationSummaryProps {
  validation: ValidationResult;
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validation,
  className = ''
}) => {
  const totalIssues = validation.errors.length + validation.warnings.length;

  if (totalIssues === 0) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">No issues found</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      {validation.errors.length > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">{validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      {validation.warnings.length > 0 && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">{validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {validation.suggestions.length > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Info className="w-4 h-4" />
          <span className="font-medium">{validation.suggestions.length} suggestion{validation.suggestions.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

// Real-time field validation component
interface FieldValidationProps {
  fieldName: string;
  value: unknown;
  validation: ValidationResult;
  children: React.ReactNode;
}

export const FieldValidation: React.FC<FieldValidationProps> = ({
  fieldName,
  validation,
  children
}) => {
  const fieldErrors = validation.errors.filter(error => error.field === fieldName);
  const fieldWarnings = validation.warnings.filter(warning => warning.field === fieldName);
  
  const hasErrors = fieldErrors.length > 0;
  const hasWarnings = fieldWarnings.length > 0;

  const getBorderColor = () => {
    if (hasErrors) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (hasWarnings) return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    return 'border-green-300 focus:border-green-500 focus:ring-green-500';
  };

  return (
    <div className="space-y-2">
      <div className={`relative ${getBorderColor()}`}>
        {children}
        
        {/* Field status indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {hasErrors && <AlertCircle className="w-5 h-5 text-red-500" />}
          {!hasErrors && hasWarnings && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {!hasErrors && !hasWarnings && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
      </div>

      {/* Field-specific messages */}
      {(hasErrors || hasWarnings) && (
        <div className="space-y-1">
          {fieldErrors.map((error, index) => (
            <div key={`field-error-${index}`} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error.message}
            </div>
          ))}
          {fieldWarnings.map((warning, index) => (
            <div key={`field-warning-${index}`} className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {warning.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;
