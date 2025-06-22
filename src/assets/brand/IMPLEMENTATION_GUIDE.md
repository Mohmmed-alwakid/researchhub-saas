# Afkar Brand Implementation Guide

## Quick Start Checklist

### 1. ✅ Brand Assets Created
- [x] Brand guidelines document (`src/assets/brand/README.md`)
- [x] Color system CSS (`src/assets/brand/colors.css`)
- [x] Logo files (`src/assets/brand/logo/afkar-logo.svg`)
- [x] Brand directory structure established

### 2. 🔄 Application Branding Updates (TO DO)
- [ ] Update package.json name and description
- [ ] Update HTML title and meta tags
- [ ] Replace "ResearchHub" with "Afkar" in all UI components
- [ ] Update logo references in React components
- [ ] Create favicon from Afkar logo
- [ ] Update cloud storage bucket names
- [ ] Update backup file naming conventions

## File Locations

### Brand Assets
```
src/assets/brand/
├── README.md              # Complete brand guidelines
├── colors.css             # CSS custom properties
└── logo/
    ├── afkar-logo.svg     # Primary logo with text (168x52)
    └── afkar-icon.svg     # Icon only for favicon/small spaces (42x52)
```

### Original Logo Location
```
public/Afkar SVG.svg       # Original full logo file
public/afkar-icon.svg      # Icon version for easy access
```

## Implementation Steps

### Step 1: Import Brand Colors
Add to your main CSS file or component:
```css
@import 'src/assets/brand/colors.css';
```

### Step 2: Logo Component
Create a reusable logo component:
```tsx
import React from 'react';

interface AfkarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export const AfkarLogo: React.FC<AfkarLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: variant === 'full' ? 'h-6 w-auto' : 'h-4 w-4',
    md: variant === 'full' ? 'h-8 w-auto' : 'h-6 w-6', 
    lg: variant === 'full' ? 'h-12 w-auto' : 'h-8 w-8'
  };

  const logoSrc = variant === 'full' ? '/Afkar SVG.svg' : '/afkar-icon.svg';
  
  return (
    <img 
      src={logoSrc} 
      alt="Afkar" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};
```

### Step 3: Update Favicon
Replace the current favicon in `index.html`:
```html
<!-- Remove old favicon -->
<link rel="icon" type="image/svg+xml" href="/vite.svg" />

<!-- Add new Afkar favicon -->
<link rel="icon" type="image/svg+xml" href="/afkar-icon.svg" />
<link rel="apple-touch-icon" href="/afkar-icon.svg" />
```

### Step 3: Files to Update

#### 🎯 High Priority (Brand Name Changes)
1. **src/client/pages/LandingPage.tsx** - Line 31, 240
2. **src/client/pages/auth/LoginPage.tsx** - Line 100, 292
3. **src/client/pages/auth/RegisterPage.tsx** - Line 91, 119
4. **src/client/pages/auth/ForgotPasswordPage.tsx** - Line 74, 159
5. **src/client/pages/auth/ResetPasswordPage.tsx** - Line 106, 155, 207
6. **src/client/components/common/AppLayout.tsx** - Line 89, 123

#### 🔧 Configuration Files
1. **package.json** - Update name and description
2. **index.html** - Update title and favicon
3. **src/server/services/cloudStorage.js** - Update bucket names

#### 🎨 UI Components (Logo Usage)
1. All auth pages with logo comments
2. AppLayout header logo
3. Any footer or branding components

## Brand Colors Usage

### CSS Custom Properties
```css
/* Primary brand color */
background-color: var(--color-primary);

/* With hover state */
background-color: var(--color-primary);
&:hover {
  background-color: var(--color-primary-hover);
}
```

### Tailwind Classes (if using Tailwind)
```html
<!-- Primary button -->
<button class="bg-blue-500 hover:bg-blue-600 text-white">
  Button
</button>

<!-- Text with brand color -->
<h1 class="text-blue-500">Afkar</h1>
```

## Logo Usage Guidelines

### ✅ Do's
- Use the SVG version for all web applications
- Maintain aspect ratio (168:52)
- Ensure minimum size of 24px height
- Use adequate clear space around logo
- Use on light backgrounds for maximum contrast

### ❌ Don'ts  
- Don't stretch or distort the logo
- Don't use on dark backgrounds without proper contrast
- Don't place text too close to the logo
- Don't recreate the logo in different colors

## File Naming Conventions

### Update These Patterns
```javascript
// OLD: ResearchHub references
bucketName: 'researchhub-recordings'
filename: 'researchhub-backup-codes'

// NEW: Afkar references  
bucketName: 'afkar-recordings'
filename: 'afkar-backup-codes'
```

## Testing Checklist

After implementation, verify:
- [ ] All pages show "Afkar" instead of "ResearchHub"
- [ ] Logo displays correctly on all screen sizes
- [ ] Favicon shows the new Afkar branding
- [ ] Meta tags reflect the new brand
- [ ] Cloud storage uses new bucket names
- [ ] Download files use new naming convention
- [ ] Brand colors are consistent across the application

## Development Notes

### Current Status
- ✅ Brand guidelines and assets created
- ✅ Professional brand structure established
- ✅ Color system defined and ready for implementation
- 🔄 Application-wide branding updates needed

### Next Steps
1. Update package.json and configuration files
2. Replace all "ResearchHub" text with "Afkar"
3. Update logo references in components
4. Create and update favicon
5. Test all brand changes across the application

## Maintenance

### Future Brand Updates
- All brand changes should be made in `src/assets/brand/`
- Update this guide when making significant brand changes
- Maintain version control of brand assets
- Document any new brand guidelines or usage patterns

---

**Note**: This brand implementation maintains the professional quality expected for a SaaS platform while establishing a clear, consistent identity for Afkar.
