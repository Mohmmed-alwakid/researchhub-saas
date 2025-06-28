/**
 * Design System Theme Provider
 * Provides design tokens to React components through context
 */

import React, { createContext, ReactNode } from 'react';
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

// Theme context
const ThemeContext = createContext<Theme>(defaultTheme);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
  theme?: Partial<Theme>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme = {} 
}) => {
  const mergedTheme = { ...defaultTheme, ...theme };
  
  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};



export default ThemeProvider;
