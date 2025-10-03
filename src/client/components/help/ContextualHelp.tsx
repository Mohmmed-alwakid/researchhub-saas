import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface ContextualHelpProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  content,
  position = 'top',
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg';
    const sizeClasses = {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96'
    };
    
    const positionClasses = {
      top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
    };

    return `${baseClasses} ${sizeClasses[size]} ${positionClasses[position]}`;
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isVisible && (
        <div ref={tooltipRef} className={getTooltipClasses()}>
          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-white border-gray-200 transform rotate-45 ${
              position === 'top'
                ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r'
                : position === 'bottom'
                ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l'
                : position === 'left'
                ? 'right-[-6px] top-1/2 -translate-y-1/2 border-r border-t'
                : 'left-[-6px] top-1/2 -translate-y-1/2 border-l border-b'
            }`}
          />

          <div className="relative p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 pr-6">
                {title}
              </h4>
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
