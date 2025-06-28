import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Plus, 
  Crown,
  Shield,
  Settings,
  Eye,
  AlertCircle,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { WorkspaceRole } from '../../../shared/types';

interface InviteTeamMemberProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitations: InvitationData[]) => Promise<void>;
  workspaceId: string;
  isLoading?: boolean;
}

interface InvitationData {
  email: string;
  role: WorkspaceRole;
  message?: string;
}

interface EmailInvite {
  id: string;
  email: string;
  role: WorkspaceRole;
  isValid: boolean;
}

const InviteTeamMember: React.FC<InviteTeamMemberProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const [invites, setInvites] = useState<EmailInvite[]>([
    { id: '1', email: '', role: 'viewer', isValid: false }
  ]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions: Array<{ value: WorkspaceRole; label: string; description: string; icon: React.ReactNode }> = [
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Can view studies and results, no editing permissions',
      icon: <Eye className="h-4 w-4 text-gray-500" />
    },
    {
      value: 'editor',
      label: 'Editor',
      description: 'Can create and edit studies, manage participants',
      icon: <Settings className="h-4 w-4 text-green-500" />
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Can manage members, settings, and approve studies',
      icon: <Shield className="h-4 w-4 text-blue-500" />
    },
    {
      value: 'owner',
      label: 'Owner',
      description: 'Full control including billing and workspace management',
      icon: <Crown className="h-4 w-4 text-amber-500" />
    }
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateInvite = (id: string, field: keyof EmailInvite, value: string | WorkspaceRole) => {
    setInvites(prev => prev.map(invite => {
      if (invite.id === id) {
        const updated = { ...invite, [field]: value };
        if (field === 'email') {
          updated.isValid = validateEmail(value as string);
        }
        return updated;
      }
      return invite;
    }));
  };

  const addInvite = () => {
    const newId = Date.now().toString();
    setInvites(prev => [...prev, { id: newId, email: '', role: 'viewer', isValid: false }]);
  };

  const removeInvite = (id: string) => {
    if (invites.length > 1) {
      setInvites(prev => prev.filter(invite => invite.id !== id));
    }
  };

  const handleSubmit = async () => {
    const validInvites = invites.filter(invite => invite.isValid && invite.email.trim());
    
    if (validInvites.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const invitationData: InvitationData[] = validInvites.map(invite => ({
        email: invite.email.trim(),
        role: invite.role,
        message: message.trim() || undefined
      }));

      await onInvite(invitationData);
      
      // Reset form
      setInvites([{ id: '1', email: '', role: 'viewer', isValid: false }]);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send invitations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidInviteCount = () => {
    return invites.filter(invite => invite.isValid && invite.email.trim()).length;
  };

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return 'warning';
      case 'admin':
        return 'default';
      case 'editor':
        return 'success';
      case 'viewer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Team Members</h2>
            <p className="text-gray-600 text-sm mt-1">
              Add new members to your workspace and assign their roles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Email Invites */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Email Invitations</h3>
              <button
                onClick={addInvite}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Add Another
              </button>
            </div>

            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={invite.email}
                          onChange={(e) => updateInvite(invite.id, 'email', e.target.value)}
                          placeholder="colleague@company.com"
                          className={`
                            w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            ${invite.email && !invite.isValid ? 'border-red-300' : 'border-gray-300'}
                          `}
                          disabled={isSubmitting}
                        />
                        {invite.email && invite.isValid && (
                          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                        {invite.email && !invite.isValid && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="w-48">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={invite.role}
                        onChange={(e) => updateInvite(invite.id, 'role', e.target.value as WorkspaceRole)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      >
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {invites.length > 1 && (
                      <button
                        onClick={() => removeInvite(invite.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors mt-6"
                        disabled={isSubmitting}
                        title="Remove invitation"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  {/* Role Description */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {roleOptions.find(option => option.value === invite.role)?.icon}
                    <span>{roleOptions.find(option => option.value === invite.role)?.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to your invitation..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Role Permissions Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Role Permissions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map(role => (
                <div key={role.value} className="flex items-center gap-2">
                  {role.icon}
                  <Badge 
                    variant={getRoleBadgeVariant(role.value)}
                    size="sm"
                  >
                    {role.label}
                  </Badge>
                  <span className="text-xs text-gray-600 truncate">
                    {role.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {getValidInviteCount() > 0 ? (
              `Ready to send ${getValidInviteCount()} invitation${getValidInviteCount() !== 1 ? 's' : ''}`
            ) : (
              'Enter valid email addresses to send invitations'
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={getValidInviteCount() === 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : `Send ${getValidInviteCount() || ''} Invitation${getValidInviteCount() !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteTeamMember;
