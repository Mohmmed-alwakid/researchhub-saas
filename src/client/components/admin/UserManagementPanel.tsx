import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Download, RefreshCw, 
  Eye, Settings, UserCheck, UserX, Crown, Shield,
  Mail, BarChart3,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';


interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_active?: string;
  subscription_plan: string;
  subscription_status: string;
  total_revenue: number;
  studies_created: number;
  participants_recruited: number;
  last_login?: string;
  profile_completed: boolean;
  login_attempts: number;
}

interface ApiClient {
  getUsersWithAnalytics(): Promise<{ success: boolean; data?: { users: User[]; total?: number }; error?: string }>;
  getAllUsers(): Promise<{ success: boolean; data?: { users: User[]; total?: number }; error?: string }>;
  suspendUser(id: string, reason: string): Promise<{ success: boolean; error?: string }>;
  updateUserStatus(id: string, status: string, reason: string): Promise<{ success: boolean; error?: string }>;
  // Add other methods as needed
}

interface UserManagementPanelProps {
  apiClient: ApiClient;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ apiClient }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  // Load users data
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getAllUsers();
      if (response.success && response.data?.users) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total || response.data.users.length);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterRole, filterStatus, loadUsers]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.subscription_plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // User actions
  const handleUserAction = async (action: string, userId?: string) => {
    const userIds = userId ? [userId] : selectedUsers;
    
    try {
      switch (action) {
        case 'suspend':
          for (const id of userIds) {
            await apiClient.suspendUser(id, 'Administrative action');
          }
          break;
        case 'activate':
          for (const id of userIds) {
            await apiClient.updateUserStatus(id, 'active', 'Account reactivated');
          }
          break;
        case 'notify':
          // Handle bulk notification
          break;
      }
      
      // Reload users after action
      await loadUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">
            Manage user accounts, subscriptions, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by email or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="participant">Participant</option>
              <option value="researcher">Researcher</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUserAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleUserAction('suspend')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleUserAction('notify')}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan & Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2 text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                          user.role === 'admin' ? 'bg-red-500' :
                          user.role === 'researcher' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}>
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <span className="capitalize">{user.role}</span>
                            {user.role === 'admin' && <Crown className="w-3 h-3 ml-1 text-yellow-500" />}
                            {user.role === 'researcher' && <Shield className="w-3 h-3 ml-1 text-blue-500" />}
                          </div>
                          <div className="text-xs text-gray-400">
                            Joined {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscription_plan === 'free' ? 'bg-gray-100 text-gray-800' :
                          user.subscription_plan === 'basic' ? 'bg-blue-100 text-blue-800' :
                          user.subscription_plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {user.subscription_plan}
                        </span>
                        {user.total_revenue > 0 && (
                          <div className="text-sm text-green-600 font-medium mt-1">
                            {formatCurrency(user.total_revenue)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <BarChart3 className="w-3 h-3 text-gray-400 mr-1" />
                          {user.studies_created} studies
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 text-gray-400 mr-1" />
                          {user.participants_recruited} participants
                        </div>
                        <div className="text-xs text-gray-500">
                          Active: {user.last_active ? formatDate(user.last_active) : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                          {user.status === 'pending' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {user.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          Logins: {user.login_attempts}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="Send Message"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            onClick={() => handleUserAction('suspend', user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Suspend User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUserAction('activate', user.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Activate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalUsers > usersPerPage && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {Math.min((currentPage - 1) * usersPerPage + 1, totalUsers)} to{' '}
                {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage * usersPerPage >= totalUsers}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
