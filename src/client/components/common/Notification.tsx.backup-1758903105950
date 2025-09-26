import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  showClose?: boolean;
  animated?: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  action,
  onClose,
  showClose = true,
  animated = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'loading':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      case 'loading':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div 
      className={`
        ${getBgColor()} 
        border rounded-lg p-4 shadow-sm
        ${animated ? 'animate-in slide-in-from-top-2 duration-300' : ''}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${getTitleColor()}`}>
            {title}
          </h3>
          {message && (
            <div className={`mt-1 text-sm ${getMessageColor()}`}>
              {message}
            </div>
          )}
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        {showClose && onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;

// Banner notification for global messages
export const BannerNotification: React.FC<NotificationProps & { 
  position?: 'top' | 'bottom';
  fullWidth?: boolean; 
}> = ({ 
  position = 'top', 
  fullWidth = true, 
  ...props 
}) => (
  <div className={`
    ${fullWidth ? 'w-full' : 'max-w-lg'}
    ${position === 'top' ? 'top-4' : 'bottom-4'}
    left-1/2 transform -translate-x-1/2
    fixed z-50
  `}>
    <Notification {...props} />
  </div>
);

// Inline notification for form feedback
export const InlineNotification: React.FC<NotificationProps> = (props) => (
  <div className="mt-2">
    <Notification {...props} showClose={false} />
  </div>
);

// Success notification shorthand
export const SuccessNotification: React.FC<Omit<NotificationProps, 'type'>> = (props) => (
  <Notification type="success" {...props} />
);

// Error notification shorthand
export const ErrorNotification: React.FC<Omit<NotificationProps, 'type'>> = (props) => (
  <Notification type="error" {...props} />
);

// Warning notification shorthand
export const WarningNotification: React.FC<Omit<NotificationProps, 'type'>> = (props) => (
  <Notification type="warning" {...props} />
);

// Info notification shorthand
export const InfoNotification: React.FC<Omit<NotificationProps, 'type'>> = (props) => (
  <Notification type="info" {...props} />
);

// Loading notification shorthand
export const LoadingNotification: React.FC<Omit<NotificationProps, 'type'>> = (props) => (
  <Notification type="loading" {...props} showClose={false} />
);
