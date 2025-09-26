import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  UserCheck,
  UserX,
  Crown,
  Activity,
  Users,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import { getAllUsers, updateUser, createUser, deleteUser } from '../../services/admin.service';


// UserManagement component with permanent Advanced Mode and fixed API response handling
// API Response interface to handle backend responses
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: User;
}

interface User {
  id: string;
  _id?: string; // Support both ID formats
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'admin' | 'researcher' | 'participant';
  status?: 'active' | 'inactive' | 'suspended';
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  last_login?: string | null;
  lastLoginAt?: string;
  study_count?: number;
  studiesCreated?: number;
  studiesParticipated?: number;
  engagement_score?: number;
  subscription_status?: string;
  subscription?: string;
  phone?: string;
  location?: string;
  tags?: string[];
}

interface UserFilters {
  role: string;
  status: string;
  search: string;
  dateRange: string;
  subscription: string;
  engagement: string;
}

interface UserModalData {
  id?: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  password?: string;
  first_name?: string;
  last_name?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const showAdvancedMode = true; // Always show advanced mode
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModalData>({
    name: '',
    email: '',
    role: 'participant',
    isActive: true,
    password: ''
  });
  
  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    search: '',
    dateRange: '',
    subscription: '',
    engagement: ''
  });

  // Transform API user to component user format
  const transformUser = (apiUser: Record<string, unknown>): User => {
    // Type assertion for API flexibility - we know the structure but TypeScript doesn't
    const user = apiUser as {
      id?: string;
      _id?: string;
      name?: string;
      first_name?: string;
      last_name?: string;
      email: string;
      role: string;
      status?: string;
      isActive?: boolean;
      created_at?: string;
      createdAt?: string;
      last_login?: string;
      lastLoginAt?: string;
      study_count?: number;
      studiesCreated?: number;
      studiesParticipated?: number;
      engagement_score?: number;
      subscription_status?: string;
      subscription?: string;
      phone?: string;
      location?: string;
      tags?: string[];
    };
    const id = user.id || user._id || '';
    const firstName = user.first_name || user.name?.split(' ')[0] || '';
    const lastName = user.last_name || user.name?.split(' ').slice(1).join(' ') || '';
    const name = user.name || `${firstName} ${lastName}`.trim();
    
    return {
      id,
      _id: user._id,
      name,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      role: user.role as 'admin' | 'researcher' | 'participant',
      status: (user.status as 'active' | 'inactive' | 'suspended') || (user.isActive ? 'active' : 'inactive'),
      isActive: user.isActive ?? (user.status === 'active'),
      created_at: user.created_at || user.createdAt,
      createdAt: user.createdAt || user.created_at,
      last_login: user.last_login || user.lastLoginAt,
      lastLoginAt: user.lastLoginAt || user.last_login,
      study_count: user.study_count || user.studiesCreated || 0,
      studiesCreated: user.studiesCreated || user.study_count || 0,
      studiesParticipated: user.studiesParticipated || 0,
      engagement_score: user.engagement_score || 0,
      subscription_status: user.subscription_status || user.subscription,
      subscription: user.subscription || user.subscription_status,
      phone: user.phone,
      location: user.location,
      tags: user.tags || []
    };
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching users...');
      const response = await getAllUsers({}) as unknown as ApiResponse<User[]>;
      console.log('📦 API Response:', response);
      
      if (response.success) {
        // Handle different response formats - check for users, data, or direct array
        const responseData = response as unknown as Record<string, unknown>;
        const rawUsers = responseData.users || 
                        response.data || 
                        [];
        
        const transformedUsers = (Array.isArray(rawUsers) ? rawUsers : []).map((user: unknown) => transformUser(user as Record<string, unknown>));
        console.log('✅ Transformed users:', transformedUsers.length, 'users found');
        
        setUsers(transformedUsers);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || 
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive) ||
      user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    const user = users.find(u => u.id === userId || u._id === userId);
    if (!user) return;

    if (action === 'edit') {
      setEditingUser({
        id: user.id || user._id,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.role,
        isActive: user.isActive ?? (user.status === 'active'),
        first_name: user.first_name,
        last_name: user.last_name
      });
      setShowEditModal(true);
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this user?')) {
        try {
          const response = await deleteUser(user.id || user._id || '') as unknown as ApiResponse;
          if (response.success) {
            await fetchUsers();
          } else {
            setError(response.error || 'Failed to delete user');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete user');
        }
      }
    } else if (action === 'toggle-status') {
      try {
        const newStatus = !user.isActive;
        const response = await updateUser(user.id || user._id || '', {
          isActive: newStatus
        }) as unknown as ApiResponse;
        
        if (response.success) {
          await fetchUsers();
        } else {
          setError(response.error || 'Failed to update user status');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user status');
      }
    }
  };

  const handleSaveUser = async (userData: UserModalData) => {
    try {
      let response: ApiResponse;
      
      if (userData.id) {
        // Update existing user
        const updateData = {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive
        };
        
        response = await updateUser(userData.id, updateData) as unknown as ApiResponse;
      } else {
        // Create new user - use password from form
        if (!userData.password || userData.password.length < 8) {
          setError('Password is required and must be at least 8 characters long');
          return;
        }
        
        const createData = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role
        };
        
        response = await createUser(createData) as unknown as ApiResponse;
      }
      
      if (response.success) {
        setShowEditModal(false);
        setShowCreateModal(false);
        setEditingUser({
          name: '',
          email: '',
          role: 'participant',
          isActive: true
        });
        await fetchUsers();
      } else {
        setError(response.error || `Failed to ${userData.id ? 'update' : 'create'} user`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${userData.id ? 'update' : 'create'} user`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;
    
    const userIds = Array.from(selectedUsers);
    
    try {
      let promises: Promise<{ success: boolean; error?: string }>[] = [];
      
      switch (action) {
        case 'activate':
          promises = userIds.map(id => updateUser(id, { isActive: true }));
          break;
        case 'deactivate':
          promises = userIds.map(id => updateUser(id, { isActive: false }));
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
            promises = userIds.map(id => deleteUser(id));
          } else {
            return;
          }
          break;
        default:
          return;
      }
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.success).length;
      
      if (successCount > 0) {
        setSelectedUsers(new Set());
        await fetchUsers();
        if (successCount < userIds.length) {
          setError(`${successCount}/${userIds.length} users ${action}d successfully`);
        }
      } else {
        setError(`Failed to ${action} users`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} users`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'researcher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusBadgeColor = (user: User) => {
    const isActive = user.isActive ?? (user.status === 'active');
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getUserDisplayName = (user: User) => {
    return user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingUser({
                name: '',
                email: '',
                role: 'participant',
                isActive: true,
                password: ''
              });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="researcher">Researcher</option>
              <option value="participant">Participant</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && showAdvancedMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.subscription}
                onChange={(e) => setFilters(prev => ({ ...prev, subscription: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active Subscription</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              <select
                value={filters.engagement}
                onChange={(e) => setFilters(prev => ({ ...prev, engagement: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Engagement</option>
                <option value="high">High Engagement</option>
                <option value="medium">Medium Engagement</option>
                <option value="low">Low Engagement</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                <UserCheck className="h-4 w-4 mr-1 inline" />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                <UserX className="h-4 w-4 mr-1 inline" />
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1 inline" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selectedUsers.size === filteredUsers.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    User
                    {sortField === 'name' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('role')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Role
                    {sortField === 'role' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Joined
                    {sortField === 'created_at' && (
                      <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                {showAdvancedMode && (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Studies
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Engagement
                    </th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={showAdvancedMode ? 8 : 6} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={showAdvancedMode ? 8 : 6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedUsers.has(user.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {getUserDisplayName(user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getUserDisplayName(user)}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user)}`}>
                        {user.isActive ?? (user.status === 'active') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(user.created_at || user.createdAt)}
                    </td>
                    {showAdvancedMode && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.study_count || user.studiesCreated || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-12 h-2 bg-gray-200 rounded-full mr-2">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${(user.engagement_score || 0) * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {user.engagement_score || 0}/10
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('toggle-status', user.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ?? (user.status === 'active') ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleUserAction('delete', user.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Statistics */}
      {showAdvancedMode && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive ?? (u.status === 'active')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Researchers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'researcher').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'participant').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUser.id ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingUser({
                    name: '',
                    email: '',
                    role: 'participant',
                    isActive: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter user's full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password (minimum 8 characters)"
                  minLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="participant">Participant</option>
                  <option value="researcher">Researcher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingUser({
                    name: '',
                    email: '',
                    role: 'participant',
                    isActive: true
                  });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveUser(editingUser)}
                disabled={!editingUser.name || !editingUser.email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingUser.id ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
