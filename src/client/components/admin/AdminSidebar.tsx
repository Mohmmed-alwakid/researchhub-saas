import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

import { Link } from 'react-router-dom';

interface AdminRoute {
  path: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface AdminSidebarProps {
  routes: AdminRoute[];
  currentPath: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  routes,
  currentPath,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div className={clsx(
      'fixed left-0 top-0 h-full bg-gray-900 text-white shadow-xl transition-all duration-300 z-30',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-bold">Afkar</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = currentPath === route.path || 
            (route.path !== '/admin' && currentPath.startsWith(route.path));

          return (
            <Link
              key={route.path}
              to={route.path}
              className={clsx(
                'flex items-center p-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
              title={isCollapsed ? route.label : undefined}
            >
              <Icon className={clsx(
                'flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-white',
                isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'
              )} />
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{route.label}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {route.description}
                  </div>
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="w-1 h-8 bg-white rounded-full ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        {!isCollapsed ? (
          <div className="text-xs text-gray-400">            <div>Afkar Admin v1.0</div>
            <div>© 2025 Afkar</div>
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-700 rounded mx-auto" />
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
