import React, { useState } from 'react';
import { Bug, Send } from 'lucide-react';

interface FloatingReportButtonProps {
  className?: string;
  showInProduction?: boolean;
}

/**
 * Floating Report Button
 * Simple bug report button for development
 */
export const FloatingReportButton: React.FC<FloatingReportButtonProps> = ({
  className = '',
  showInProduction = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [reportText, setReportText] = useState('');

  // Only show in development mode unless explicitly set to show in production
  const isDevelopment = import.meta.env.DEV;
  if (!isDevelopment && !showInProduction) {
    return null;
  }

  const handleSubmitReport = () => {
    if (reportText.trim()) {
      // In a real implementation, this would send to an API
      console.log('Bug Report:', {
        text: reportText,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      setReportText('');
      setIsVisible(false);
      // Could show a toast notification here
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isVisible && (
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <button
            onClick={() => setIsVisible(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 group"
            title="Report an issue or bug"
          >
            <Bug className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Report a bug or issue
            </div>
          </button>
        </div>
      )}

      {/* Quick Report Modal */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Report Issue</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Describe the issue you encountered..."
            className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={!reportText.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingReportButton;
