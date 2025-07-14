import React, { useState } from 'react';
import { MessageCircle, Activity, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CollaborationSidebarProps {
  studyTitle: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  studyTitle,
  isOpen,
  onToggle,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'comments' | 'activity'>('team');

  // Mock data for demonstration
  const mockTeamMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      status: 'active',
      currentAction: 'Editing welcome block',
      avatar: null,
      initials: 'SJ'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      status: 'idle',
      currentAction: 'Viewing study settings',
      avatar: null,
      initials: 'MC'
    }
  ];

  const mockComments = [
    {
      id: '1',
      author: 'Sarah Johnson',
      content: 'Should we add a screening question before the welcome screen?',
      timestamp: '2 hours ago',
      replies: 1
    },
    {
      id: '2',
      author: 'Mike Chen',
      content: 'The prototype looks great! Maybe we can add some more interaction points.',
      timestamp: '1 hour ago',
      replies: 0
    }
  ];

  const mockActivity = [
    {
      id: '1',
      type: 'block_added',
      user: 'Sarah Johnson',
      description: 'Added a welcome screen block',
      timestamp: '5 minutes ago'
    },
    {
      id: '2',
      type: 'comment_added',
      user: 'Mike Chen',
      description: 'Added a comment on the prototype block',
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      type: 'study_updated',
      user: 'Sarah Johnson',
      description: 'Updated study title and description',
      timestamp: '30 minutes ago'
    }
  ];

  const tabs = [
    { id: 'team', label: 'Team', icon: Users, count: mockTeamMembers.length },
    { id: 'comments', label: 'Comments', icon: MessageCircle, count: mockComments.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: mockActivity.length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed right-4 top-20 z-40 ${className}`}>
        <Button
          onClick={onToggle}
          className="shadow-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Team ({mockTeamMembers.length})
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">Team Collaboration</h3>
            <p className="text-xs text-gray-500 truncate max-w-48">{studyTitle}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'team' | 'comments' | 'activity')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Active Now ({mockTeamMembers.filter(m => m.status === 'active').length})</h4>
              <div className="space-y-3">
                {mockTeamMembers.filter(m => m.status === 'active').map(member => (
                  <div key={member.id} className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {member.initials}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.currentAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {mockTeamMembers.filter(m => m.status !== 'active').length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Away</h4>
                <div className="space-y-3">
                  {mockTeamMembers.filter(m => m.status !== 'active').map(member => (
                    <div key={member.id} className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.initials}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">{member.name}</p>
                        <p className="text-xs text-gray-500">Last seen 5m ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">Recent Comments</h4>
              <Button size="sm" variant="outline">
                Add Comment
              </Button>
            </div>
            <div className="space-y-4">
              {mockComments.map(comment => (
                <Card key={comment.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-700">
                        {comment.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                        <p className="text-xs text-gray-500">{comment.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      {comment.replies > 0 && (
                        <div className="mt-2">
                          <Button variant="ghost" size="sm">
                            {comment.replies} reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Recent Activity</h4>
            <div className="space-y-3">
              {mockActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Live collaboration active</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationSidebar;
