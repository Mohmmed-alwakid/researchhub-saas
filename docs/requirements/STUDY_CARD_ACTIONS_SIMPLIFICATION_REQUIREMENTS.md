# Study Card Actions Simplification Requirements

## 📋 Overview
Simplify study card actions to only include essential operations and ensure cards are properly clickable for navigation.

## 🎯 User Story
**As a researcher**, I want study cards to have only essential actions (edit, rename, duplicate, delete) and be clickable for quick navigation, so that I can manage my studies efficiently without visual clutter.

## 📊 Current State Analysis
- Study cards currently have multiple action buttons (view, edit, applications, delete, status toggles)
- Cards are clickable but navigate to results page
- Action buttons are scattered between left and right sides
- Complex conditional logic for different study statuses

## 🎯 Target State Requirements

### 1. **Simplified Action Menu**
- **ONLY 4 actions**: Edit, Rename, Duplicate, Delete
- Remove all other actions (view, applications, status controls)
- Actions should be in a consistent dropdown or inline layout
- Clean, minimalist design

### 2. **Card Clickability**
- **Primary click action**: Navigate to study overview/details page
- **Click target**: Entire card except action buttons
- **Visual feedback**: Hover states, cursor pointer
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 3. **Action Specifications**

#### **Edit Action** 🖋️
- **Behavior**: Navigate to study builder/edit page
- **Icon**: Edit/Pencil icon
- **Tooltip**: "Edit study"
- **Route**: `/app/studies/{id}/edit`

#### **Rename Action** 📝
- **Behavior**: Inline rename functionality OR modal
- **Icon**: Text/Rename icon
- **Tooltip**: "Rename study"
- **Implementation**: Modal with title input field

#### **Duplicate Action** 📋
- **Behavior**: Create copy of study with " (Copy)" suffix
- **Icon**: Copy icon
- **Tooltip**: "Duplicate study"
- **Implementation**: API call to duplicate study

#### **Delete Action** 🗑️
- **Behavior**: Confirmation dialog then delete
- **Icon**: Trash icon
- **Tooltip**: "Delete study"
- **Implementation**: Confirmation modal + API call

### 4. **Visual Design Requirements**
- **Action Layout**: Horizontal row or dropdown menu
- **Positioning**: Top-right corner of card
- **Styling**: Consistent with enhanced UI theme
- **Spacing**: Adequate click targets (minimum 44px)
- **Colors**: Gray states with colored hover effects

### 5. **Navigation Requirements**
- **Primary Navigation**: Click anywhere on card (except actions) goes to study details
- **Study Details Route**: `/app/studies/{id}` or `/app/studies/{id}/overview`
- **Prevent Event Bubbling**: Action clicks don't trigger card navigation
- **Loading States**: Show loading during navigation

## 🔧 Technical Implementation

### 1. **Component Structure**
```tsx
<Card onClick={handleCardClick} className="cursor-pointer">
  {/* Card Header with Title + Actions */}
  <div className="flex justify-between items-start">
    <div>{/* Title and Icon */}</div>
    <StudyCardActions 
      study={study}
      onEdit={handleEdit}
      onRename={handleRename}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
    />
  </div>
  
  {/* Card Content */}
  <div>{/* Description, Stats, etc. */}</div>
</Card>
```

### 2. **Action Component**
```tsx
const StudyCardActions = ({ study, onEdit, onRename, onDuplicate, onDelete }) => {
  return (
    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
      <ActionButton icon={Edit} onClick={() => onEdit(study)} tooltip="Edit study" />
      <ActionButton icon={FileText} onClick={() => onRename(study)} tooltip="Rename study" />
      <ActionButton icon={Copy} onClick={() => onDuplicate(study)} tooltip="Duplicate study" />
      <ActionButton icon={Trash2} onClick={() => onDelete(study)} tooltip="Delete study" />
    </div>
  );
};
```

### 3. **New API Requirements**
- **Duplicate Study Endpoint**: `POST /api/studies/{id}/duplicate`
- **Rename Study Endpoint**: `PATCH /api/studies/{id}` with `{ title: "new name" }`

## ✅ Acceptance Criteria

### **Card Clickability**
- [ ] Clicking anywhere on card (except actions) navigates to study details
- [ ] Hover state shows pointer cursor
- [ ] Card has proper accessibility attributes
- [ ] Keyboard navigation works (Enter/Space)

### **Action Simplification**
- [ ] Only 4 actions visible: Edit, Rename, Duplicate, Delete
- [ ] All other actions removed (view, applications, status controls)
- [ ] Actions prevent event bubbling to card click
- [ ] Actions have proper tooltips and accessibility

### **Action Functionality**
- [ ] **Edit**: Navigates to study builder
- [ ] **Rename**: Shows modal/inline edit for title
- [ ] **Duplicate**: Creates copy with confirmation
- [ ] **Delete**: Shows confirmation dialog then deletes

### **Visual Design**
- [ ] Actions are clearly visible but not overwhelming
- [ ] Consistent styling with enhanced UI theme
- [ ] Proper spacing and click targets
- [ ] Hover effects and visual feedback

### **Error Handling**
- [ ] Loading states during actions
- [ ] Error messages for failed operations
- [ ] Confirmation dialogs for destructive actions
- [ ] Optimistic updates where appropriate

## 🚫 Out of Scope
- Advanced study management features
- Bulk operations
- Study status management (moved to dedicated pages)
- Complex permissions (handled at API level)

## 📏 Success Metrics
- **Reduced Cognitive Load**: From 6+ actions to 4 essential actions
- **Improved Navigation**: Direct card clicks for quick access
- **Consistent UX**: All cards have identical action patterns
- **Better Accessibility**: Keyboard navigation and screen reader support

## 🔄 Migration Notes
- Existing study status management moves to dedicated study pages
- Users accessing study applications will navigate through study details first
- Study viewing functionality becomes the default card click behavior

---

**Priority**: High  
**Effort**: Medium  
**Impact**: High User Experience Improvement
