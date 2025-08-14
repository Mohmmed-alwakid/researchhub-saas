import React from 'react';
import { Link } from 'react-router-dom';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';
import { Button } from '../ui/Button';

interface PublicHeaderProps {
  currentPage?: 'home' | 'pricing' | 'features' | 'about';
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ currentPage = 'home' }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center group">
              <AfkarLogo variant="full" className="h-8 w-auto" />
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`text-sm font-medium transition-colors ${
                currentPage === 'features' 
                  ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${
                currentPage === 'pricing' 
                  ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                currentPage === 'about' 
                  ? 'text-primary-600 border-b-2 border-primary-600 pb-1' 
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link 
              to="/register" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
