import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  X,
  Check,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useFeatureFlags } from '../../../shared/config/featureFlags';
import { ComingSoon } from '../common/ComingSoon';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number; // 1-5 security level
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  userCount: number;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

const RolePermissionManager: React.FC = () => {
  const { ENABLE_ROLE_PERMISSION_MANAGER } = useFeatureFlags();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [loading, setLoading] = useState(true);

  const organizePermissionsByCategory = useCallback(() => {
    const categories: { [key: string]: Permission[] } = {};
    
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });

    const organized = Object.entries(categories).map(([name, perms]) => ({
      name,
      permissions: perms.sort((a, b) => a.level - b.level)
    }));

    setPermissionCategories(organized);
  }, [permissions]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (permissions.length > 0) {
      organizePermissionsByCategory();
    }
  }, [permissions, organizePermissionsByCategory]);

  const fetchRoles = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRoles: Role[] = [
        {
          id: 'participant',
          name: 'Participant',
          description: 'Basic user role for study participants',
          level: 1,
          userCount: 2147,
          permissions: [
            'STUDY_PARTICIPATE',
            'PROFILE_VIEW_OWN',
            'PROFILE_EDIT_OWN'
          ],
          isSystemRole: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'researcher',
          name: 'Researcher',
          description: 'Users who can create and manage studies',
          level: 2,
          userCount: 456,
          permissions: [
            'STUDY_PARTICIPATE',
            'STUDY_CREATE',
            'STUDY_EDIT_OWN',
            'STUDY_DELETE_OWN',
            'STUDY_VIEW_OWN',
            'STUDY_PUBLISH',
            'PARTICIPANT_INVITE',
            'ANALYTICS_VIEW_OWN',
            'PROFILE_VIEW_OWN',
            'PROFILE_EDIT_OWN'
          ],
          isSystemRole: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: 'admin',
          name: 'Admin',
          description: 'Administrative users with elevated privileges',
          level: 4,
          userCount: 12,
          permissions: [
            'USER_CREATE',
            'USER_EDIT',
            'USER_DELETE',
            'USER_MANAGE_ROLES',
            'STUDY_VIEW_ALL',
            'STUDY_EDIT_ALL',
            'STUDY_DELETE_ALL',
            'ANALYTICS_VIEW_ALL',
            'PAYMENT_REFUND',
            'SYSTEM_MONITOR',
            'SETTINGS_MANAGE'
          ],
          isSystemRole: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: 'super_admin',
          name: 'Super Admin',
          description: 'Full system access with all privileges',
          level: 5,
          userCount: 3,
          permissions: [
            'USER_CREATE',
            'USER_EDIT',
            'USER_DELETE',
            'USER_MANAGE_ROLES',
            'ROLE_CREATE',
            'ROLE_EDIT',
            'ROLE_DELETE',
            'PERMISSION_MANAGE',
            'STUDY_VIEW_ALL',
            'STUDY_EDIT_ALL',
            'STUDY_DELETE_ALL',
            'ANALYTICS_VIEW_ALL',
            'PAYMENT_REFUND',
            'SYSTEM_MONITOR',
            'SETTINGS_MANAGE',
            'SYSTEM_MAINTENANCE'
          ],
          isSystemRole: true,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2024-01-25')
        }
      ];
      setRoles(mockRoles);
      setSelectedRole(mockRoles[0]);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPermissions: Permission[] = [
        // User Management
        { id: 'USER_CREATE', name: 'Create Users', description: 'Create new user accounts', category: 'User Management', level: 4 },
        { id: 'USER_EDIT', name: 'Edit Users', description: 'Modify user account details', category: 'User Management', level: 4 },
        { id: 'USER_DELETE', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management', level: 5 },
        { id: 'USER_MANAGE_ROLES', name: 'Manage User Roles', description: 'Assign roles to users', category: 'User Management', level: 4 },
        
        // Role Management
        { id: 'ROLE_CREATE', name: 'Create Roles', description: 'Create new roles', category: 'Role Management', level: 5 },
        { id: 'ROLE_EDIT', name: 'Edit Roles', description: 'Modify role permissions', category: 'Role Management', level: 5 },
        { id: 'ROLE_DELETE', name: 'Delete Roles', description: 'Remove roles', category: 'Role Management', level: 5 },
        { id: 'PERMISSION_MANAGE', name: 'Manage Permissions', description: 'Assign permissions to roles', category: 'Role Management', level: 5 },
        
        // Study Management
        { id: 'STUDY_CREATE', name: 'Create Studies', description: 'Create new research studies', category: 'Study Management', level: 2 },
        { id: 'STUDY_EDIT_OWN', name: 'Edit Own Studies', description: 'Modify own studies', category: 'Study Management', level: 2 },
        { id: 'STUDY_EDIT_ALL', name: 'Edit All Studies', description: 'Modify any study', category: 'Study Management', level: 4 },
        { id: 'STUDY_DELETE_OWN', name: 'Delete Own Studies', description: 'Remove own studies', category: 'Study Management', level: 2 },
        { id: 'STUDY_DELETE_ALL', name: 'Delete All Studies', description: 'Remove any study', category: 'Study Management', level: 4 },
        { id: 'STUDY_VIEW_OWN', name: 'View Own Studies', description: 'Access own studies', category: 'Study Management', level: 2 },
        { id: 'STUDY_VIEW_ALL', name: 'View All Studies', description: 'Access all studies', category: 'Study Management', level: 4 },
        { id: 'STUDY_PUBLISH', name: 'Publish Studies', description: 'Make studies public', category: 'Study Management', level: 2 },
        { id: 'STUDY_PARTICIPATE', name: 'Participate in Studies', description: 'Join research studies', category: 'Study Management', level: 1 },
        
        // Analytics
        { id: 'ANALYTICS_VIEW_OWN', name: 'View Own Analytics', description: 'Access personal analytics', category: 'Analytics', level: 2 },
        { id: 'ANALYTICS_VIEW_ALL', name: 'View All Analytics', description: 'Access system-wide analytics', category: 'Analytics', level: 4 },
        
        // System
        { id: 'SYSTEM_MONITOR', name: 'System Monitoring', description: 'Monitor system health and performance', category: 'System', level: 4 },
        { id: 'SYSTEM_MAINTENANCE', name: 'System Maintenance', description: 'Perform system maintenance tasks', category: 'System', level: 5 },
        { id: 'SETTINGS_MANAGE', name: 'Manage Settings', description: 'Modify system settings', category: 'System', level: 4 },
        
        // Profile
        { id: 'PROFILE_VIEW_OWN', name: 'View Own Profile', description: 'Access personal profile', category: 'Profile', level: 1 },
        { id: 'PROFILE_EDIT_OWN', name: 'Edit Own Profile', description: 'Modify personal profile', category: 'Profile', level: 1 },
        
        // Payment
        { id: 'PAYMENT_REFUND', name: 'Process Refunds', description: 'Issue payment refunds', category: 'Payment', level: 4 },
        
        // Participants
        { id: 'PARTICIPANT_INVITE', name: 'Invite Participants', description: 'Send study invitations', category: 'Participants', level: 2 }
      ];
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedRole || selectedRole.isSystemRole) return;

    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(id => id !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map(role => role.id === selectedRole.id ? updatedRole : role));
  };

  const getSecurityLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-600 bg-green-50';
      case 2: return 'text-blue-600 bg-blue-50';
      case 3: return 'text-yellow-600 bg-yellow-50';
      case 4: return 'text-orange-600 bg-orange-50';
      case 5: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSecurityLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Basic';
      case 2: return 'Standard';
      case 3: return 'Elevated';
      case 4: return 'Administrative';
      case 5: return 'System Critical';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      {!ENABLE_ROLE_PERMISSION_MANAGER && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm">
          <ComingSoon
            variant="overlay"
            title="Role & Permission Manager"
            description="Configure user roles and manage granular access permissions with our comprehensive role-based access control system."
            features={[
              "Create and manage custom user roles",
              "Granular permission management",
              "Role-based access control (RBAC)",
              "Permission inheritance and hierarchies",
              "Audit logs for permission changes",
              "Bulk permission assignments"
            ]}
            expectedRelease="Q4 2024"
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission Manager</h1>
          <p className="text-gray-600">Configure roles and manage access permissions</p>
        </div>        <button
          onClick={() => {
            // TODO: Implement create role functionality
            console.log('Create role feature coming soon');
            setShowCreateRole(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Roles</h3>
              <p className="text-sm text-gray-600">Select a role to manage permissions</p>
            </div>
            <div className="p-4 space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedRole?.id === role.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        {role.name}
                        {role.isSystemRole && (
                          <Lock className="w-3 h-3 ml-2 text-gray-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSecurityLevelColor(role.level)}`}>
                          Level {role.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {role.userCount} users
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Management */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      {selectedRole.name} Permissions
                      {selectedRole.isSystemRole && (
                        <Lock className="w-4 h-4 ml-2 text-gray-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedRole.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSecurityLevelColor(selectedRole.level)}`}>
                        {getSecurityLevelLabel(selectedRole.level)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {selectedRole.permissions.length} permissions assigned
                      </span>
                    </div>
                  </div>
                  {!selectedRole.isSystemRole && (                    <button
                      onClick={() => {
                        // TODO: Implement edit role functionality
                        console.log('Edit role feature coming soon');
                        setEditingRole(selectedRole);
                      }}
                      className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
                
                {selectedRole.isSystemRole && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        This is a system role. Permissions cannot be modified.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {permissionCategories.map((category) => (
                  <div key={category.name}>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                      {category.name}
                    </h4>
                    <div className="space-y-2">
                      {category.permissions.map((permission) => {
                        const hasPermission = selectedRole.permissions.includes(permission.id);
                        const isDisabled = selectedRole.isSystemRole;
                        
                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              hasPermission 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            } ${isDisabled ? 'opacity-60' : ''}`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{permission.name}</div>
                                  <div className="text-sm text-gray-600">{permission.description}</div>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSecurityLevelColor(permission.level)}`}>
                                  L{permission.level}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePermissionToggle(permission.id)}
                              disabled={isDisabled}
                              className={`ml-4 p-2 rounded-lg transition-colors ${
                                hasPermission
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {hasPermission ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Selected</h3>
              <p className="text-gray-600">Select a role from the list to manage its permissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-50">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {roles.reduce((sum, role) => sum + role.userCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-50">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{permissions.length}</div>
            <div className="text-sm text-gray-600">Available Permissions</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-orange-50">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {roles.filter(role => role.isSystemRole).length}
            </div>
            <div className="text-sm text-gray-600">System Roles</div>
          </div>        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Create New Role</h3>
            <p className="text-gray-600 mb-4">Role creation feature coming soon.</p>
            <button
              onClick={() => setShowCreateRole(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Role: {editingRole.name}</h3>
            <p className="text-gray-600 mb-4">Role editing feature coming soon.</p>
            <button
              onClick={() => setEditingRole(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionManager;
