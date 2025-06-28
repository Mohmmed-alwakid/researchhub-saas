/**
 * Design System Index
 * Central export point for all design system components and utilities
 */

// Design tokens
export * from './tokens';

// Theme provider
export { default as ThemeProvider } from './theme';
export type { Theme } from './theme';

// Hooks
export {
  useTheme,
  useColors,
  useSpacing,
  useTypography,
  useShadows,
  useComponentTokens,
} from './hooks';

// Utilities
export {
  createStyles,
  responsive,
  generateTailwindClass,
  focusStyles,
  hoverStyles,
  disabledStyles,
  loadingStyles,
  getColorValue,
  getSpacingValue,
  animationPresets,
} from './utilities';
