import React, { useState } from 'react';
import {
  Upload,
  Download,
  Users,
  CheckCircle,
  X,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';


type BulkOperationType = 'create' | 'update' | 'delete' | 'role_change' | 'notification';
type TabType = 'actions' | 'import' | 'history';

interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
  description: string;
}

interface BulkOperationsProps {
  selectedUserIds: string[];
  onOperationComplete?: (operation: BulkOperation) => void;
  onClose?: () => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedUserIds,
  onOperationComplete,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('actions');
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [notification, setNotification] = useState({
    subject: '',
    message: '',
    template: 'welcome'
  });
  const [roleChange, setRoleChange] = useState({
    newRole: 'participant',
    reason: ''
  });

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUserIds.length === 0) {
      alert('Please select an action and users');
      return;
    }

    const operation: BulkOperation = {
      id: `op_${Date.now()}`,
      type: bulkAction as BulkOperationType,
      status: 'running',
      progress: 0,
      total: selectedUserIds.length,
      processed: 0,
      errors: [],
      created_at: new Date().toISOString(),
      description: getBulkActionDescription(bulkAction, selectedUserIds.length)
    };

    setOperations(prev => [operation, ...prev]);

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          userIds: selectedUserIds,
          data: bulkAction === 'role_change' ? roleChange : 
                bulkAction === 'notification' ? notification : {}
        })
      });

      if (!response.ok) throw new Error('Bulk operation failed');

      const result = await response.json();
      if (result.success) {
        const completedOp = {
          ...operation,
          status: 'completed' as const,
          progress: 100,
          processed: selectedUserIds.length,
          completed_at: new Date().toISOString()
        };
        
        setOperations(prev => prev.map(op => 
          op.id === operation.id ? completedOp : op
        ));
        
        onOperationComplete?.(completedOp);
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      const failedOp = {
        ...operation,
        status: 'failed' as const,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? failedOp : op
      ));
    }
  };

  const handleFileImport = async () => {
    if (!importFile) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    const operation: BulkOperation = {
      id: `import_${Date.now()}`,
      type: 'create',
      status: 'running',
      progress: 0,
      total: 0, // Will be updated after file parsing
      processed: 0,
      errors: [],
      created_at: new Date().toISOString(),
      description: `Importing users from ${importFile.name}`
    };

    setOperations(prev => [operation, ...prev]);

    try {
      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      if (result.success) {
        const completedOp = {
          ...operation,
          status: 'completed' as const,
          progress: 100,
          total: result.data.total,
          processed: result.data.successful,
          errors: result.data.errors || [],
          completed_at: new Date().toISOString()
        };
        
        setOperations(prev => prev.map(op => 
          op.id === operation.id ? completedOp : op
        ));
        
        onOperationComplete?.(completedOp);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      const failedOp = {
        ...operation,
        status: 'failed' as const,
        errors: [error instanceof Error ? error.message : 'Import failed']
      };
      
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? failedOp : op
      ));
    }
  };

  const getBulkActionDescription = (action: string, count: number) => {
    const descriptions: Record<string, string> = {
      'role_change': `Change role for ${count} users`,
      'delete': `Delete ${count} users`,
      'activate': `Activate ${count} users`,
      'deactivate': `Deactivate ${count} users`,
      'notification': `Send notification to ${count} users`,
      'export': `Export data for ${count} users`
    };
    return descriptions[action] || `Bulk action on ${count} users`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Operations</h2>
            <p className="text-gray-600">
              {selectedUserIds.length > 0 && `${selectedUserIds.length} users selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'actions', label: 'Bulk Actions', icon: Settings },
              { key: 'import', label: 'Import Users', icon: Upload },
              { key: 'history', label: 'Operation History', icon: FileText }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabType)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select action...</option>
                      <option value="role_change">Change Role</option>
                      <option value="activate">Activate Users</option>
                      <option value="deactivate">Deactivate Users</option>
                      <option value="notification">Send Notification</option>
                      <option value="export">Export Data</option>
                      <option value="delete">Delete Users (Careful!)</option>
                    </select>
                  </div>
                </div>

                {bulkAction === 'role_change' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Role Change Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
                        <select
                          value={roleChange.newRole}
                          onChange={(e) => setRoleChange({ ...roleChange, newRole: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="participant">Participant</option>
                          <option value="researcher">Researcher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                        <input
                          type="text"
                          value={roleChange.reason}
                          onChange={(e) => setRoleChange({ ...roleChange, reason: e.target.value })}
                          placeholder="Reason for role change..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {bulkAction === 'notification' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                        <select
                          value={notification.template}
                          onChange={(e) => setNotification({ ...notification, template: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="welcome">Welcome Message</option>
                          <option value="reminder">Activity Reminder</option>
                          <option value="update">Platform Update</option>
                          <option value="custom">Custom Message</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          value={notification.subject}
                          onChange={(e) => setNotification({ ...notification, subject: e.target.value })}
                          placeholder="Email subject..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                          value={notification.message}
                          onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                          placeholder="Notification message..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || selectedUserIds.length === 0}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Execute Bulk Action</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Users from CSV</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600">Drop your CSV file here, or click to browse</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Select CSV File
                    </label>
                  </div>
                  {importFile && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">Selected: {importFile.name}</p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">CSV Format Requirements</h4>
                      <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                        <li>Required columns: first_name, last_name, email</li>
                        <li>Optional columns: role, phone, location</li>
                        <li>Default role is 'participant' if not specified</li>
                        <li>Duplicate emails will be skipped</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>
                  <button
                    onClick={handleFileImport}
                    disabled={!importFile}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Users</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Operation History</h3>
              <div className="space-y-3">
                {operations.length > 0 ? (
                  operations.map((operation) => (
                    <div key={operation.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                              {operation.status}
                            </span>
                            <h4 className="font-medium text-gray-900">{operation.description}</h4>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Started: {new Date(operation.created_at).toLocaleString()}</span>
                            {operation.completed_at && (
                              <span>Completed: {new Date(operation.completed_at).toLocaleString()}</span>
                            )}
                            <span>Progress: {operation.processed}/{operation.total}</span>
                          </div>
                          {operation.errors.length > 0 && (
                            <div className="mt-2 text-sm text-red-600">
                              Errors: {operation.errors.join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {operation.status === 'running' && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${operation.progress}%` }}
                              ></div>
                            </div>
                          )}
                          {operation.status === 'completed' && (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          )}
                          {operation.status === 'failed' && (
                            <X className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No operations performed yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
