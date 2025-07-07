# 🗑️ SYSTEMATIC DELETION PLAN - Legacy Study Creation Components

## 📋 DELETION PHASE REQUIREMENTS

**Rule**: When implementing new features that replace existing ones, ALL old components must be systematically identified and deleted.

### 🎯 Current Deletion Target: Legacy Study Creation Flow

**Goal**: Keep ONLY the new `SimplifiedStudyCreationModal` and delete all old/redundant study creation components.

## 🔍 IDENTIFICATION PHASE

### Files to DELETE:
1. `src/client/components/studies/MazeInspiredStudyCreationModal.tsx`
2. `src/client/components/study-creator/IntentCapture.tsx` 
3. Any other legacy study creation modals/components

### Files to VERIFY (check for references):
1. All component imports in other files
2. All route definitions 
3. Any component exports
4. Type definitions related to deleted components

## 🗑️ DELETION STEPS

### Step 1: Identify All References
- [ ] Search for `MazeInspiredStudyCreationModal` across codebase
- [ ] Search for `IntentCapture` across codebase  
- [ ] Search for any other legacy imports

### Step 2: Update/Remove References
- [ ] Remove imports from any files that reference deleted components
- [ ] Update component exports
- [ ] Remove from component indexes
- [ ] Update any TypeScript interfaces/types

### Step 3: Delete Files
- [ ] Delete `MazeInspiredStudyCreationModal.tsx`
- [ ] Delete `IntentCapture.tsx`
- [ ] Delete any related test files
- [ ] Delete any related documentation

### Step 4: Verify Clean Build
- [ ] Run TypeScript compilation check
- [ ] Run application and verify no runtime errors
- [ ] Test the remaining functionality works

## 🔄 FUTURE DEVELOPMENT PROCESS

### GitHub Instructions Update:
When replacing any component/feature, the PR must include:

1. **PLAN PHASE**: 
   - Identify all files being replaced
   - List all files to be deleted
   - Search for references across codebase

2. **IMPLEMENTATION PHASE**:
   - Build new feature
   - Update all references to use new feature
   - 
3. **DELETION PHASE**: 
   - Systematically delete old files
   - Remove all references
   - Clean up imports and exports

4. **VERIFICATION PHASE**:
   - TypeScript compilation check
   - Runtime testing
   - Ensure no broken references

## ✅ SUCCESS CRITERIA

- [ ] No old components remain in codebase
- [ ] No broken imports or references
- [ ] TypeScript compiles with 0 errors  
- [ ] Application functions correctly
- [ ] Only ONE study creation flow exists

---

**This systematic approach ensures clean, maintainable code without technical debt.**
