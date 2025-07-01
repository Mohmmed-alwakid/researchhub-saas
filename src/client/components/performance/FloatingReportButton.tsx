import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import PerformanceReportModal from './PerformanceReportModal';

interface FloatingReportButtonProps {
  className?: string;
  showInProduction?: boolean;
}

export const FloatingReportButton: React.FC<FloatingReportButtonProps> = ({
  className = '',
  showInProduction = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Only show in development mode unless explicitly set to show in production
  const isDevelopment = import.meta.env.DEV;
  if (!isDevelopment && !showInProduction) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <button
          onClick={() => setIsModalOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center space-x-2 group"
          title="Report an issue or bug"
        >
          <Bug className="w-5 h-5" />
          {isHovered && (
            <span className="text-sm font-medium whitespace-nowrap">
              Report Issue
            </span>
          )}
        </button>
        
        {/* Tooltip for better UX */}
        {!isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Report a bug or issue
          </div>
        )}
      </div>

      {/* Performance Report Modal */}
      <PerformanceReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FloatingReportButton;
