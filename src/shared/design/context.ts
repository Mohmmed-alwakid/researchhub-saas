/**
 * Theme Context
 * Separated for React Fast Refresh compatibility
 */

import React, { createContext } from 'react';
import { Theme } from './theme';
import { colors, spacing, typography, shadows, borderRadius, transitions, componentTokens } from './tokens';

// Default theme object
export const defaultTheme: Theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  componentTokens,
};

// Theme context - separated for Fast Refresh
export const ThemeContext = createContext<Theme>(defaultTheme);
