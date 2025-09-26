import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { Users, MessageSquare, Clock, Eye, Edit, Share, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

interface StudyCollaborator {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer' | 'reviewer';
  permissions: {
    can_edit: boolean;
    can_review: boolean;
    can_share: boolean;
    can_delete: boolean;
  };
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  added_at: string;
}

interface Study {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  organization_id: string;
  organization_name: string;
}

interface CollaborationComment {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  resolved: boolean;
}

interface CollaborationActivity {
  id: string;
  action: string;
  details: string;
  created_at: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
}

export const StudyCollaborationCenter: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [collaborators, setCollaborators] = useState<StudyCollaborator[]>([]);
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'collaborators' | 'comments' | 'activity'>('overview');

  // Add collaborator form state
  const [addCollaboratorForm, setAddCollaboratorForm] = useState<{
    email: string;
    role: 'editor' | 'viewer' | 'reviewer';
  }>({
    email: '',
    role: 'viewer'
  });

  // New comment form state
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const loadStudies = async () => {
      try {
        const token = localStorage.getItem('supabase_token');
        const response = await fetch('/api/collaboration/studies', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch studies');

        const data = await response.json();
        setStudies(data.studies || []);
        
        if (data.studies?.length > 0 && !selectedStudy) {
          setSelectedStudy(data.studies[0]);
        }
      } catch (error) {
        console.error('Error fetching studies:', error);
        toast.error('Failed to load studies');
      } finally {
        setLoading(false);
      }
    };

    loadStudies();
  }, [selectedStudy]);

  useEffect(() => {
    if (selectedStudy) {
      fetchStudyCollaboration(selectedStudy.id);
    }
  }, [selectedStudy]);

  const fetchStudyCollaboration = async (studyId: string) => {
    try {
      const token = localStorage.getItem('supabase_token');
      
      // Fetch collaborators
      const collaboratorsResponse = await fetch(`/api/collaboration/studies/${studyId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (collaboratorsResponse.ok) {
        const collaboratorsData = await collaboratorsResponse.json();
        setCollaborators(collaboratorsData.collaborators || []);
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/collaboration/studies/${studyId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }

      // Fetch activity
      const activityResponse = await fetch(`/api/collaboration/studies/${studyId}/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivities(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching study collaboration:', error);
    }
  };

  const addCollaborator = async () => {
    if (!selectedStudy) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/collaboration/studies/${selectedStudy.id}/collaborators`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addCollaboratorForm)
      });

      if (!response.ok) throw new Error('Failed to add collaborator');

      toast.success('Collaborator added successfully');
      setAddCollaboratorForm({ email: '', role: 'viewer' });
      fetchStudyCollaboration(selectedStudy.id);
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    if (!selectedStudy) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/collaboration/studies/${selectedStudy.id}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to remove collaborator');

      toast.success('Collaborator removed successfully');
      fetchStudyCollaboration(selectedStudy.id);
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const addComment = async () => {
    if (!selectedStudy || !newComment.trim()) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/collaboration/studies/${selectedStudy.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      toast.success('Comment added successfully');
      setNewComment('');
      fetchStudyCollaboration(selectedStudy.id);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const resolveComment = async (commentId: string) => {
    if (!selectedStudy) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/collaboration/studies/${selectedStudy.id}/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to resolve comment');

      toast.success('Comment resolved');
      fetchStudyCollaboration(selectedStudy.id);
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  const getRoleColor = (role: string): 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (role) {
      case 'owner': return 'success';
      case 'editor': return 'info';
      case 'reviewer': return 'warning';
      default: return 'secondary';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'can_edit': return <Edit className="h-4 w-4" />;
      case 'can_review': return <Eye className="h-4 w-4" />;
      case 'can_share': return <Share className="h-4 w-4" />;
      case 'can_delete': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Study Collaboration</h1>
          <p className="text-gray-600 mb-8">You don't have access to any collaborative studies yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Study Collaboration</h1>
      </div>

      {/* Study Selector */}
      <div className="mb-6">
        <Label htmlFor="study-select">Select Study</Label>
        <select
          id="study-select"
          value={selectedStudy?.id || ''}
          onChange={(e) => {
            const study = studies.find(s => s.id === e.target.value);
            setSelectedStudy(study || null);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {studies.map(study => (
            <option key={study.id} value={study.id}>
              {study.title} ({study.organization_name})
            </option>
          ))}
        </select>
      </div>

      {selectedStudy && (
        <>
          {/* Study Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedStudy.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedStudy.status === 'active' ? 'success' : 'secondary'}>
                      {selectedStudy.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Organization</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    {selectedStudy.organization_name}
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    {new Date(selectedStudy.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label>Description</Label>
                <div className="mt-1 text-sm text-gray-600">
                  {selectedStudy.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Users },
                { id: 'collaborators', label: 'Collaborators', icon: Users },
                { id: 'comments', label: 'Comments', icon: MessageSquare },
                { id: 'activity', label: 'Activity', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'collaborators' | 'comments' | 'activity')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Collaborators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{collaborators.length}</div>
                  <div className="text-sm text-gray-600">Active collaborators</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{comments.length}</div>
                  <div className="text-sm text-gray-600">
                    {comments.filter(c => !c.resolved).length} unresolved
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activities.length}</div>
                  <div className="text-sm text-gray-600">Total activities</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Study Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStudy.status}</div>
                  <div className="text-sm text-gray-600">Current status</div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              {/* Add Collaborator Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Collaborator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="collaborator-email">Email</Label>
                      <Input
                        id="collaborator-email"
                        type="email"
                        value={addCollaboratorForm.email}
                        onChange={(e) => setAddCollaboratorForm({ ...addCollaboratorForm, email: e.target.value })}
                        placeholder="colleague@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="collaborator-role">Role</Label>
                      <select
                        id="collaborator-role"
                        value={addCollaboratorForm.role}
                        onChange={(e) => setAddCollaboratorForm({ ...addCollaboratorForm, role: e.target.value as 'editor' | 'viewer' | 'reviewer' })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="reviewer">Reviewer</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addCollaborator} className="w-full">
                        Add Collaborator
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Collaborators List */}
              <Card>
                <CardHeader>
                  <CardTitle>Study Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collaborators.map(collaborator => (
                      <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {collaborator.user_first_name} {collaborator.user_last_name}
                          </div>
                          <div className="text-sm text-gray-600">{collaborator.user_email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            {Object.entries(collaborator.permissions).map(([permission, hasPermission]) => (
                              hasPermission && (
                                <div key={permission} className="flex items-center gap-1" title={permission}>
                                  {getPermissionIcon(permission)}
                                  <span className="text-xs text-gray-500">
                                    {permission.replace('can_', '').replace('_', ' ')}
                                  </span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleColor(collaborator.role)}>
                            {collaborator.role}
                          </Badge>
                          {collaborator.role !== 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCollaborator(collaborator.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add Comment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-comment">Comment</Label>
                      <textarea
                        id="new-comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your comment..."
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className={`p-4 border rounded-lg ${comment.resolved ? 'bg-gray-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {comment.user_first_name} {comment.user_last_name}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                            <div className="text-gray-800">{comment.content}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {comment.resolved ? (
                              <Badge variant="success">Resolved</Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resolveComment(comment.id)}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-4 border-l-4 border-blue-200">
                      <div className="flex-1">
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-600 mt-1">{activity.details}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          by {activity.user_first_name} {activity.user_last_name} • {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StudyCollaborationCenter;
