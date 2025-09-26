import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AfkarLogo } from '../../assets/brand/AfkarLogo';


const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <AfkarLogo variant="full" className="h-10 w-auto" />
        </div>
        
        {/* 404 Content */}
        <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link 
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Need help? Try these popular pages:</p>
          <div className="space-y-2">
            <Link to="/features" className="block text-sm text-blue-600 hover:text-blue-800">
              Features
            </Link>
            <Link to="/pricing" className="block text-sm text-blue-600 hover:text-blue-800">
              Pricing
            </Link>
            <Link to="/about" className="block text-sm text-blue-600 hover:text-blue-800">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
