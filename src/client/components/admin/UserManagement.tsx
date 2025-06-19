import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  Activity,
  Users
} from 'lucide-react';
import { getAllUsers, updateUser, createUser, deleteUser, bulkUpdateUsers } from '../../services/admin.service';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string; // Using string to match API response
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  // Additional computed fields
  subscription?: string;
  studiesCreated?: number;
  studiesParticipated?: number;
}

interface ApiUser {
  _id?: string;
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  created_at?: string;
  lastLoginAt?: string;
  last_login_at?: string;
  subscription?: string;
  subscription_tier?: string;
  studiesCreated?: number;
  studiesParticipated?: number;
}

interface UserFilters {
  role: string;
  status: string;
  subscription: string;
  searchQuery: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    subscription: 'all',
    searchQuery: ''  });

  useEffect(() => {
    fetchUsers();
  }, []);  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: 1,
        limit: 100, // Get more users for admin view
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      
      console.log('API Response:', response); // Debug log
      
      // Handle both nested and direct data structures
      const userData = response.data?.data || response.data || response;
      
      if (!Array.isArray(userData)) {
        console.error('Invalid user data structure:', userData);
        setUsers([]);
        return;
      }      // Map the API response to match our component interface
      const mappedUsers: User[] = userData.map((user: ApiUser) => ({
        _id: user._id || user.id || '',
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name',
        email: user.email,
        role: user.role || 'participant',
        isActive: user.isActive !== undefined ? user.isActive : (user.status === 'active'),
        createdAt: user.createdAt || user.created_at || '',
        lastLoginAt: user.lastLoginAt || user.last_login_at,
        subscription: user.subscription || user.subscription_tier || 'free',
        studiesCreated: user.studiesCreated || 0,
        studiesParticipated: user.studiesParticipated || 0
      }));
      
      console.log('Mapped users:', mappedUsers); // Debug log
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback to empty array if API fails
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  const applyFilters = useCallback(() => {
    let filtered = users;

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (filters.status === 'inactive' || filters.status === 'suspended') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    // Subscription filter
    if (filters.subscription !== 'all') {
      filtered = filtered.filter(user => user.subscription === filters.subscription);
    }    setFilteredUsers(filtered);
  }, [users, filters]);

  useEffect(() => {
    applyFilters();
  }, [users, filters, applyFilters]);
  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'activate':
          await updateUser(userId, { isActive: true });
          setUsers(users.map(user => 
            user._id === userId ? { ...user, isActive: true } : user
          ));
          break;
        case 'suspend':
          await updateUser(userId, { isActive: false });
          setUsers(users.map(user => 
            user._id === userId ? { ...user, isActive: false } : user
          ));
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            await deleteUser(userId);
            setUsers(users.filter(user => user._id !== userId));
          }
          break;
        case 'edit': {
          const userToEdit = users.find(user => user._id === userId);
          if (userToEdit) {
            setEditingUser(userToEdit);
            setShowUserModal(true);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Failed to perform user action:', error);
      alert('Failed to perform action. Please try again.');
    }  };
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      console.log('handleSaveUser called with:', userData);
      
      if (editingUser) {
        // Update existing user
        console.log('Updating user:', editingUser._id, userData);
        const updatedUser = await updateUser(editingUser._id, {
          name: userData.name,
          role: userData.role,
          isActive: userData.isActive
        });
        
        console.log('Update response:', updatedUser);
        
        // Update local state
        const updatedUsers = users.map(user => 
          user._id === editingUser._id 
            ? {
                ...user,
                name: updatedUser.name,
                role: updatedUser.role,
                isActive: updatedUser.isActive
              }
            : user
        );
        setUsers(updatedUsers);
      } else {
        // Create new user
        console.log('Creating new user:', userData);
        const newUserData = {
          name: userData.name!,
          email: userData.email!,
          password: (userData as User & { password: string }).password,
          role: userData.role!,
          isActive: userData.isActive ?? true
        };
        
        console.log('Sending create user request:', newUserData);
        const newUser = await createUser(newUserData);
        
        console.log('Create user response:', newUser);
        
        // Add to local state
        const mappedUser: User = {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
          lastLoginAt: newUser.lastLoginAt,
          subscription: newUser.subscription || 'free',
          studiesCreated: newUser.studiesCreated || 0,
          studiesParticipated: newUser.studiesParticipated || 0
        };
          setUsers([mappedUser, ...users]);
        console.log('User added to local state');
      }
      
      setShowUserModal(false);
      setEditingUser(null);
      console.log('Modal closed, editing user cleared');
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Failed to ${editingUser ? 'update' : 'create'} user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };
  
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      let apiAction: string;
      switch (action) {
        case 'activate':
          apiAction = 'activate';
          break;
        case 'suspend':
          apiAction = 'deactivate';
          break;
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            return;
          }
          // Delete users one by one since there's no bulk delete in the API
          for (const userId of selectedUsers) {
            await deleteUser(userId);
          }
          setUsers(users.filter(user => !selectedUsers.includes(user._id)));
          setSelectedUsers([]);
          return;
        default:
          throw new Error('Invalid action');
      }

      // Use bulk API for activate/deactivate
      await bulkUpdateUsers({
        userIds: selectedUsers,
        action: apiAction as 'activate' | 'deactivate'
      });

      // Update local state
      setUsers(users.map(user => 
        selectedUsers.includes(user._id) 
          ? { ...user, isActive: action === 'activate' } 
          : user
      ));
      
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      alert('Failed to perform bulk action. Please try again.');
    }
  };
  const getRoleIcon = (role: string) => {
    const roleNormalized = role.toLowerCase();
    switch (roleNormalized) {
      case 'super_admin':
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'researcher':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <UserX className="w-4 h-4 text-gray-600" />;
    }
  };
  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage platform users and their access</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value="participant">Participant</option>
            <option value="researcher">Researcher</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>          {/* Subscription Filter */}
          <select
            value={filters.subscription}
            onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by subscription"
          >
            <option value="all">All Plans</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Activate ({selectedUsers.length})
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Suspend ({selectedUsers.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete ({selectedUsers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(user => user._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="Select all users"
                  />
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select user ${user.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className="ml-2 text-sm font-medium">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </td><td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.isActive)}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.subscription || 'None'}
                  </td>                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600">
                      <div className="flex items-center">
                        <Activity className="w-3 h-3 mr-1" />
                        {user.studiesCreated || 0} studies created
                      </div>
                      <div>{user.studiesParticipated || 0} participated</div>
                    </div>
                  </td>                  <td className="px-6 py-4">
                    <div className="relative">                      <button 
                        onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label="User actions menu"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {dropdownOpen === user._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleUserAction('edit', user._id);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit User
                            </button>
                            {!user.isActive && (
                              <button
                                onClick={() => {
                                  handleUserAction('activate', user._id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                              >
                                Activate
                              </button>
                            )}
                            {user.isActive && (
                              <button
                                onClick={() => {
                                  handleUserAction('suspend', user._id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleUserAction('delete', user._id);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            >
                              Delete User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role.toLowerCase() === 'researcher').length}
          </div>
          <div className="text-sm text-gray-600">Researchers</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.subscription && u.subscription !== 'Free').length}
          </div>
          <div className="text-sm text-gray-600">Paid Subscribers</div>
        </div>      </div>      {/* User Modal - Full Add/Edit User Functionality */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <UserForm 
              user={editingUser}
              onSave={handleSaveUser}
              onCancel={() => setShowUserModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// User Form Component
interface UserFormProps {
  user: User | null;
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'participant',
    isActive: user?.isActive ?? true,
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    }
    
    if (!user && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!user && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive
      };
        if (!user) {
        // Add password for new users
        (userData as User & { password: string }).password = formData.password;
      }
      
      await onSave(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter full name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password (for new users only) */}
      {!user && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role *
        </label>        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select user role"
        >
          <option value="participant">Participant</option>
          <option value="researcher">Researcher</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              checked={formData.isActive}
              onChange={() => setFormData({ ...formData, isActive: true })}
              className="mr-2"
            />
            Active
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              checked={!formData.isActive}
              onChange={() => setFormData({ ...formData, isActive: false })}
              className="mr-2"
            />
            Inactive
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserManagement;
