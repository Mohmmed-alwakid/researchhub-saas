import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Home,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
  LogOut,
  Compass,
  BookOpen,
  Building,
  Layout,
} from 'lucide-react';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';
import { useAuthStore } from '../../stores/authStore';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Get role-specific navigation
  const getNavigationForRole = () => {
    const userRole = user?.role;
    
    // DEBUG: Enhanced debugging for role detection
    console.log('🔍 AppLayout - Enhanced User Role Debug:', {
      user: user,
      userRole: userRole,
      userRoleType: typeof userRole,
      userEmail: user?.email,
      userFirstName: user?.firstName,
      userLastName: user?.lastName,
      isAuthenticated: user !== null,
      timestamp: new Date().toISOString()
    });
    
    // Additional debug for role comparison
    console.log('🎯 AppLayout - Role Comparison Debug:', {
      'userRole === "participant"': userRole === 'participant',
      'userRole === "researcher"': userRole === 'researcher',
      'userRole === "admin"': userRole === 'admin',
      'userRole === "super_admin"': userRole === 'super_admin',
      'userRole raw': JSON.stringify(userRole),
      'userRole trimmed': userRole?.trim(),
      'userRole toLowerCase': userRole?.toLowerCase()
    });
    
    if (userRole === 'participant') {
      console.log('✅ AppLayout - Returning participant navigation');
      return [
        { name: 'My Applications', href: '/app/participant-dashboard', icon: BookOpen },
        { name: 'Discover Studies', href: '/app/discover', icon: Compass },
        { name: 'Settings', href: '/app/settings', icon: Settings },
      ];
    }
    
    if (userRole === 'researcher') {
      console.log('✅ AppLayout - Returning researcher navigation');
      return [
        { name: 'Dashboard', href: '/app/dashboard', icon: Home },
        { name: 'Studies', href: '/app/studies', icon: FileText },
        { name: 'Templates', href: '/app/templates', icon: Layout },
        { name: 'Participants', href: '/app/participants', icon: Users },
        { name: 'Settings', href: '/app/settings', icon: Settings },
      ];
    }
    
    // For admins and super_admins - include all features
    if (userRole === 'admin' || userRole === 'super_admin') {
      console.log('✅ AppLayout - Returning admin navigation');
      return [
        { name: 'Dashboard', href: '/app/dashboard', icon: Home },
        { name: 'Studies', href: '/app/studies', icon: FileText },
        { name: 'Templates', href: '/app/templates', icon: Layout },
        { name: 'Organizations', href: '/app/organizations', icon: Building },
        { name: 'Participants', href: '/app/participants', icon: Users },
        { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/app/settings', icon: Settings },
      ];
    }
    
    // Default fallback (should not happen with proper role assignment)
    console.warn('🚨 AppLayout - Using default navigation fallback for role:', userRole);
    console.warn('🚨 AppLayout - This indicates an issue with role detection!');
    return [
      { name: 'Dashboard', href: '/app/dashboard', icon: Home },
      { name: 'Settings', href: '/app/settings', icon: Settings },
    ];
  };

  const currentNavigation = getNavigationForRole();

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-50 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link to="/app/dashboard" className="flex items-center">
                <AfkarLogo variant="full" className="h-8 w-auto" />
              </Link>
            </div>
            
            <nav 
              style={{ 
                marginTop: '20px',
                padding: '0 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {currentNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      width: '100%',
                      textDecoration: 'none',
                      backgroundColor: isCurrentPath(item.href) ? '#dbeafe' : 'transparent',
                      color: isCurrentPath(item.href) ? '#1e3a8a' : '#4b5563'
                    }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon style={{ marginRight: '16px', width: '24px', height: '24px', flexShrink: 0 }} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link to="/app/dashboard" className="flex items-center">
                  <AfkarLogo variant="full" className="h-8 w-auto" />
                </Link>
              </div>
              
              <nav 
                style={{ 
                  marginTop: '20px',
                  padding: '0 8px',
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {currentNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        width: '100%',
                        textDecoration: 'none',
                        backgroundColor: isCurrentPath(item.href) ? '#dbeafe' : 'transparent',
                        color: isCurrentPath(item.href) ? '#1e3a8a' : '#4b5563',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon style={{ marginRight: '12px', width: '20px', height: '20px', flexShrink: 0 }} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">          <button
            className="px-4 border-r border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            type="button"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            {/* Empty left space - search was removed */}
            <div></div>
            
            {/* Right side - Notifications, Help, Profile */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Help */}
              <button className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <HelpCircle className="h-6 w-6" />
              </button>              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex">
                  <button 
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </button>
                </div>
                
                {/* Dropdown menu */}
                {showProfileMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/app/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
