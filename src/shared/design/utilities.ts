/**
 * Design System Utilities
 * Helper functions for working with design tokens
 */

import { Theme } from './hooks';

// CSS-in-JS helper for creating styles with theme tokens
export const createStyles = (stylesFn: (theme: Theme) => Record<string, unknown>) => {
  return (theme: Theme) => stylesFn(theme);
};

// Utility function to get responsive styles
export const responsive = (values: {
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
  '2xl'?: string | number;
}) => {
  const breakpoints = {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
  
  let styles = '';
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'sm') {
      styles += `@media (min-width: ${breakpoints.sm}) { ${value} }`;
    } else if (breakpoint in breakpoints) {
      styles += `@media (min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]}) { ${value} }`;
    }
  });
  
  return styles;
};

// Utility to generate Tailwind classes from design tokens
export const generateTailwindClass = (
  property: string,
  value: string | number,
  prefix?: string
): string => {
  const prefixStr = prefix ? `${prefix}:` : '';
  
  if (typeof value === 'number') {
    return `${prefixStr}${property}-[${value}px]`;
  }
  
  return `${prefixStr}${property}-[${value}]`;
};

// Utility to create consistent focus styles
export const focusStyles = (color = '#3b82f6') => ({
  outline: 'none',
  boxShadow: `0 0 0 3px ${color}1a`, // 10% opacity
  borderColor: color,
});

// Utility for consistent hover states
export const hoverStyles = (scale = 1.02) => ({
  transform: `scale(${scale})`,
  transition: 'transform 200ms ease-in-out',
});

// Utility for disabled states
export const disabledStyles = {
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none' as const,
};

// Utility for loading states
export const loadingStyles = {
  opacity: 0.7,
  cursor: 'wait',
  pointerEvents: 'none' as const,
};

// Color utility functions
export const getColorValue = (colorString: string): string => {
  // Handle format like 'primary.500' or 'neutral.200'
  if (colorString.includes('.')) {
    const [colorName, shade] = colorString.split('.');
    // This would need to be connected to the actual color tokens
    return `var(--color-${colorName}-${shade})`;
  }
  
  return colorString;
};

// Spacing utility functions
export const getSpacingValue = (spacing: string | number): string => {
  if (typeof spacing === 'number') {
    return `${spacing}px`;
  }
  
  if (spacing.includes('px') || spacing.includes('rem') || spacing.includes('%')) {
    return spacing;
  }
  
  // Assume it's a token name
  return `var(--spacing-${spacing})`;
};

// Animation utility
export const animationPresets = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
  },
  slideUp: {
    animation: 'slideUp 0.3s ease-out',
  },
  scaleIn: {
    animation: 'scaleIn 0.2s ease-out',
  },
  bounce: {
    animation: 'bounce 0.5s ease-in-out',
  },
};
