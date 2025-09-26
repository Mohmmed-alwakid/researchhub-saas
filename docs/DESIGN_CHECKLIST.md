# ⚡ Quick Design Standards Checklist

## 🚨 Before Writing Any Component

```bash
# 1. Check for existing components
ls src/client/components/ui/

# 2. Run design audit to see current issues
npm run design:audit

# 3. Preview what auto-fixes are available
npm run design:fix --dry-run
```

## ✅ Component Usage Checklist

### Buttons
- [ ] Using `<Button>` instead of `<button>`
- [ ] Using `variant` prop instead of manual classes
- [ ] No hardcoded colors like `bg-blue-600`

### Cards  
- [ ] Using `<Card>` instead of manual div styling
- [ ] No hardcoded `bg-white rounded-lg shadow` patterns
- [ ] Using proper Card subcomponents

### Inputs
- [ ] Using `<Input>` instead of raw `<input>`
- [ ] Using `<Label>` for form labels
- [ ] No manual focus/border styling

### Typography
- [ ] Using `tokens.typography.*` for text styling
- [ ] No hardcoded `text-xl font-bold` patterns
- [ ] Consistent heading hierarchy

## 🎨 Common Replacements

```jsx
// ❌ Replace these patterns:
<button className="bg-blue-600 hover:bg-blue-700">
<div className="bg-white rounded-lg shadow p-6">
<input className="border border-gray-300 rounded">
className="text-blue-600"
className="p-4 m-2"

// ✅ With these:
<Button variant="primary">
<Card>
<Input />
className={tokens.colors.primary.text}
className={`${tokens.spacing.padding.md} ${tokens.spacing.margin.sm}`}
```

## 🔧 Quick Fixes

```bash
# Fix all auto-fixable issues
npm run design:fix

# Check what was fixed
git diff

# Validate no issues remain
npm run design:audit
```

## 📦 Essential Imports

```jsx
// Primary component system
import { EnhancedDesignSystem } from '@/components/ui/EnhancedDesignSystem';

// Individual components  
import { Button, Card, Input } from '@/components/ui';

// Design tokens for custom styling
import { tokens } from '@/components/ui/DesignTokens';
```

## 🚫 Never Do This

1. Raw HTML: `<button>`, `<input>`, card-like `<div>`
2. Hardcoded colors: `bg-blue-600`, `text-red-500`
3. Manual spacing: `p-4 m-2` without tokens
4. Mixed design systems: Using multiple component libraries

## ✅ Always Do This

1. Use component library: `<Button>`, `<Input>`, `<Card>`
2. Use design tokens: `tokens.colors.primary.main`
3. Use variants: `variant="primary"` not manual styling
4. Import properly: From `@/components/ui`

## 🎯 Quick Validation

```bash
# Before committing
npm run design:audit
npm run test:quick

# If violations found
npm run design:fix
git add .
git commit -m "fix: apply design consistency fixes"
```

---
**Quick Reference**: Full guide at `docs/DESIGN_STANDARDS_GUIDE.md`