import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Check,
  Plus,
  Search,
  Crown,
  Shield,
  Settings,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { IWorkspace, WorkspaceRole } from '../../../shared/types';

interface WorkspaceSelectorProps {
  workspaces: IWorkspace[];
  currentWorkspace?: IWorkspace;
  userRole?: WorkspaceRole;
  onWorkspaceSelect: (workspace: IWorkspace) => void;
  onCreateWorkspace: () => void;
  className?: string;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  currentWorkspace,
  userRole,
  onWorkspaceSelect,
  onCreateWorkspace,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter workspaces based on search
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-amber-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'editor':
        return <Settings className="h-3 w-3 text-green-500" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleWorkspaceSelect = (workspace: IWorkspace) => {
    onWorkspaceSelect(workspace);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
            <Building2 className="h-3 w-3 text-white" />
          </div>
          <span className="font-medium text-gray-900 truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
          {userRole && getRoleIcon(userRole)}
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Workspace List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredWorkspaces.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'No workspaces found' : 'No workspaces available'}
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => {
                const isSelected = workspace._id === currentWorkspace?._id;
                
                return (
                  <button
                    key={workspace._id}
                    onClick={() => handleWorkspaceSelect(workspace)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 
                      transition-colors duration-150 text-left
                      ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {workspace.name}
                          </span>
                          {getRoleIcon(userRole || 'viewer')}
                        </div>
                        {workspace.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {workspace.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={workspace.status === 'active' ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {workspace.status}
                          </Badge>
                          {workspace.subscription && (
                            <Badge variant="secondary" size="sm">
                              {workspace.subscription.plan}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Create New Workspace */}
          <div className="border-t border-gray-100 p-3">
            <Button
              onClick={handleCreateWorkspace}
              variant="secondary"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Workspace
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
