# 🔄 GITHUB DEVELOPMENT PROCESS - SYSTEMATIC DELETION REQUIREMENTS

## 📋 MANDATORY DELETION PROTOCOL

**RULE**: When implementing features that replace existing components, **ALL old components MUST be systematically deleted** in the same PR.

## 🎯 DEVELOPMENT PROCESS PHASES

### 1. 📋 PLAN PHASE (Required Before Any Code Changes)
**Before writing any new code, complete this analysis:**

#### Identify What Will Be Replaced
- [ ] List all existing components/files that will be replaced
- [ ] Document the current functionality being replaced
- [ ] Identify all related files (tests, docs, types)

#### Search for References  
- [ ] `grep -r "ComponentName" src/` - Find all imports/usage
- [ ] `grep -r "fileName" src/` - Find all file references  
- [ ] `grep -r "TypeName" src/` - Find all type/interface usage
- [ ] Document ALL files that reference the components to be deleted

#### Create Deletion List
- [ ] List every file to be deleted
- [ ] List every import to be updated  
- [ ] List every type/interface to be removed
- [ ] List every export to be updated

### 2. 🔧 IMPLEMENTATION PHASE
- [ ] Build new feature completely
- [ ] Update all references to use new feature
- [ ] Ensure new feature has same functionality as old
- [ ] Test new feature works correctly

### 3. 🗑️ DELETION PHASE (MANDATORY)
**Execute systematic deletion:**

#### Remove References First
- [ ] Remove all imports of deleted components
- [ ] Update all component usages to new component
- [ ] Remove exports from index files
- [ ] Update any TypeScript interfaces/types

#### Delete Files
- [ ] Delete the actual component files
- [ ] Delete related test files
- [ ] Delete related documentation files
- [ ] Delete empty directories

#### Verify Clean State
- [ ] `npx tsc --noEmit` - Must show 0 errors
- [ ] `grep -r "DeletedComponent" src/` - Must show 0 results
- [ ] Test application runs without errors
- [ ] Verify all functionality still works

### 4. ✅ VERIFICATION PHASE
- [ ] TypeScript compilation: 0 errors
- [ ] Application startup: No runtime errors  
- [ ] Functionality test: All features work
- [ ] No dead code: No unused components remain

## 🚫 WHAT NOT TO DO

### ❌ Don't Leave Old Code
- Don't comment out old components
- Don't keep "just in case" backups
- Don't leave unused imports
- Don't leave empty directories

### ❌ Don't Create Technical Debt  
- Don't implement new without deleting old
- Don't leave broken references
- Don't ignore TypeScript errors
- Don't skip verification steps

## ✅ PR REQUIREMENTS

### Every PR That Replaces Components Must Include:

#### 📋 Plan Documentation
- List of files being replaced
- List of files being deleted
- Reference analysis results

#### 🔧 Implementation  
- New feature implementation
- Updated references to new feature

#### 🗑️ Deletion
- Systematic deletion of old components
- Cleanup of all references
- Verification of clean state

#### ✅ Verification Evidence
- `npx tsc --noEmit` output showing 0 errors
- Grep results showing 0 references to deleted components
- Screenshot/evidence of working application

## 🏆 SUCCESS CRITERIA

**A PR is only complete when:**
- ✅ New feature works correctly
- ✅ Old components are completely deleted
- ✅ No broken references exist
- ✅ TypeScript compiles with 0 errors
- ✅ Application runs without errors
- ✅ No dead code remains

## 📝 EXAMPLE: Recent Study Creation Cleanup

### What Was Replaced
- `MazeInspiredStudyCreationModal.tsx` → `SimplifiedStudyCreationModal.tsx`
- `IntentCapture.tsx` → Removed (functionality integrated)
- `StudyTypeSelectionModal.tsx` → Removed (redundant)

### What Was Deleted
- `src/client/components/studies/MazeInspiredStudyCreationModal.tsx`
- `src/client/components/study-creator/IntentCapture.tsx`
- `src/client/components/study-creator/index.ts`
- `src/client/components/study-creator/` (entire directory)
- `src/client/components/studies/StudyTypeSelectionModal.tsx`
- `src/client/components/studies/TemplateSelectionModal.tsx`

### Verification Results
- TypeScript compilation: ✅ 0 errors
- Dead code search: ✅ 0 references to deleted components
- Application test: ✅ Study creation works correctly
- Only ONE study creation flow remains

---

**This process ensures clean, maintainable code without technical debt.**
