import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CollaboratorPresence } from '../../../shared/types';

interface LiveCursorSystemProps {
  /** Active collaborators with cursor positions */
  collaborators: CollaboratorPresence[];
  /** Current user ID to exclude own cursor */
  currentUserId: string;
  /** Container ref for cursor positioning */
  containerRef: React.RefObject<HTMLElement>;
  /** Whether to show cursors */
  enabled?: boolean;
  /** Callback when cursor moves */
  onCursorMove?: (x: number, y: number, element?: string) => void;
  className?: string;
}

interface CursorPosition {
  x: number;
  y: number;
  element?: string;
  timestamp: number;
}

interface LiveCursor {
  id: string;
  name: string;
  color: string;
  position: CursorPosition;
  isTyping?: boolean;
  lastActivity: number;
}

export const LiveCursorSystem: React.FC<LiveCursorSystemProps> = ({
  collaborators,
  currentUserId,
  containerRef,
  enabled = true,
  onCursorMove,
  className = ''
}) => {
  const [cursors, setCursors] = useState<LiveCursor[]>([]);
  const [isMouseInContainer, setIsMouseInContainer] = useState(false);
  const lastCursorUpdate = useRef<number>(0);
  const cursorUpdateThrottle = 50; // Update every 50ms max

  // Generate consistent colors for users
  const getUserColor = useCallback((userId: string): string => {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red  
      '#10B981', // Green
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ];
    
    const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  }, []);

  // Handle mouse movement in container
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || !containerRef.current || !isMouseInContainer) return;

    const now = Date.now();
    if (now - lastCursorUpdate.current < cursorUpdateThrottle) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get target element for context
    const element = (event.target as Element)?.id || (event.target as Element)?.className || 'container';
    
    lastCursorUpdate.current = now;
    onCursorMove?.(x, y, element);
  }, [enabled, containerRef, isMouseInContainer, onCursorMove]);

  // Handle mouse enter/leave container
  const handleMouseEnter = useCallback(() => {
    setIsMouseInContainer(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseInContainer(false);
  }, []);

  // Set up mouse event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, enabled, containerRef]);

  // Update cursors from collaborators
  useEffect(() => {
    const now = Date.now();
    const activeCursors: LiveCursor[] = [];

    collaborators.forEach(collaborator => {
      if (collaborator.id === currentUserId) return; // Don't show own cursor

      // Check if collaborator has recent activity
      if (collaborator.lastActive && (now - new Date(collaborator.lastActive).getTime()) < 30000) { // 30 seconds
        activeCursors.push({
          id: collaborator.id,
          name: collaborator.name,
          color: getUserColor(collaborator.id),
          position: {
            // For now, use placeholder positions - these would come from real-time cursor tracking
            x: Math.random() * 400 + 50, // Demo positioning
            y: Math.random() * 300 + 50,
            element: collaborator.currentElement,
            timestamp: new Date(collaborator.lastActive).getTime()
          },
          isTyping: collaborator.status === 'active', // Use active status as typing indicator
          lastActivity: new Date(collaborator.lastActive).getTime()
        });
      }
    });

    setCursors(activeCursors);
  }, [collaborators, currentUserId, getUserColor]);

  // Clean up old cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => prev.filter(cursor => (now - cursor.lastActivity) < 30000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!enabled || !containerRef.current) return null;

  return (
    <div className={`live-cursor-system absolute inset-0 pointer-events-none z-50 ${className}`}>
      {cursors.map(cursor => (
        <LiveCursorComponent
          key={cursor.id}
          cursor={cursor}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
};

interface LiveCursorComponentProps {
  cursor: LiveCursor;
  containerRef: React.RefObject<HTMLElement>;
}

const LiveCursorComponent: React.FC<LiveCursorComponentProps> = ({
  cursor,
  containerRef
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Fade out old cursors
  useEffect(() => {
    const now = Date.now();
    const age = now - cursor.lastActivity;
    
    if (age > 10000) { // Start fading after 10 seconds
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [cursor.lastActivity]);

  if (!isVisible || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const x = Math.max(0, Math.min(cursor.position.x, containerRect.width - 20));
  const y = Math.max(0, Math.min(cursor.position.y, containerRect.height - 20));

  return (
    <div
      className="absolute transition-all duration-200 ease-out pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-2px, -2px)',
        opacity: isVisible ? 1 : 0
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M2 2L18 8L8 12L2 18V2Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-5 left-2 px-2 py-1 text-xs font-medium text-white rounded shadow-lg whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.name}
        {cursor.isTyping && (
          <span className="ml-1 animate-pulse">✏️</span>
        )}
      </div>

      {/* Typing indicator ripple */}
      {cursor.isTyping && (
        <div
          className="absolute -inset-2 rounded-full animate-ping"
          style={{ backgroundColor: `${cursor.color}20` }}
        />
      )}
    </div>
  );
};

export default LiveCursorSystem;
