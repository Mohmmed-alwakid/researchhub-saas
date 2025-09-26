import React, { ReactNode } from 'react';
import { colors, spacing, typography, shadows, borderRadius, transitions, componentTokens } from './tokens';
import { ThemeContext, defaultTheme } from './context';


/**
 * Design System Theme Provider
 * Provides design tokens to React components through context
 */

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
