import React from 'react';

const AdminDebugComponent: React.FC = () => {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">🐛 Admin Debug Component</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Current Path:</strong> {currentPath}</p>
        <p><strong>Current Hash:</strong> {currentHash}</p>
        <p><strong>Full URL:</strong> {window.location.href}</p>
        <p><strong>Component Status:</strong> This component is rendering successfully!</p>
        <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border">
        <h3 className="font-semibold text-gray-800">Expected Admin Routes:</h3>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• /app/admin → Overview (AdminOverview)</li>
          <li>• /app/admin/users → User Management</li>
          <li>• /app/admin/subscriptions → Subscriptions</li>
          <li>• /app/admin/analytics → Analytics</li>
          <li>• /app/admin/studies → Study Oversight</li>
          <li>• /app/admin/permissions → Permissions</li>
          <li>• /app/admin/settings → System Settings</li>
          <li>• /app/admin/support → Support Center</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDebugComponent;
