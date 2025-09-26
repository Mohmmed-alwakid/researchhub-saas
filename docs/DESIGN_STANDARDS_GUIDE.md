# 🎨 ResearchHub Design Standards & Component Usage Guide

## 📖 Overview

This guide establishes consistent design patterns and component usage across ResearchHub to eliminate the design inconsistencies identified in our codebase. We found **1,199 design inconsistencies** across **263 React files**, and this guide provides the solution.

## 🚨 Critical Problems Identified

Our design audit revealed extensive inconsistencies:

- ✅ **617 auto-fixable issues** across 136 files
- 🔴 **538 high-priority violations** (raw buttons, inconsistent patterns)
- 🟡 **661 medium-priority issues** (manual styling, hardcoded colors)
- 🔵 **1 low-priority issue**

### Top Violation Files:
1. `MobileOptimizedStudyBuilder.tsx` - 22 fixes needed
2. `TaskConfigurationModal.tsx` - 20 fixes needed  
3. `UsabilityStudyBuilder.tsx` - 19 fixes needed
4. `EnhancedBlockEditor.tsx` - 184 violations
5. `UserDetailView.tsx` - 137 violations

## 🎯 Design System Architecture

### Single Source of Truth
```typescript
// ✅ ALWAYS use our design tokens
import { tokens } from '@/components/ui/DesignTokens';

// ❌ NEVER use hardcoded styling
className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"

// ✅ USE design tokens instead
className={`${tokens.colors.primary.main} ${tokens.colors.primary.hover} ${tokens.spacing.padding.md} ${tokens.borders.rounded.md}`}
```

### Component Library Hierarchy
```
src/client/components/ui/
├── DesignTokens.ts          ← Single source of truth for all styling
├── EnhancedDesignSystem.tsx ← Primary component system (USE THIS)
├── Button.tsx               ← Individual button component
├── Card.tsx                 ← Individual card component
├── Input.tsx                ← Individual input component
└── index.ts                 ← Central exports
```

## 🏗️ Component Usage Rules (MANDATORY)

### 1. Button Components

#### ❌ WRONG - Manual Button Styling
```jsx
// Found in 172 locations - NEVER do this
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Click Me
</button>

// Raw button elements - NEVER do this
<button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
  Cancel
</button>
```

#### ✅ CORRECT - Component-Based Buttons
```jsx
import { Button } from '@/components/ui/Button';
// OR
import { EnhancedDesignSystem } from '@/components/ui/EnhancedDesignSystem';

// Primary button
<Button variant="primary" size="md">Click Me</Button>

// Secondary button  
<Button variant="secondary" size="md">Cancel</Button>

// Using EnhancedDesignSystem
<EnhancedDesignSystem.Button variant="primary">Click Me</EnhancedDesignSystem.Button>
```

#### Available Button Variants
```typescript
// From DesignTokens.ts
variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'link'
size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
```

### 2. Card Components

#### ❌ WRONG - Manual Card Styling
```jsx
// Found in 180 locations - NEVER do this
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <p className="text-gray-600">Content</p>
</div>

// Manual card-like divs - NEVER do this
<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  Content
</div>
```

#### ✅ CORRECT - Component-Based Cards
```jsx
import { Card } from '@/components/ui/Card';
// OR
import { EnhancedDesignSystem } from '@/components/ui/EnhancedDesignSystem';

// Basic card
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>Content goes here</p>
  </Card.Content>
</Card>

// Using EnhancedDesignSystem
<EnhancedDesignSystem.Card variant="default">
  <h3>Title</h3>
  <p>Content</p>
</EnhancedDesignSystem.Card>
```

#### Available Card Variants
```typescript
variant: 'default' | 'outlined' | 'elevated' | 'ghost'
padding: 'none' | 'sm' | 'md' | 'lg' | 'xl'
```

### 3. Input Components

#### ❌ WRONG - Manual Input Styling
```jsx
// Found in 62 locations - NEVER do this
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  type="text"
  placeholder="Enter text..."
/>

// Raw input elements - NEVER do this
<input className="border border-gray-300 rounded-lg px-3 py-2" />
```

#### ✅ CORRECT - Component-Based Inputs
```jsx
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// Basic input
<div>
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
    variant="default"
  />
</div>

// With validation
<Input
  type="text"
  placeholder="Required field"
  variant="error"
  error="This field is required"
/>
```

#### Available Input Variants
```typescript
variant: 'default' | 'error' | 'success' | 'disabled'
size: 'sm' | 'md' | 'lg'
```

### 4. Typography System

#### ❌ WRONG - Manual Typography
```jsx
// NEVER do this
<h1 className="text-3xl font-bold text-gray-900">Heading</h1>
<p className="text-base text-gray-700">Body text</p>
```

#### ✅ CORRECT - Token-Based Typography
```jsx
import { tokens } from '@/components/ui/DesignTokens';

// Using design tokens
<h1 className={tokens.typography.heading.h1}>Heading</h1>
<p className={tokens.typography.body.base}>Body text</p>

// Available typography tokens
tokens.typography.heading.h1     // text-3xl font-bold text-gray-900
tokens.typography.heading.h2     // text-2xl font-semibold text-gray-900
tokens.typography.body.large     // text-lg text-gray-700
tokens.typography.body.base      // text-base text-gray-700
tokens.typography.label.primary  // text-sm font-medium text-gray-700
```

## 🎨 Design Token Usage

### Color System
```jsx
import { tokens } from '@/components/ui/DesignTokens';

// Primary colors
tokens.colors.primary.main     // bg-blue-600
tokens.colors.primary.hover    // hover:bg-blue-700
tokens.colors.primary.light    // bg-blue-50
tokens.colors.primary.text     // text-blue-600

// Status colors
tokens.colors.success.main     // bg-green-600
tokens.colors.warning.main     // bg-yellow-500
tokens.colors.danger.main      // bg-red-600
```

### Spacing System
```jsx
// Padding
tokens.spacing.padding.xs      // p-2
tokens.spacing.padding.sm      // p-4
tokens.spacing.padding.md      // p-6
tokens.spacing.padding.lg      // p-8

// Margins
tokens.spacing.margin.xs       // m-2
tokens.spacing.margin.sm       // m-4
tokens.spacing.margin.md       // m-6
tokens.spacing.margin.lg       // m-8

// Gaps (for flexbox/grid)
tokens.spacing.gap.xs          // gap-2
tokens.spacing.gap.sm          // gap-4
tokens.spacing.gap.md          // gap-6
```

### Border & Shadow System
```jsx
// Borders
tokens.borders.width.thin      // border
tokens.borders.width.thick     // border-2
tokens.borders.rounded.sm      // rounded
tokens.borders.rounded.md      // rounded-lg
tokens.borders.rounded.lg      // rounded-xl

// Shadows
tokens.effects.shadow.sm       // shadow-sm
tokens.effects.shadow.md       // shadow-md
tokens.effects.shadow.lg       // shadow-lg
```

## 🔧 Component Builder System

For complex component combinations, use our component builder:

```jsx
import { tokens, buildComponent } from '@/components/ui/DesignTokens';

// Build a card with specific styling
const customCard = buildComponent('card', {
  variant: 'elevated',
  padding: 'lg',
  shadow: 'md'
});

<div className={customCard}>
  Content
</div>
```

## 📊 Layout Patterns

### Grid Layouts
```jsx
// Use layout tokens instead of manual grid classes
className={tokens.layout.grid.responsive}    // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
className={tokens.layout.grid.equal}         // grid grid-cols-auto gap-4
```

### Flex Layouts
```jsx
className={tokens.layout.flex.center}        // flex items-center justify-center
className={tokens.layout.flex.between}       // flex items-center justify-between  
className={tokens.layout.flex.column}        // flex flex-col
```

## 🚨 Anti-Patterns to Avoid

### 1. Hardcoded Colors
```jsx
// ❌ NEVER do this
className="bg-blue-600 text-white border-gray-300"

// ✅ Always use tokens
className={`${tokens.colors.primary.main} ${tokens.colors.neutral.white} ${tokens.colors.neutral.border}`}
```

### 2. Inconsistent Spacing
```jsx
// ❌ NEVER do this
className="p-4 m-2 gap-3"

// ✅ Use consistent spacing scale
className={`${tokens.spacing.padding.md} ${tokens.spacing.margin.sm} ${tokens.spacing.gap.sm}`}
```

### 3. Raw HTML Elements for UI
```jsx
// ❌ NEVER do this
<button>Click</button>
<div className="card-like-styling">Content</div>
<input type="text" />

// ✅ Always use components
<Button>Click</Button>
<Card>Content</Card>
<Input type="text" />
```

### 4. Multiple Design Systems
```jsx
// ❌ NEVER mix design systems
import { DesignSystem } from './DesignSystem';
import { UnifiedDesignSystem } from './UnifiedDesignSystem';

// ✅ Use only EnhancedDesignSystem
import { EnhancedDesignSystem } from '@/components/ui/EnhancedDesignSystem';
```

## 🛠️ Development Workflow

### 1. Pre-Development Check
Before writing new components:

```bash
# Check for design consistency
npm run design:audit

# See what would be auto-fixed
npm run design:fix --dry-run
```

### 2. Component Creation Checklist
- [ ] Does a similar component already exist?
- [ ] Are you using design tokens instead of hardcoded values?
- [ ] Are you using existing UI components instead of raw HTML?
- [ ] Are you following the variant pattern for different styles?
- [ ] Are you exporting from the appropriate index file?

### 3. Pre-Commit Validation
Our pre-commit gates will automatically check:
- Design consistency violations
- Missing component imports
- Hardcoded styling patterns
- Typography inconsistencies

## 📚 Component Import Guide

### Preferred Import Method
```jsx
// ✅ BEST - Use EnhancedDesignSystem for new components
import { EnhancedDesignSystem } from '@/components/ui/EnhancedDesignSystem';

const MyComponent = () => (
  <EnhancedDesignSystem.Card>
    <EnhancedDesignSystem.Button variant="primary">
      Action
    </EnhancedDesignSystem.Button>
  </EnhancedDesignSystem.Card>
);
```

### Individual Component Imports
```jsx
// ✅ GOOD - For specific components
import { Button, Card, Input } from '@/components/ui';

const MyComponent = () => (
  <Card>
    <Input placeholder="Search..." />
    <Button variant="primary">Submit</Button>
  </Card>
);
```

### Design Token Imports
```jsx
// ✅ ALWAYS import tokens for custom styling
import { tokens } from '@/components/ui/DesignTokens';

const customClass = `${tokens.colors.primary.main} ${tokens.spacing.padding.lg}`;
```

## 🔄 Migration Strategy

### Phase 1: Critical Fixes (Completed ✅)
- Fixed 617 auto-fixable violations
- Added design token system
- Integrated pre-commit validation

### Phase 2: Component Adoption (Current)
- Replace remaining manual styling with components
- Standardize import patterns
- Update component documentation

### Phase 3: Advanced Patterns (Next)
- Add component composition patterns
- Create domain-specific components
- Implement advanced theming

## 📏 Quality Gates

### Design Consistency Score
- **Target**: 95% consistency score
- **Current**: Varies by file (check `npm run design:audit`)
- **Monitoring**: Automated daily checks

### Component Usage Metrics
- **Raw HTML Elements**: 0 tolerance for buttons, inputs, cards
- **Hardcoded Colors**: 0 tolerance in new code
- **Design Token Usage**: 100% for new components

### Review Checklist
Before merging any PR:
- [ ] No design consistency violations
- [ ] All components use design tokens
- [ ] No raw HTML for UI elements
- [ ] Components follow variant patterns
- [ ] Proper imports and exports

## 🚀 Quick Reference

### Most Common Replacements
```jsx
// Replace these patterns:
<button className="...">          → <Button variant="...">
<div className="card-styling">    → <Card>
<input className="...">           → <Input variant="...">
className="text-blue-600"         → className={tokens.colors.primary.text}
className="p-4 m-2"              → className={`${tokens.spacing.padding.md} ${tokens.spacing.margin.sm}`}
```

### Emergency Fixes
If you encounter design inconsistencies:

```bash
# Quick fix most common issues
npm run design:fix

# Manual fix for complex issues
npm run design:audit --detailed
```

## 📞 Support & Questions

- **Design System Issues**: Check `src/client/components/ui/EnhancedDesignSystem.tsx`
- **Token Questions**: Reference `src/client/components/ui/DesignTokens.ts`
- **Component Usage**: See examples in this guide
- **Build Errors**: Run `npm run design:audit` to identify problems

---

**Last Updated**: September 20, 2025
**Status**: Production-ready design standards
**Compliance**: Automated validation with pre-commit gates