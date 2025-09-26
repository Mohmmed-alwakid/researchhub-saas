import React, { createContext } from 'react';
import { colors, spacing, typography, shadows, borderRadius, transitions, componentTokens } from './tokens';

import { Theme } from './theme';

/**
 * Theme Context
 * Separated for React Fast Refresh compatibility
 */

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
