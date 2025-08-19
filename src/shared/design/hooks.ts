/**
 * Design System Hooks
 * Custom hooks for accessing design tokens in React components
 */

import { useContext } from 'react';
import { colors, spacing, typography, shadows, borderRadius, transitions, componentTokens } from './tokens';
import { ThemeContext, defaultTheme } from './context';

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

// Hook for accessing theme tokens
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  return context || defaultTheme; // Use context or fallback to default theme
};

// Helper hooks for specific token types
export const useColors = () => useTheme().colors;
export const useSpacing = () => useTheme().spacing;
export const useTypography = () => useTheme().typography;
export const useShadows = () => useTheme().shadows;
export const useComponentTokens = () => useTheme().componentTokens;
