import React from 'react';

/**
 * Loading component for lazy-loaded routes
 */
export const RouteLoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Loading page...</p>
      </div>
    </div>
  );
};

/**
 * Compact loading component for smaller sections
 */
export const ComponentLoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-xs text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default RouteLoadingSpinner;
