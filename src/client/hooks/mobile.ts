/**
 * Mobile optimization hooks and utilities
 */

import { useState, useEffect } from 'react';

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)'
};

// Mobile-optimized touch targets (44px minimum)
export const TOUCH_TARGET_SIZE = {
  minimum: 44,
  comfortable: 48,
  large: 52
};

/**
 * Mobile viewport detection hook
 */
export const useMobileViewport = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.matchMedia(BREAKPOINTS.mobile).matches);
      setIsTablet(window.matchMedia(BREAKPOINTS.tablet).matches);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

/**
 * Touch gesture hook for mobile interactions
 */
export const useTouchGestures = () => {
  const [gestureState, setGestureState] = useState({
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeUp: false,
    isSwipeDown: false
  });

  const handleTouchGesture = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    threshold = 50
  ) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        setGestureState({
          isSwipeLeft: deltaX < 0,
          isSwipeRight: deltaX > 0,
          isSwipeUp: false,
          isSwipeDown: false
        });
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        setGestureState({
          isSwipeLeft: false,
          isSwipeRight: false,
          isSwipeUp: deltaY < 0,
          isSwipeDown: deltaY > 0
        });
      }
    }

    // Reset after 100ms
    setTimeout(() => {
      setGestureState({
        isSwipeLeft: false,
        isSwipeRight: false,
        isSwipeUp: false,
        isSwipeDown: false
      });
    }, 100);
  };

  return { gestureState, handleTouchGesture };
};
