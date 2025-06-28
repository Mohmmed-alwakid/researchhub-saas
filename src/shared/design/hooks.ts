/**
 * Design System Hooks
 * Custom hooks for accessing design tokens in React components
 */

import { useContext } from 'react';
import { colors, spacing, typography, shadows, borderRadius, transitions, componentTokens } from './tokens';

// Theme interface
export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  transitions: typeof transitions;
  componentTokens: typeof componentTokens;
}

// Default theme object
const defaultTheme: Theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  componentTokens,
};

// Theme context (imported from theme.tsx)
import React from 'react';
const ThemeContext = React.createContext<Theme>(defaultTheme);

// Hook for accessing theme tokens
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultTheme; // Fallback to default theme if no provider
  }
  return context;
};

// Helper hooks for specific token types
export const useColors = () => useTheme().colors;
export const useSpacing = () => useTheme().spacing;
export const useTypography = () => useTheme().typography;
export const useShadows = () => useTheme().shadows;
export const useComponentTokens = () => useTheme().componentTokens;
