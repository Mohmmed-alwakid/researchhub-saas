# Afkar Brand Guidelines

## Brand Overview
**Afkar** is a SaaS platform for user testing research and feedback collection. The name "Afkar" (Arabic for "ideas") reflects our mission to help researchers and teams gather valuable insights and ideas from user testing.

## Logo Usage

### Primary Logo
- **File**: `public/Afkar SVG.svg`
- **Format**: SVG (scalable vector format)
- **Usage**: Primary logo for all digital applications
- **Minimum size**: 24px height for web applications
- **Clear space**: Maintain 1x logo height clear space around the logo

### Logo Variations
- **Primary**: Full color version with text (`afkar-logo.svg`)
- **Icon Only**: Logo mark without text (`afkar-icon.svg`) - for favicons, small spaces
- **Monochrome**: For single-color applications (when needed)

## Color Palette

### Primary Colors
```css
/* Primary Blue */
--color-primary: #3B82F6;       /* Blue-500 */
--color-primary-hover: #2563EB; /* Blue-600 */
--color-primary-light: #DBEAFE; /* Blue-100 */

/* Secondary Colors */
--color-secondary: #6B7280;     /* Gray-500 */
--color-secondary-dark: #374151; /* Gray-700 */
```

### Neutral Colors
```css
/* Background Colors */
--color-background: #FFFFFF;    /* White */
--color-background-alt: #F9FAFB; /* Gray-50 */
--color-background-dark: #111827; /* Gray-900 */

/* Text Colors */
--color-text-primary: #111827;   /* Gray-900 */
--color-text-secondary: #6B7280; /* Gray-500 */
--color-text-light: #9CA3AF;    /* Gray-400 */
```

### Accent Colors
```css
/* Success */
--color-success: #10B981;       /* Green-500 */
--color-success-light: #D1FAE5; /* Green-100 */

/* Warning */
--color-warning: #F59E0B;       /* Amber-500 */
--color-warning-light: #FEF3C7; /* Amber-100 */

/* Error */
--color-error: #EF4444;         /* Red-500 */
--color-error-light: #FEE2E2;   /* Red-100 */
```

## Typography

### Primary Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Font Weights
- **Light**: 300 (for large headings)
- **Regular**: 400 (body text)
- **Medium**: 500 (labels, buttons)
- **Semibold**: 600 (headings)
- **Bold**: 700 (emphasis)

### Font Sizes
```css
/* Headings */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## Brand Voice & Tone

### Brand Personality
- **Professional**: Reliable and trustworthy for research teams
- **Innovative**: Cutting-edge user testing solutions
- **Accessible**: Easy to use for researchers of all skill levels
- **Insightful**: Focused on delivering valuable user insights

### Tone of Voice
- **Clear and Direct**: Straightforward communication
- **Helpful**: Supportive and educational
- **Confident**: Authoritative in user research domain
- **Friendly**: Approachable and human

## Application Guidelines

### Navigation
- Logo should appear in the top-left corner
- Logo should link to the dashboard/home page
- Maintain consistent sizing across all screens

### Forms and UI Elements
- Use primary blue for call-to-action buttons
- Use secondary gray for less important actions
- Maintain consistent spacing and typography

### Loading States
- Use primary blue for loading indicators
- Provide clear feedback for user actions

## File Structure
```
src/assets/brand/
├── README.md           # This file
├── logo/
│   ├── afkar-logo.svg  # Primary logo with text (168x52)
│   └── afkar-icon.svg  # Icon only (42x52)
├── colors/
│   └── colors.css      # CSS custom properties
└── fonts/              # Font files (if custom fonts are used)
```

## Icon Usage (Favicon & Small Spaces)

### Afkar Icon (Symbol Only)
- **File**: `afkar-icon.svg` (42x52 viewBox)
- **Usage**: Favicon, app icons, small UI elements
- **Minimum size**: 16px for favicon, 24px for UI elements

### Favicon Implementation
```html
<!-- Standard favicon -->
<link rel="icon" type="image/svg+xml" href="/afkar-icon.svg" />

<!-- Apple touch icon (for iOS) -->
<link rel="apple-touch-icon" href="/afkar-icon.svg" />

<!-- PWA manifest icon -->
<link rel="manifest" href="/manifest.json" />
```

## Implementation Notes

### React/TypeScript Components
```tsx
// Logo component usage
<img 
  src="/Afkar SVG.svg" 
  alt="Afkar" 
  className="h-8 w-auto" 
/>

// Brand colors in Tailwind
className="bg-blue-500 text-white hover:bg-blue-600"
```

### Meta Tags
```html
<title>Afkar - User Testing Research Platform</title>
<meta name="description" content="Afkar helps research teams gather valuable insights through user testing and feedback collection." />
```

## Brand Assets Checklist
- [x] Primary logo (SVG with text)
- [x] Icon version (SVG symbol only)
- [x] Favicon implementation (SVG)
- [x] Apple touch icon
- [ ] Social media images (1200x630)
- [ ] Email signature logo
- [x] Brand guidelines document (this file)
- [x] Color system CSS variables

## Last Updated
Created: December 2024
Version: 1.0.0
