import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  FileText, 
  Settings, 
  RefreshCw, 
  Shield, 
  Download,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'users' | 'studies' | 'system';
  action: () => void;
  confirmRequired?: boolean;
  confirmText?: string;
}

interface QuickActionsPanelProps {
  onUserAction?: (action: string, data?: unknown) => void;
  onStudyAction?: (action: string, data?: unknown) => void;
  onSystemAction?: (action: string, data?: unknown) => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onUserAction,
  onStudyAction,
  onSystemAction
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<QuickAction | null>(null);

  const executeAction = async (action: QuickAction) => {
    if (action.confirmRequired) {
      setConfirmAction(action);
      return;
    }

    setLoading(action.id);
    try {
      await action.action();
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const confirmAndExecute = async () => {
    if (!confirmAction) return;
    
    setLoading(confirmAction.id);
    try {
      await confirmAction.action();
    } catch (error) {
      console.error(`Error executing action ${confirmAction.id}:`, error);
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const quickActions: QuickAction[] = [
    // User Management Actions
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add a new user to the system',
      icon: UserPlus,
      category: 'users',
      action: async () => {
        if (onUserAction) {
          onUserAction('create');
        }
      }
    },
    {
      id: 'bulk-user-actions',
      title: 'Bulk User Actions',
      description: 'Perform actions on multiple users',
      icon: Users,
      category: 'users',
      action: async () => {
        if (onUserAction) {
          onUserAction('bulk');
        }
      }
    },
    {
      id: 'export-users',
      title: 'Export Users',
      description: 'Download user data as CSV',
      icon: Download,
      category: 'users',
      action: async () => {
        const response = await fetch('/api/admin/export/users');
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
    },

    // Study Management Actions
    {
      id: 'pending-studies',
      title: 'Pending Studies',
      description: 'Review studies awaiting approval',
      icon: Clock,
      category: 'studies',
      action: async () => {
        if (onStudyAction) {
          onStudyAction('pending');
        }
      }
    },
    {
      id: 'approve-studies',
      title: 'Bulk Approve',
      description: 'Approve multiple studies at once',
      icon: CheckCircle,
      category: 'studies',
      action: async () => {
        if (onStudyAction) {
          onStudyAction('bulk-approve');
        }
      }
    },
    {
      id: 'export-studies',
      title: 'Export Study Data',
      description: 'Download study analytics as CSV',
      icon: Download,
      category: 'studies',
      action: async () => {
        const response = await fetch('/api/admin/export/studies');
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `studies-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
    },

    // System Actions
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Clear system cache and refresh data',
      icon: RefreshCw,
      category: 'system',
      confirmRequired: true,
      confirmText: 'This will clear all cached data. Continue?',
      action: async () => {
        const response = await fetch('/api/admin/cache/clear', { method: 'POST' });
        if (response.ok && onSystemAction) {
          onSystemAction('cache-cleared');
        }
      }
    },
    {
      id: 'maintenance-mode',
      title: 'Maintenance Mode',
      description: 'Enable/disable system maintenance',
      icon: Settings,
      category: 'system',
      confirmRequired: true,
      confirmText: 'This will affect all users. Continue?',
      action: async () => {
        if (onSystemAction) {
          onSystemAction('maintenance-toggle');
        }
      }
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      description: 'Run system security check',
      icon: Shield,
      category: 'system',
      action: async () => {
        const response = await fetch('/api/admin/security/scan', { method: 'POST' });
        if (response.ok && onSystemAction) {
          onSystemAction('security-scan-started');
        }
      }
    }
  ];

  const categories = [
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'studies', name: 'Study Management', icon: FileText },
    { id: 'system', name: 'System Actions', icon: Settings }
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>

        <div className="space-y-6">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            const categoryActions = quickActions.filter(action => action.category === category.id);
            
            return (
              <div key={category.id}>
                <div className="flex items-center space-x-2 mb-3">
                  <CategoryIcon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {categoryActions.map((action) => {
                    const ActionIcon = action.icon;
                    const isLoading = loading === action.id;
                    
                    return (
                      <button
                        key={action.id}
                        onClick={() => executeAction(action)}
                        disabled={isLoading}
                        className="flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <ActionIcon className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{action.title}</div>
                            <div className="text-xs text-gray-500">{action.description}</div>
                          </div>
                        </div>
                        {isLoading && (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {confirmAction.confirmText || `Are you sure you want to ${confirmAction.title.toLowerCase()}?`}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndExecute}
                disabled={loading === confirmAction.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading === confirmAction.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActionsPanel;
