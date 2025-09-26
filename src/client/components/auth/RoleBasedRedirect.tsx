import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';


/**
 * Component that redirects users to appropriate dashboard based on their role
 */
const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'participant':
          navigate('/app/participant-dashboard', { replace: true });
          break;
        case 'admin':
        case 'super_admin':
          navigate('/app/admin', { replace: true });
          break;
        case 'researcher':
        default:
          navigate('/app/dashboard', { replace: true });
          break;
      }
    }
  }, [user, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default RoleBasedRedirect;
