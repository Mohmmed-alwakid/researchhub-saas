import React from 'react';

export interface ValidationMessage {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  field?: string;
}

interface ValidationFeedbackProps {
  messages: ValidationMessage[];
  title?: string;
  className?: string;
  showIcons?: boolean;
  variant?: 'compact' | 'detailed';
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  messages,
  title,
  className = '',
  showIcons = true,
  variant = 'detailed'
}) => {
  if (messages.length === 0) return null;

  // Group messages by type
  const groupedMessages = messages.reduce((acc, message) => {
    if (!acc[message.type]) acc[message.type] = [];
    acc[message.type].push(message);
    return acc;
  }, {} as Record<string, ValidationMessage[]>);

  const getTypeConfig = (type: ValidationMessage['type']) => {
    const configs = {
      error: {
        bgClass: 'bg-error-50',
        borderClass: 'border-error-200',
        textClass: 'text-error-800',
        itemTextClass: 'text-error-700',
        icon: '⚠️',
        ariaLabel: 'Error'
      },
      warning: {
        bgClass: 'bg-warning-50',
        borderClass: 'border-warning-200',
        textClass: 'text-warning-800',
        itemTextClass: 'text-warning-700',
        icon: '⚠️',
        ariaLabel: 'Warning'
      },
      info: {
        bgClass: 'bg-info-50',
        borderClass: 'border-info-200',
        textClass: 'text-info-800',
        itemTextClass: 'text-info-700',
        icon: 'ℹ️',
        ariaLabel: 'Information'
      },
      success: {
        bgClass: 'bg-success-50',
        borderClass: 'border-success-200',
        textClass: 'text-success-800',
        itemTextClass: 'text-success-700',
        icon: '✅',
        ariaLabel: 'Success'
      }
    };
    return configs[type];
  };

  const renderCompactView = () => {
    const hasErrors = groupedMessages.error?.length > 0;
    const hasWarnings = groupedMessages.warning?.length > 0;
    const hasInfo = groupedMessages.info?.length > 0;

    const primaryType = hasErrors ? 'error' : hasWarnings ? 'warning' : hasInfo ? 'info' : 'success';
    const config = getTypeConfig(primaryType);
    const totalCount = messages.length;

    return (
      <div 
        className={`p-3 border rounded-lg ${config.bgClass} ${config.borderClass} ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          {showIcons && <span aria-label={config.ariaLabel}>{config.icon}</span>}
          <span className={`text-sm font-medium ${config.textClass}`}>
            {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
            {hasErrors && ` (${groupedMessages.error.length} critical)`}
          </span>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    return (
      <div className={`space-y-4 ${className}`}>
        {Object.entries(groupedMessages).map(([type, typeMessages]) => {
          const config = getTypeConfig(type as ValidationMessage['type']);
          
          return (
            <div
              key={type}
              className={`p-4 border rounded-lg ${config.bgClass} ${config.borderClass}`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                {showIcons && (
                  <span 
                    className="flex-shrink-0 mt-0.5" 
                    aria-label={config.ariaLabel}
                  >
                    {config.icon}
                  </span>
                )}
                <div className="flex-1">
                  {title && (
                    <h4 className={`font-medium ${config.textClass} mb-2`}>
                      {title}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {typeMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`text-sm ${config.itemTextClass}`}
                      >
                        <span className="inline-block mr-2">•</span>
                        {msg.field && (
                          <span className="font-medium">{msg.field}:</span>
                        )}{' '}
                        {msg.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return variant === 'compact' ? renderCompactView() : renderDetailedView();
};

// Convenience components for specific validation types
export const ErrorFeedback: React.FC<Omit<ValidationFeedbackProps, 'messages'> & { messages: string[] }> = ({
  messages,
  ...props
}) => (
  <ValidationFeedback
    messages={messages.map(msg => ({ type: 'error', message: msg }))}
    {...props}
  />
);

export const WarningFeedback: React.FC<Omit<ValidationFeedbackProps, 'messages'> & { messages: string[] }> = ({
  messages,
  ...props
}) => (
  <ValidationFeedback
    messages={messages.map(msg => ({ type: 'warning', message: msg }))}
    {...props}
  />
);

export const InfoFeedback: React.FC<Omit<ValidationFeedbackProps, 'messages'> & { messages: string[] }> = ({
  messages,
  ...props
}) => (
  <ValidationFeedback
    messages={messages.map(msg => ({ type: 'info', message: msg }))}
    {...props}
  />
);

export const SuccessFeedback: React.FC<Omit<ValidationFeedbackProps, 'messages'> & { messages: string[] }> = ({
  messages,
  ...props
}) => (
  <ValidationFeedback
    messages={messages.map(msg => ({ type: 'success', message: msg }))}
    {...props}
  />
);

export default ValidationFeedback;
