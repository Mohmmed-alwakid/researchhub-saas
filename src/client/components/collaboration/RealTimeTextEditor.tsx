import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple debounce implementation to avoid lodash dependency
const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface RealTimeTextEditorProps {
  /** Unique identifier for this text editor */
  editorId: string;
  /** Initial text content */
  initialValue: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Callback when content changes (real-time) */
  onRealTimeChange?: (content: string, cursorPosition: number) => void;
  /** Incoming real-time changes from other users */
  remoteChanges?: {
    content: string;
    userId: string;
    timestamp: number;
    cursorPosition?: number;
  }[];
  /** Current user ID */
  currentUserId: string;
  /** Visual style */
  variant?: 'default' | 'minimal' | 'professional';
  /** Number of rows for textarea */
  rows?: number;
  className?: string;
}

export const RealTimeTextEditor: React.FC<RealTimeTextEditorProps> = ({
  initialValue,
  placeholder = "Start typing...",
  disabled = false,
  onChange,
  onRealTimeChange,
  remoteChanges = [],
  currentUserId,
  variant = 'default',
  rows = 4,
  className = ''
}) => {
  const [content, setContent] = useState(initialValue);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isLocalChange, setIsLocalChange] = useState(false);
  const [lastChangeTime, setLastChangeTime] = useState(Date.now());
  const [remoteUsers, setRemoteUsers] = useState<Set<string>>(new Set());
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastRemoteUpdate = useRef<number>(0);

  // Debounced onChange callback
  const debouncedOnChange = useRef(
    debounce((newContent: string) => {
      onChange(newContent);
    }, 300)
  ).current;

  // Real-time change callback (immediate)
  const handleRealTimeChange = useCallback((newContent: string, position: number) => {
    onRealTimeChange?.(newContent, position);
  }, [onRealTimeChange]);

  // Handle local text changes
  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    const newCursorPosition = event.target.selectionStart;
    
    setIsLocalChange(true);
    setContent(newContent);
    setCursorPosition(newCursorPosition);
    setLastChangeTime(Date.now());
    
    // Immediate real-time update
    handleRealTimeChange(newContent, newCursorPosition);
    
    // Debounced onChange for save operations
    debouncedOnChange(newContent);
    
    // Reset local change flag after processing
    setTimeout(() => setIsLocalChange(false), 100);
  }, [handleRealTimeChange, debouncedOnChange]);

  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current && !disabled) {
      const newPosition = textareaRef.current.selectionStart;
      setCursorPosition(newPosition);
      handleRealTimeChange(content, newPosition);
    }
  }, [content, handleRealTimeChange, disabled]);

  // Apply remote changes
  useEffect(() => {
    if (isLocalChange || remoteChanges.length === 0) return;

    const latestChange = remoteChanges[remoteChanges.length - 1];
    
    // Only apply if this is a newer change
    if (latestChange.timestamp > lastRemoteUpdate.current && latestChange.userId !== currentUserId) {
      const currentCursor = textareaRef.current?.selectionStart || 0;
      
      setContent(latestChange.content);
      setLastChangeTime(latestChange.timestamp);
      lastRemoteUpdate.current = latestChange.timestamp;
      
      // Track remote users
      setRemoteUsers(prev => new Set([...prev, latestChange.userId]));
      
      // Restore cursor position after a brief delay
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = Math.min(currentCursor, latestChange.content.length);
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 50);
    }
  }, [remoteChanges, isLocalChange, currentUserId]);

  // Clean up old remote users
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      const recentChanges = remoteChanges.filter(change => (now - change.timestamp) < 5000);
      const activeUsers = new Set(recentChanges.map(change => change.userId));
      setRemoteUsers(activeUsers);
    }, 2000);

    return () => clearInterval(cleanup);
  }, [remoteChanges]);

  // Sync initial value
  useEffect(() => {
    if (!isLocalChange && initialValue !== content) {
      setContent(initialValue);
    }
  }, [initialValue, isLocalChange, content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && variant === 'professional') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, variant]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'border-0 bg-transparent resize-none focus:ring-0 p-2';
      case 'professional':
        return 'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-4';
      default:
        return 'border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 p-3';
    }
  };

  const isRecentlyChanged = Date.now() - lastChangeTime < 2000;

  return (
    <div className={`real-time-text-editor relative ${className}`}>
      {/* Remote users indicator */}
      {remoteUsers.size > 0 && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-blue-700 dark:text-blue-300">
              {remoteUsers.size} editing
            </span>
          </div>
        </div>
      )}

      {/* Real-time change indicator */}
      {isRecentlyChanged && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 dark:text-green-300">
              Live
            </span>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={variant === 'professional' ? undefined : rows}
        className={`
          w-full text-gray-900 dark:text-gray-100 transition-all duration-200
          ${getVariantClasses()}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isRecentlyChanged ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}
        `}
        style={{
          minHeight: variant === 'professional' ? '100px' : undefined,
          maxHeight: variant === 'professional' ? '400px' : undefined
        }}
      />

      {/* Character count and status */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <span>{content.length} characters</span>
          {remoteUsers.size > 0 && (
            <span className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Real-time sync active</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isLocalChange && (
            <span className="text-blue-600 dark:text-blue-400">Syncing...</span>
          )}
          <span>Cursor: {cursorPosition}</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTextEditor;
