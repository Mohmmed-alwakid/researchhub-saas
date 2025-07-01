import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Plus, Users, Settings, Activity, BarChart3, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  description: string;
  plan_type: 'starter' | 'professional' | 'enterprise';
  max_members: number;
  created_at: string;
}

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  joined_at: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  member_count: number;
  created_at: string;
}

export const OrganizationDashboard: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'teams' | 'settings'>('overview');
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  // Create organization form state
  const [newOrgForm, setNewOrgForm] = useState<{
    name: string;
    description: string;
    plan_type: 'starter' | 'professional' | 'enterprise';
  }>({
    name: '',
    description: '',
    plan_type: 'starter'
  });

  // Invite member form state
  const [inviteForm, setInviteForm] = useState<{
    email: string;
    role: 'owner' | 'admin' | 'member';
  }>({
    email: '',
    role: 'member'
  });

  // Create team form state
  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    description: ''
  });

  const fetchOrganizations = useCallback(async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch organizations');

      const responseData = await response.json();
      setOrganizations(responseData.organizations || []);
      
      if (responseData.organizations?.length > 0 && !selectedOrg) {
        setSelectedOrg(responseData.organizations[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (selectedOrg) {
      fetchOrgDetails(selectedOrg.id);
    }
  }, [selectedOrg]);

  const fetchOrgDetails = async (orgId: string) => {
    try {
      const token = localStorage.getItem('supabase_token');
      
      // Fetch members
      const membersResponse = await fetch(`/api/organizations/${orgId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setOrgMembers(membersData.members || []);
      }

      // Fetch teams
      const teamsResponse = await fetch(`/api/organizations/${orgId}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  const createOrganization = async () => {
    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrgForm)
      });

      if (!response.ok) throw new Error('Failed to create organization');

      await response.json();
      toast.success('Organization created successfully');
      setShowCreateOrg(false);
      setNewOrgForm({ name: '', description: '', plan_type: 'starter' });
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization');
    }
  };

  const inviteMember = async () => {
    if (!selectedOrg) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/organizations/${selectedOrg.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteForm)
      });

      if (!response.ok) throw new Error('Failed to invite member');

      toast.success('Member invited successfully');
      setInviteForm({ email: '', role: 'member' });
      fetchOrgDetails(selectedOrg.id);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to invite member');
    }
  };

  const createTeam = async () => {
    if (!selectedOrg) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/organizations/${selectedOrg.id}/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeamForm)
      });

      if (!response.ok) throw new Error('Failed to create team');

      toast.success('Team created successfully');
      setNewTeamForm({ name: '', description: '' });
      fetchOrgDetails(selectedOrg.id);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!selectedOrg) return;

    try {
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`/api/organizations/${selectedOrg.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to remove member');

      toast.success('Member removed successfully');
      fetchOrgDetails(selectedOrg.id);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (organizations.length === 0 && !showCreateOrg) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Organizations</h1>
          <p className="text-gray-600 mb-8">You don't belong to any organizations yet.</p>
          <Button onClick={() => setShowCreateOrg(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Organization
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Button onClick={() => setShowCreateOrg(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organization Selector */}
      <div className="mb-6">
        <Label htmlFor="org-select">Select Organization</Label>
        <select
          id="org-select"
          value={selectedOrg?.id || ''}
          onChange={(e) => {
            const org = organizations.find(o => o.id === e.target.value);
            setSelectedOrg(org || null);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {organizations.map(org => (
            <option key={org.id} value={org.id}>
              {org.name} ({org.plan_type})
            </option>
          ))}
        </select>
      </div>

      {selectedOrg && (
        <>
          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'members', label: 'Members', icon: Users },
                { id: 'teams', label: 'Teams', icon: Shield },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'members' | 'teams' | 'settings')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orgMembers.length}</div>
                  <div className="text-sm text-gray-600">
                    of {selectedOrg.max_members} max
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                  <div className="text-sm text-gray-600">Active teams</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="capitalize">
                    {selectedOrg.plan_type}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">
                    Current plan
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Invite Member Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Invite New Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="invite-email">Email</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="colleague@company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role">Role</Label>
                      <select
                        id="invite-role"
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'owner' | 'admin' | 'member' })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={inviteMember} className="w-full">
                        Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orgMembers.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {member.user_first_name} {member.user_last_name}
                          </div>
                          <div className="text-sm text-gray-600">{member.user_email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {member.role}
                          </Badge>
                          {member.role !== 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMember(member.id)}
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

          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Create Team Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={newTeamForm.name}
                        onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                        placeholder="Research Team Alpha"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team-description">Description</Label>
                      <Input
                        id="team-description"
                        value={newTeamForm.description}
                        onChange={(e) => setNewTeamForm({ ...newTeamForm, description: e.target.value })}
                        placeholder="Team description"
                      />
                    </div>
                  </div>
                  <Button onClick={createTeam} className="mt-4">
                    Create Team
                  </Button>
                </CardContent>
              </Card>

              {/* Teams List */}
              <Card>
                <CardHeader>
                  <CardTitle>Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map(team => (
                      <div key={team.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-gray-500">
                            {team.member_count} members
                          </span>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={selectedOrg.name}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-description">Description</Label>
                    <Textarea
                      id="org-description"
                      value={selectedOrg.description}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Plan Type</Label>
                    <div className="mt-1">
                      <Badge variant="secondary" className="capitalize">
                        {selectedOrg.plan_type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <div className="mt-1 text-sm text-gray-600">
                      {new Date(selectedOrg.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Organization</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-org-name">Organization Name</Label>
                <Input
                  id="new-org-name"
                  value={newOrgForm.name}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
                  placeholder="My Research Organization"
                />
              </div>
              <div>
                <Label htmlFor="new-org-description">Description</Label>
                <Textarea
                  id="new-org-description"
                  value={newOrgForm.description}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, description: e.target.value })}
                  placeholder="Describe your organization..."
                />
              </div>
              <div>
                <Label htmlFor="new-org-plan">Plan Type</Label>
                <select
                  id="new-org-plan"
                  value={newOrgForm.plan_type}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, plan_type: e.target.value as 'starter' | 'professional' | 'enterprise' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={() => setShowCreateOrg(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={createOrganization}>
                Create Organization
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;
