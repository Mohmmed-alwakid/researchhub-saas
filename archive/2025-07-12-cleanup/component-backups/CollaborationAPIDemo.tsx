import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { collaborationService } from '../../services/collaborationService';
import { approvalService } from '../../services/approvalService';
import { commentsService } from '../../services/commentsService';
import type { WorkspaceRole } from '../../../shared/types';

interface CollaborationAPIDemoProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: WorkspaceRole;
  };
  workspaceId: string;
  className?: string;
}

export const CollaborationAPIDemo: React.FC<CollaborationAPIDemoProps> = ({
  currentUser,
  workspaceId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('collaboration');
  const [apiResults, setApiResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  // Initialize services with auth token
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      collaborationService.initialize(token);
      // ApprovalService uses setAuthToken method
      commentsService.setAuthToken(token);
    }
  }, []);

  // Helper to handle API calls with loading and error handling
  const handleApiCall = async (key: string, apiCall: () => Promise<unknown>) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const result = await apiCall();
      setApiResults(prev => ({ ...prev, [key]: result }));
    } catch (error) {
      setApiResults(prev => ({ 
        ...prev, 
        [key]: { error: error instanceof Error ? error.message : 'Unknown error' }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Collaboration API Tests
  const testCollaborationAPIs = {
    joinSession: () => handleApiCall('joinSession', () => 
      collaborationService.joinSession('study', 'study-1', workspaceId)
    ),
    
    getPresence: () => handleApiCall('getPresence', () => 
      collaborationService.getActiveSessions('study', 'study-1')
    ),
    
    updatePresence: () => handleApiCall('updatePresence', () => 
      collaborationService.updatePresence('study', 'study-1', undefined, 'block-1', 'active')
    ),
    
    getActivity: () => handleApiCall('getActivity', () => 
      collaborationService.getActivityFeed('study', 'study-1')
    ),
    
    recordEdit: () => handleApiCall('recordEdit', () => 
      collaborationService.broadcastEdit({
        type: 'update',
        entityType: 'study',
        entityId: 'study-1',
        elementId: 'block-1',
        data: { title: 'Updated Title', content: 'Updated content' }
      })
    )
  };

  // Approval API Tests
  const testApprovalAPIs = {
    getQueue: () => handleApiCall('approvalQueue', () => 
      approvalService.getApprovalQueue(workspaceId)
    ),
    
    requestApproval: () => handleApiCall('requestApproval', () => 
      approvalService.submitForApproval(
        workspaceId,
        'study',
        'study-1',
        'New Study Approval Request',
        'medium',
        'Please review this new study for approval'
      )
    ),
    
    getHistory: () => handleApiCall('approvalHistory', () => 
      approvalService.getApprovalHistory(workspaceId)
    ),
    
    getStats: () => handleApiCall('approvalStats', () => 
      approvalService.getApprovalStats(workspaceId)
    )
  };

  // Comments API Tests
  const testCommentsAPIs = {
    getComments: () => handleApiCall('getComments', () => 
      commentsService.getComments('study-1', 'study')
    ),
    
    addComment: () => handleApiCall('addComment', () => 
      commentsService.addComment(
        'study-1',
        'study', 
        'This is a test comment from the API demo'
      )
    ),
    
    getThreads: () => handleApiCall('getThreads', () => 
      commentsService.getCommentThread('comment-1')
    ),
    
    getMentions: () => handleApiCall('getMentions', () => 
      commentsService.getMentions()
    )
  };

  const renderApiResults = (key: string) => {
    if (loading[key]) {
      return <div className="text-blue-600">Loading...</div>;
    }
    
    const result = apiResults[key];
    if (!result) {
      return <div className="text-gray-500">No data</div>;
    }
    
    // Check if result has an error property (type-safe way)
    if (typeof result === 'object' && result !== null && 'error' in result) {
      return (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          <div className="font-medium">Error:</div>
          <div className="text-sm">{String((result as { error: unknown }).error)}</div>
        </div>
      );
    }
    
    return (
      <div className="bg-green-50 p-3 rounded">
        <div className="text-green-800 font-medium mb-2">Success:</div>
        <pre className="text-xs text-green-700 overflow-auto max-h-32">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Collaboration API Integration Demo
        </h1>
        <p className="text-neutral-600">
          Test real-time collaboration, approval workflows, and comment system APIs
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Badge variant="secondary">User: {currentUser.name}</Badge>
          <Badge variant="secondary">Role: {currentUser.role}</Badge>
          <Badge variant="secondary">Workspace: {workspaceId}</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collaboration">Real-time Collaboration</TabsTrigger>
          <TabsTrigger value="approvals">Approval Workflow</TabsTrigger>
          <TabsTrigger value="comments">Comment System</TabsTrigger>
        </TabsList>

        {/* Collaboration APIs Tab */}
        <TabsContent value="collaboration" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Real-time Collaboration APIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* API Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Actions</h4>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testCollaborationAPIs.joinSession}
                    disabled={loading.joinSession}
                    className="w-full justify-start"
                  >
                    Join Collaboration Session
                  </Button>
                  
                  <Button 
                    onClick={testCollaborationAPIs.getPresence}
                    disabled={loading.getPresence}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get Collaborator Presence
                  </Button>
                  
                  <Button 
                    onClick={testCollaborationAPIs.updatePresence}
                    disabled={loading.updatePresence}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Update My Presence
                  </Button>
                  
                  <Button 
                    onClick={testCollaborationAPIs.getActivity}
                    disabled={loading.getActivity}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get Activity Feed
                  </Button>
                  
                  <Button 
                    onClick={testCollaborationAPIs.recordEdit}
                    disabled={loading.recordEdit}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Record Test Edit
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Results</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div>
                    <div className="text-sm font-medium mb-1">Join Session:</div>
                    {renderApiResults('joinSession')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Presence:</div>
                    {renderApiResults('getPresence')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Activity Feed:</div>
                    {renderApiResults('getActivity')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Record Edit:</div>
                    {renderApiResults('recordEdit')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Approval APIs Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Approval Workflow APIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* API Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Actions</h4>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testApprovalAPIs.getQueue}
                    disabled={loading.approvalQueue}
                    className="w-full justify-start"
                  >
                    Get Approval Queue
                  </Button>
                  
                  <Button 
                    onClick={testApprovalAPIs.requestApproval}
                    disabled={loading.requestApproval}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Request New Approval
                  </Button>
                  
                  <Button 
                    onClick={testApprovalAPIs.getHistory}
                    disabled={loading.approvalHistory}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get Approval History
                  </Button>
                  
                  <Button 
                    onClick={testApprovalAPIs.getStats}
                    disabled={loading.approvalStats}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get Approval Statistics
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Results</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div>
                    <div className="text-sm font-medium mb-1">Approval Queue:</div>
                    {renderApiResults('approvalQueue')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Request Approval:</div>
                    {renderApiResults('requestApproval')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">History:</div>
                    {renderApiResults('approvalHistory')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Statistics:</div>
                    {renderApiResults('approvalStats')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Comments APIs Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Comment System APIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* API Actions */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Actions</h4>
                
                <div className="space-y-2">
                  <Button 
                    onClick={testCommentsAPIs.getComments}
                    disabled={loading.getComments}
                    className="w-full justify-start"
                  >
                    Get Study Comments
                  </Button>
                  
                  <Button 
                    onClick={testCommentsAPIs.addComment}
                    disabled={loading.addComment}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Add Test Comment
                  </Button>
                  
                  <Button 
                    onClick={testCommentsAPIs.getThreads}
                    disabled={loading.getThreads}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get Comment Threads
                  </Button>
                  
                  <Button 
                    onClick={testCommentsAPIs.getMentions}
                    disabled={loading.getMentions}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    Get My Mentions
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Results</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div>
                    <div className="text-sm font-medium mb-1">Comments:</div>
                    {renderApiResults('getComments')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Add Comment:</div>
                    {renderApiResults('addComment')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Threads:</div>
                    {renderApiResults('getThreads')}
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Mentions:</div>
                    {renderApiResults('getMentions')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Connection Status */}
      <Card className="p-4 mt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Connection Status:</span>
            <Badge variant="success" className="ml-2">WebSocket Ready</Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setApiResults({});
              setLoading({});
            }}
          >
            Clear Results
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CollaborationAPIDemo;
