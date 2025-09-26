import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, User, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';


export interface Notification {
  id: string;
  type: 'participant_applied' | 'study_started' | 'study_completed' | 'application_approved' | 'system_update' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  studyId?: string;
  studyTitle?: string;
  participantId?: string;
  participantName?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isEnabled: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Export context for potential external use
export { NotificationContext };

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  autoRemoveAfter?: number; // milliseconds
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 50,
  autoRemoveAfter = 300000 // 5 minutes
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  // Load notification preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('notification-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setIsEnabled(prefs.enabled !== false);
      } catch (error) {
        console.warn('Failed to parse notification preferences:', error);
      }
    }
  }, []);

  // Save notification preferences
  useEffect(() => {
    localStorage.setItem('notification-preferences', JSON.stringify({ enabled: isEnabled }));
  }, [isEnabled]);

  // Auto-remove old notifications
  useEffect(() => {
    if (!autoRemoveAfter) return;

    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => 
          Date.now() - notification.timestamp.getTime() < autoRemoveAfter
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoRemoveAfter]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    if (!isEnabled) return;

    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      
      // Limit total notifications
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications);
      }
      
      return updated;
    });

    // Show toast notification
    const getToastIcon = () => {
      switch (notification.type) {
        case 'participant_applied': return '👤';
        case 'study_completed': return '✅';
        case 'application_approved': return '✔️';
        case 'achievement': return '🎉';
        case 'system_update': return '🔄';
        default: return '📢';
      }
    };

    toast(notification.message, {
      icon: getToastIcon(),
      duration: notification.priority === 'high' ? 6000 : 4000,
      position: 'top-right',
      style: {
        background: notification.priority === 'high' ? '#fee2e2' : '#f3f4f6',
        color: notification.priority === 'high' ? '#dc2626' : '#374151',
        border: notification.priority === 'high' ? '1px solid #fecaca' : '1px solid #d1d5db'
      }
    });

    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  }, [isEnabled, maxNotifications]);

  // WebSocket connection for real-time notifications (simulated for now)
  useEffect(() => {
    if (!isEnabled) return;

    // In a real implementation, this would be a WebSocket connection
    const mockWebSocket = () => {
      const events = [
        {
          type: 'participant_applied' as const,
          studyTitle: 'Mobile App Usability Study',
          participantName: 'John Smith',
          studyId: 'study-123'
        },
        {
          type: 'study_completed' as const,
          studyTitle: 'E-commerce Checkout Flow',
          participantName: 'Sarah Johnson',
          studyId: 'study-456'
        },
        {
          type: 'achievement' as const,
          title: 'Study Milestone',
          message: 'Your study has reached 25 participants!'
        }
      ];

      // Simulate periodic notifications for demo
      const interval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 30 seconds
          const event = events[Math.floor(Math.random() * events.length)];
          
          if (event.type === 'participant_applied') {
            addNotification({
              type: event.type,
              title: 'New Participant Application',
              message: `${event.participantName} applied to "${event.studyTitle}"`,
              priority: 'medium',
              studyId: event.studyId,
              studyTitle: event.studyTitle,
              participantName: event.participantName,
              actionUrl: `/app/studies/${event.studyId}/applications`
            });
          } else if (event.type === 'study_completed') {
            addNotification({
              type: event.type,
              title: 'Study Session Completed',
              message: `${event.participantName} completed "${event.studyTitle}"`,
              priority: 'high',
              studyId: event.studyId,
              studyTitle: event.studyTitle,
              participantName: event.participantName,
              actionUrl: `/app/studies/${event.studyId}/results`
            });
          } else {
            addNotification({
              type: event.type,
              title: event.title,
              message: event.message,
              priority: 'low'
            });
          }
        }
      }, 30000);

      return () => clearInterval(interval);
    };

    const cleanup = mockWebSocket();
    return cleanup;
  }, [isEnabled, addNotification]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleNotifications = () => {
    setIsEnabled(prev => !prev);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    isEnabled,
    toggleNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component
interface NotificationBellProps {
  className?: string;
  onToggleDropdown?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  onToggleDropdown
}) => {
  const { unreadCount, isEnabled, toggleNotifications } = useNotifications();

  const handleClick = () => {
    if (onToggleDropdown) {
      onToggleDropdown();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className={`relative p-2 rounded-full transition-colors ${
          isEnabled 
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
            : 'text-gray-400'
        }`}
        title={isEnabled ? 'Notifications' : 'Notifications disabled'}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread badge */}
        {unreadCount > 0 && isEnabled && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
        
        {/* Disabled indicator */}
        {!isEnabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full opacity-60" />
        )}
      </button>

      {/* Enable/disable toggle */}
      <button
        onClick={toggleNotifications}
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 hover:text-gray-700"
        title={isEnabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {isEnabled ? 'ON' : 'OFF'}
      </button>
    </div>
  );
};

// Notification Dropdown Panel
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    isEnabled 
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'participant_applied': return <User className="w-4 h-4 text-blue-600" />;
      case 'study_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'application_approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'achievement': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'system_update': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={`absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {!isEnabled ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Notifications are disabled</p>
              <p className="text-sm text-gray-500">Click the bell icon to enable</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-500">You'll see updates here when they arrive</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.studyTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          Study: {notification.studyTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && isEnabled && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationProvider;
