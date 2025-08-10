# ResearchHub Design System Standards

## 🎯 Purpose
This document establishes mandatory design system standards to ensure UI consistency across all ResearchHub components and prevent design fragmentation.

## 🚨 Critical Rules

### 1. **EXTEND, DON'T REPLACE**
- ✅ **Always extend existing components** when adding new features
- ❌ **Never create standalone components** with different styling
- 🔄 **Refactor existing components** to add new functionality

### 2. **Consistent Component Library**
All UI components must use the established component library:

```typescript
// ✅ CORRECT - Use established components
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// ❌ WRONG - Custom styling that differs from standards
<div className="bg-white shadow-lg rounded-lg p-6">
```

### 3. **Standard Layout Patterns**

#### Settings Pages Pattern
```typescript
// ✅ MANDATORY PATTERN for all settings content
case 'section-name':
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Section Title</h3>
          <p className="text-sm text-gray-600">Section description</p>
        </CardHeader>
        <CardContent>
          {/* Content with consistent form styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form fields */}
          </div>
          <div className="mt-6">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
```

#### Form Field Pattern
```typescript
// ✅ MANDATORY INPUT STYLING
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Field Label
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
  />
</div>
```

## 📋 Component Standards

### Colors
- **Primary**: Indigo (indigo-500, indigo-600)
- **Text**: Gray scale (gray-700, gray-600, gray-500)
- **Borders**: gray-300
- **Backgrounds**: white, gray-50

### Typography
- **Headers**: `text-lg font-semibold`
- **Labels**: `text-sm font-medium text-gray-700`
- **Descriptions**: `text-sm text-gray-600`
- **Helper text**: `text-xs text-gray-500`

### Spacing
- **Card spacing**: `space-y-6`
- **Grid gaps**: `gap-6`
- **Button margins**: `mt-6`
- **Form field margins**: `mb-2`

### Responsive Design
- **Grid layout**: `grid grid-cols-1 md:grid-cols-2`
- **Full-width on mobile**: Default single column
- **Two columns on desktop**: `md:grid-cols-2`

## 🔧 Development Process

### Before Creating New Components
1. **Check existing components** - Can functionality be added to existing?
2. **Review design patterns** - Does new component follow established patterns?
3. **Use component library** - Are all UI elements from the standard library?
4. **Test consistency** - Does it match existing UI exactly?

### Component Review Checklist
- [ ] Uses Card/CardContent/CardHeader for layout
- [ ] Uses Button component for actions
- [ ] Follows standard form field styling
- [ ] Uses consistent color palette
- [ ] Follows responsive grid patterns
- [ ] Matches typography standards
- [ ] No custom styling that differs from patterns

## 🚫 Anti-Patterns to Avoid

### Custom Styling
```typescript
// ❌ WRONG - Custom component with different styling
const CustomProfileForm = () => (
  <div className="bg-blue-50 p-8 rounded-xl">
    <h2 className="text-2xl font-bold text-blue-900">
      {/* Different styling breaks consistency */}
    </h2>
  </div>
);
```

### Standalone Components
```typescript
// ❌ WRONG - Creating new standalone component
// Instead of extending existing SettingsPage demographics section
const EnhancedParticipantProfile = () => { /* ... */ };
```

### Inconsistent Form Fields
```typescript
// ❌ WRONG - Different input styling
<input className="p-4 border-2 border-blue-500 rounded-xl bg-blue-50" />

// ✅ CORRECT - Standard input styling
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
```

## 🎯 Implementation Examples

### Adding New Settings Section
When adding new functionality like demographics:

1. **Extend existing pattern**:
```typescript
// Add to existing SettingsPage.tsx switch statement
case 'demographics':
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Demographics Information</h3>
        </CardHeader>
        <CardContent>
          {/* Standard form fields */}
        </CardContent>
      </Card>
    </div>
  );
```

2. **Don't create new component**:
```typescript
// ❌ WRONG - Don't do this
const DemographicsProfile = () => (
  <div className="custom-styling">
    {/* Different layout/styling */}
  </div>
);
```

## 🔍 Quality Assurance

### Design Consistency Checks
- **Visual consistency**: New sections look identical to existing sections
- **Component usage**: Only uses established UI components
- **Styling patterns**: Follows exact same CSS classes
- **Layout structure**: Uses same Card/Content/Header hierarchy

### Code Review Requirements
- [ ] No new component files when existing can be extended
- [ ] Uses only established UI component library
- [ ] Follows standard layout patterns exactly
- [ ] No custom CSS classes that differ from standards
- [ ] Responsive design matches existing patterns

## 📚 Reference Components

### Primary Reference: SettingsPage.tsx
- **Location**: `src/client/pages/settings/SettingsPage.tsx`
- **Pattern**: Profile, security, billing sections show correct patterns
- **Layout**: Card-based layout with consistent styling

### UI Component Library
- **Location**: `src/client/components/ui/`
- **Components**: Card, Button, Input components with standard styling
- **Usage**: Import and use these components exclusively

## 🚀 Benefits of Following Standards

1. **Consistent User Experience**: All features look and feel the same
2. **Faster Development**: Reuse established patterns instead of creating new ones
3. **Easier Maintenance**: Changes to core components affect entire system
4. **Better Quality**: Established patterns are tested and proven
5. **Team Efficiency**: No time wasted on design decisions

## ⚠️ Violation Consequences

**Design inconsistencies result in:**
- Poor user experience
- Increased development time
- Technical debt accumulation
- Difficult maintenance
- Fragmented codebase

**Always follow these standards to maintain ResearchHub's professional quality!**
