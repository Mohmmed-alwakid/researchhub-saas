import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LiveCursorSystem } from './LiveCursorSystem';
import { RealTimeTextEditor } from './RealTimeTextEditor';
import { ConflictResolutionSystem, ConflictData, ConflictResolution } from './ConflictResolutionSystem';
import { CollaboratorPresence } from '../../../shared/types';

export const AdvancedCollaborationDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Demo state
  const [liveCursorsEnabled, setLiveCursorsEnabled] = useState(true);
  const [activeDemo, setActiveDemo] = useState<'cursors' | 'editor' | 'conflicts'>('cursors');
  
  // Mock data for demonstrations
  const mockCollaborators: CollaboratorPresence[] = [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: '',
      status: 'active',
      lastActive: new Date(),
      currentLocation: { studyId: 'demo-study', section: 'blocks' },
      currentElement: 'block-1'
    },
    {
      id: 'user-2', 
      name: 'Mike Rodriguez',
      email: 'mike@example.com',
      avatar: '',
      status: 'active',
      lastActive: new Date(),
      currentLocation: { studyId: 'demo-study', section: 'settings' },
      currentElement: 'study-title'
    },
    {
      id: 'user-3',
      name: 'Alex Kim',
      email: 'alex@example.com', 
      avatar: '',
      status: 'idle',
      lastActive: new Date(Date.now() - 300000), // 5 minutes ago
      currentLocation: { studyId: 'demo-study', section: 'results' }
    }
  ];

  const mockConflicts: ConflictData[] = [
    {
      id: 'conflict-1',
      type: 'edit_conflict',
      severity: 'high',
      title: 'Conflicting Block Edits',
      description: 'Two users are editing the same welcome block simultaneously',
      affectedElement: {
        type: 'block',
        id: 'block-1',
        name: 'Welcome Block'
      },
      conflictingUsers: [
        {
          userId: 'user-1',
          userName: 'Sarah Chen',
          action: 'editing block title',
          timestamp: new Date()
        },
        {
          userId: 'user-2',
          userName: 'Mike Rodriguez', 
          action: 'modifying block settings',
          timestamp: new Date()
        }
      ],
      currentValue: 'Welcome to our study',
      proposedChanges: [
        {
          userId: 'user-1',
          value: 'Welcome to our research study',
          timestamp: new Date(),
          reasoning: 'More formal and professional tone'
        },
        {
          userId: 'user-2',
          value: 'Welcome! Let\'s get started',
          timestamp: new Date(),
          reasoning: 'Friendlier and more engaging'
        }
      ],
      autoResolvable: false,
      requiresApproval: true,
      createdAt: new Date(),
      lastUpdated: new Date()
    },
    {
      id: 'conflict-2',
      type: 'approval_needed',
      severity: 'medium',
      title: 'Study Publication Approval',
      description: 'Study changes require admin approval before publication',
      affectedElement: {
        type: 'study',
        id: 'demo-study',
        name: 'User Experience Research'
      },
      conflictingUsers: [
        {
          userId: 'user-3',
          userName: 'Alex Kim',
          action: 'requesting publication',
          timestamp: new Date()
        }
      ],
      currentValue: 'draft',
      proposedChanges: [
        {
          userId: 'user-3',
          value: 'published',
          timestamp: new Date(),
          reasoning: 'All blocks are complete and ready for participants'
        }
      ],
      autoResolvable: false,
      requiresApproval: true,
      createdAt: new Date(Date.now() - 600000), // 10 minutes ago
      lastUpdated: new Date(Date.now() - 300000) // 5 minutes ago
    }
  ];

  const currentUser = {
    id: 'current-user',
    name: 'You (Demo User)',
    avatar: '',
    role: 'admin'
  };

  const [editorContent, setEditorContent] = useState(
    'This is a collaborative text editor. Multiple users can edit this content simultaneously and see real-time changes from their team members.\n\nTry editing this text while imagining other team members are also making changes!'
  );

  const [remoteChanges, setRemoteChanges] = useState<Array<{
    content: string;
    userId: string;
    timestamp: number;
    cursorPosition?: number;
  }>>([]);

  // Demo functions
  const handleCursorMove = (x: number, y: number, element?: string) => {
    console.log('Cursor moved:', { x, y, element });
  };

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
  };

  const handleRealTimeChange = (content: string, cursorPosition: number) => {
    // Simulate broadcasting to other users
    console.log('Real-time change:', { content, cursorPosition });
  };

  const handleConflictResolution = (conflictId: string, resolution: ConflictResolution) => {
    console.log('Conflict resolved:', { conflictId, resolution });
    // In a real app, this would send the resolution to the server
  };

  const handleRequestResolution = (conflictId: string, userId: string) => {
    console.log('Resolution requested:', { conflictId, userId });
    // In a real app, this would notify the specified user
  };

  const simulateRemoteEdit = () => {
    const newContent = editorContent + '\n\n[Simulated edit from ' + mockCollaborators[0].name + ']';
    setRemoteChanges([{
      content: newContent,
      userId: mockCollaborators[0].id,
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="advanced-collaboration-demo p-6 max-w-6xl mx-auto space-y-6">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          🚀 Advanced Real-time Collaboration Features
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Experience live cursors, real-time editing, and intelligent conflict resolution
        </p>
        
        {/* Feature Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={activeDemo === 'cursors' ? 'primary' : 'outline'}
            onClick={() => setActiveDemo('cursors')}
          >
            Live Cursors
          </Button>
          <Button
            variant={activeDemo === 'editor' ? 'primary' : 'outline'}
            onClick={() => setActiveDemo('editor')}
          >
            Real-time Editor
          </Button>
          <Button
            variant={activeDemo === 'conflicts' ? 'primary' : 'outline'}
            onClick={() => setActiveDemo('conflicts')}
          >
            Conflict Resolution
          </Button>
        </div>
      </div>

      {/* Demo Content */}
      {activeDemo === 'cursors' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Live Cursor System Demo
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant="success">
                  {mockCollaborators.filter(c => c.status === 'active').length} Active
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLiveCursorsEnabled(!liveCursorsEnabled)}
                >
                  {liveCursorsEnabled ? 'Hide' : 'Show'} Cursors
                </Button>
              </div>
            </div>

            {/* Cursor Demo Area */}
            <div 
              ref={containerRef}
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 min-h-[300px] bg-gray-50 dark:bg-gray-800"
            >
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Move your cursor around this area to see how the live cursor system works.
                  The colored cursors below represent your team members:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockCollaborators.map((collaborator, index) => (
                    <div key={collaborator.id} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ['#3B82F6', '#EF4444', '#10B981'][index] }}
                        />
                        <span className="font-medium text-sm">{collaborator.name}</span>
                        <Badge variant={collaborator.status === 'active' ? 'success' : 'secondary'} size="sm">
                          {collaborator.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {collaborator.currentLocation?.section}: {collaborator.currentElement || 'general'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Live Cursor Features:
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Real-time cursor positioning with smooth animations</li>
                    <li>• Color-coded user identification with names</li>
                    <li>• Typing indicators and activity detection</li>
                    <li>• Automatic fade-out for inactive users</li>
                    <li>• Container-relative positioning system</li>
                  </ul>
                </div>
              </div>

              {/* Live Cursor System */}
              <LiveCursorSystem
                collaborators={mockCollaborators}
                currentUserId={currentUser.id}
                containerRef={containerRef as React.RefObject<HTMLElement>}
                enabled={liveCursorsEnabled}
                onCursorMove={handleCursorMove}
              />
            </div>
          </div>
        </Card>
      )}

      {activeDemo === 'editor' && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Real-time Text Editor Demo
              </h2>
              <Button size="sm" onClick={simulateRemoteEdit}>
                Simulate Remote Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Collaborative Editor
                </h3>
                <RealTimeTextEditor
                  editorId="demo-editor"
                  initialValue={editorContent}
                  onChange={handleEditorChange}
                  onRealTimeChange={handleRealTimeChange}
                  remoteChanges={remoteChanges}
                  currentUserId={currentUser.id}
                  variant="professional"
                  rows={8}
                />
              </div>

              {/* Features Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Real-time Features
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      ✅ Live Synchronization
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Changes are synchronized in real-time across all users
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      🎯 Cursor Position Tracking
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Cursor positions are maintained during remote updates
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">
                      👥 Activity Indicators
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Visual feedback shows when others are editing
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">
                      ⚡ Smart Debouncing
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Optimized performance with intelligent update throttling
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Active Collaborators
                  </h4>
                  <div className="space-y-2">
                    {mockCollaborators.slice(0, 2).map(user => (
                      <div key={user.id} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>{user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">editing</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeDemo === 'conflicts' && (
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Conflict Resolution System Demo
            </h2>
            
            <ConflictResolutionSystem
              conflicts={mockConflicts}
              currentUser={currentUser}
              collaborators={mockCollaborators}
              onResolveConflict={handleConflictResolution}
              onRequestResolution={handleRequestResolution}
            />

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                🎯 Conflict Resolution Features
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Automatic conflict detection for simultaneous edits</li>
                <li>• Severity-based prioritization (Critical → Low)</li>
                <li>• Multiple resolution options (Keep, Accept, Merge, Custom)</li>
                <li>• Role-based permission system for conflict resolution</li>
                <li>• Complete audit trail with reasoning and timestamps</li>
                <li>• Smart escalation to appropriate team members</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Demo Footer */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🚀 Advanced Collaboration Ready for Production
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            All features are fully implemented, type-safe, and optimized for real-world usage.
            The collaboration system provides enterprise-grade real-time features with professional UX.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <Badge variant="success">✅ Type Safe</Badge>
            <Badge variant="success">⚡ Optimized</Badge>
            <Badge variant="success">🎨 Professional UI</Badge>
            <Badge variant="success">🔧 Production Ready</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedCollaborationDemo;
