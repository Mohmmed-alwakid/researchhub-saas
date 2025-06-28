/**
 * Design Tokens for ResearchHub
 * Centralized design system tokens extracted from Tailwind configuration
 * These tokens provide consistent styling across all components
 */

// Color System
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary/neutral colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Accent colors
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Neutral grays
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // White and black
  white: '#ffffff',
  black: '#000000',
} as const;

// Spacing System (in pixels)
export const spacing = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
  '5xl': '96px',
  '6xl': '128px',
} as const;

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Border Radius System
export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
} as const;

// Shadow System
export const shadows = {
  none: 'none',
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
  large: '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 20px 50px -10px rgba(0, 0, 0, 0.04)',
  glow: '0 0 20px rgba(59, 130, 246, 0.3)',
  focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
} as const;

// Z-Index System
export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  docked: '10',
  dropdown: '1000',
  sticky: '1100',
  banner: '1200',
  overlay: '1300',
  modal: '1400',
  popover: '1500',
  skipLink: '1600',
  toast: '1700',
  tooltip: '1800',
} as const;

// Animation/Transition System
export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Breakpoint System
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific token utilities
export const componentTokens = {
  // Button variants
  button: {
    primary: {
      background: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[700]})`,
      backgroundHover: `linear-gradient(to right, ${colors.primary[700]}, ${colors.primary[800]})`,
      text: colors.white,
      border: 'transparent',
      shadow: shadows.soft,
      shadowHover: shadows.medium,
    },
    secondary: {
      background: colors.white,
      backgroundHover: colors.neutral[50],
      text: colors.neutral[700],
      border: colors.neutral[300],
      shadow: shadows.soft,
      shadowHover: shadows.medium,
    },
    danger: {
      background: `linear-gradient(to right, ${colors.error[600]}, ${colors.error[700]})`,
      backgroundHover: `linear-gradient(to right, ${colors.error[700]}, ${colors.error[800]})`,
      text: colors.white,
      border: 'transparent',
      shadow: shadows.soft,
      shadowHover: shadows.medium,
    },
  },
  
  // Input field variants
  input: {
    default: {
      background: colors.white,
      border: colors.neutral[300],
      borderFocus: colors.primary[500],
      text: colors.neutral[900],
      placeholder: colors.neutral[400],
      shadow: shadows.soft,
      shadowFocus: shadows.focus,
    },
    error: {
      border: colors.error[500],
      borderFocus: colors.error[600],
      shadowFocus: `0 0 0 3px ${colors.error[100]}`,
    },
  },
  
  // Card variants
  card: {
    default: {
      background: colors.white,
      border: colors.neutral[200],
      shadow: shadows.soft,
      shadowHover: shadows.medium,
    },
    interactive: {
      background: colors.white,
      border: colors.neutral[200],
      shadow: shadows.soft,
      shadowHover: shadows.medium,
      transform: 'scale(1.02)',
    },
  },
} as const;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof typography;
export type ShadowToken = keyof typeof shadows;

// Helper functions for accessing nested color values
export const getColor = (color: string, shade?: number): string => {
  if (shade) {
    const colorKey = color as keyof typeof colors;
    const colorObject = colors[colorKey];
    if (typeof colorObject === 'object' && colorObject !== null) {
      return (colorObject as any)[shade] || colors.neutral[500];
    }
  }
  return (colors as any)[color] || colors.neutral[500];
};

// CSS custom properties generator (for use in CSS-in-JS or CSS variables)
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};
  
  // Generate color variables
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        cssVars[`--color-${colorName}-${shade}`] = value;
      });
    } else {
      cssVars[`--color-${colorName}`] = colorValue;
    }
  });
  
  // Generate spacing variables
  Object.entries(spacing).forEach(([spaceName, spaceValue]) => {
    cssVars[`--spacing-${spaceName}`] = spaceValue;
  });
  
  // Generate shadow variables
  Object.entries(shadows).forEach(([shadowName, shadowValue]) => {
    cssVars[`--shadow-${shadowName}`] = shadowValue;
  });
  
  return cssVars;
};
