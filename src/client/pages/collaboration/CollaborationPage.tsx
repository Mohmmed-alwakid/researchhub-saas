import React from 'react';
import { CollaborationDashboard } from '../../components/collaboration/CollaborationDashboard';
import { useAuthStore } from '../../stores/authStore';
import type { WorkspaceRole } from '../../../shared/types';


const CollaborationPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access collaboration features.</p>
        </div>
      </div>
    );
  }

  // Mock workspace ID - in real app this would come from context or URL params
  const workspaceId = 'workspace-1';

  return (
    <div className="p-6">
      <CollaborationDashboard
        currentUser={{
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email,
          email: user.email,
          avatar: undefined, // SupabaseUser doesn't have avatar yet
          role: (user.role as WorkspaceRole) || 'viewer'
        }}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default CollaborationPage;
