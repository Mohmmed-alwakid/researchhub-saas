# Documentation & Folder Cleanup Plan for Vibe-Coder-MCP Implementation

## 📋 Executive Summary

This document outlines the comprehensive cleanup strategy as part of implementing Vibe-Coder-MCP improvements in ResearchHub. The cleanup will happen in parallel with implementation to maintain a clean, organized codebase.

## 🎯 Cleanup Objectives

1. **Reduce Root Directory Clutter** - Move scattered files to proper directories
2. **Archive Legacy Documentation** - Preserve history while organizing current docs
3. **Consolidate Duplicate Files** - Remove redundant scripts and documentation
4. **Organize by Function** - Group related files together
5. **Improve Maintainability** - Clear structure for future development

## 📁 Current State Analysis

### Root Directory Issues (120+ files!)
- **70+ Markdown files** scattered in root instead of `docs/`
- **30+ Test/Debug scripts** scattered instead of organized in `scripts/` or `testing/`
- **15+ HTML test interfaces** should be in `testing/manual/`
- **Multiple cleanup scripts** that overlap in functionality

### Directory Structure Issues
- Multiple similar directories: `tests/`, `testing/`, `e2e-tests/`, `playwright-tests/`
- Documentation spread across root and `docs/`
- Scripts mixed between root, `scripts/`, and other locations

## 🚀 Cleanup Strategy

### Phase 1: Archive & Organize (Week 1 of Implementation)
**Timing: Parallel with Vibe-Coder Phase 1 Tasks**

#### **Step 1.1: Create Archive Structure**
```
archive/
├── 2025-07-legacy/
│   ├── documentation/          # Old markdown files from root
│   ├── scripts/               # Legacy scripts
│   ├── test-interfaces/       # HTML test files
│   └── reports/              # Old analysis reports
└── by-date/
    ├── 2025-06/              # June 2025 files
    ├── 2025-07/              # July 2025 files (pre-cleanup)
    └── migration-log.md      # What was moved where
```

#### **Step 1.2: Documentation Reorganization**
```
docs/
├── current/                   # Active documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # System architecture
│   ├── guides/              # Development guides
│   └── requirements/        # Project requirements
├── legacy/                   # Archived documentation
│   ├── 2025-07-pre-vibe/   # Pre-Vibe-Coder documentation
│   └── migration-notes.md   # What changed and why
└── vibe-coder/              # New Vibe-Coder documentation
    ├── implementation/       # Implementation progress
    ├── architecture/         # New architectural patterns
    └── guides/              # Updated development guides
```

#### **Step 1.3: Testing Structure Consolidation**
```
testing/
├── automated/               # Playwright, Jest, etc.
├── manual/                  # HTML test interfaces
├── data/                    # Test data and fixtures
├── reports/                 # Test results and reports
├── legacy/                  # Archived test files
└── scripts/                 # Testing utility scripts
```

#### **Step 1.4: Scripts Organization**
```
scripts/
├── setup/                   # Project setup scripts
├── development/             # Development utilities
├── testing/                 # Testing automation
├── deployment/              # Deployment scripts
├── cleanup/                 # Cleanup utilities
├── migration/               # Data/code migration scripts
└── legacy/                  # Archived scripts
```

### Phase 2: Implementation Cleanup (Week 2-3)
**Timing: During Vibe-Coder Phase 1-2**

#### **Step 2.1: Root Directory Enforcement**
- **Maximum 20 files** in root directory
- **Essential files only**: package.json, README.md, config files
- **Automated enforcement** via pre-commit hooks

#### **Step 2.2: Duplicate Removal**
- **Merge similar scripts**: Consolidate cleanup.bat, clean-project.ps1, cleanup-project.ps1
- **Remove redundant docs**: Archive duplicate analysis documents
- **Consolidate test files**: Remove overlapping test interfaces

#### **Step 2.3: Naming Standardization**
- **kebab-case** for directories: `product-manager/`, `test-results/`
- **PascalCase** for React components
- **SCREAMING_SNAKE_CASE** for documentation: `README.md`, `API_GUIDE.md`

### Phase 3: Maintenance Automation (Week 4+)
**Timing: During Vibe-Coder Phase 2-3**

#### **Step 3.1: Automated Organization**
- **Pre-commit hooks** to prevent root directory pollution
- **Automated file placement** based on file type and purpose
- **Regular cleanup reports** showing organization health

#### **Step 3.2: Documentation Automation**
- **Auto-generated** documentation index
- **Automated archival** of old documentation
- **Link validation** for all documentation

## 🛠️ Implementation Commands

### Automated Cleanup (Enhanced)
```bash
# Phase 1: Archive & Organize
npm run cleanup:archive         # Archive legacy files
npm run cleanup:docs           # Reorganize documentation
npm run cleanup:tests          # Consolidate testing files
npm run cleanup:scripts        # Organize scripts

# Phase 2: Structure Enforcement  
npm run cleanup:root           # Clean root directory
npm run cleanup:duplicates     # Remove duplicates
npm run cleanup:naming         # Standardize naming

# Phase 3: Maintenance
npm run cleanup:validate       # Check organization health
npm run cleanup:report         # Generate cleanup report
npm run cleanup:auto           # Automated daily cleanup
```

### Manual Cleanup Steps
```bash
# 1. Create new structure
mkdir -p archive/2025-07-legacy/{documentation,scripts,test-interfaces,reports}
mkdir -p docs/{current/{api,architecture,guides,requirements},legacy,vibe-coder}
mkdir -p testing/{automated,manual,data,reports,legacy,scripts}
mkdir -p scripts/{setup,development,testing,deployment,cleanup,migration,legacy}

# 2. Move files by type
# (This will be automated by enhanced cleanup scripts)

# 3. Update references
# (Automated by migration scripts)
```

## 📊 File Migration Plan

### Documentation Files (70+ files)
| File Pattern | Destination | Action |
|--------------|-------------|---------|
| `*_SUMMARY.md` | `docs/legacy/2025-07-pre-vibe/` | Archive |
| `*_PLAN.md` | `docs/current/guides/` | Keep active |
| `*_REQUIREMENTS.md` | `docs/current/requirements/` | Keep active |
| `DEPLOYMENT_*.md` | `docs/current/guides/deployment/` | Organize |
| `API_*.md` | `docs/current/api/` | Organize |

### Test Files (30+ files)
| File Pattern | Destination | Action |
|--------------|-------------|---------|
| `*-test.html` | `testing/manual/` | Move |
| `test-*.mjs` | `testing/scripts/` | Move |
| `*-debug.html` | `testing/manual/debug/` | Move |
| `complete-*.mjs` | `testing/scripts/e2e/` | Organize |

### Scripts (25+ files)
| File Pattern | Destination | Action |
|--------------|-------------|---------|
| `create-*.js` | `scripts/development/database/` | Move |
| `debug-*.mjs` | `scripts/development/debug/` | Move |
| `setup-*.mjs` | `scripts/setup/` | Move |
| `cleanup.*` | `scripts/cleanup/` | Consolidate |

## 🔒 Safety Measures

### Backup Before Cleanup
1. **Git commit** all current work
2. **Create branch** `pre-vibe-coder-cleanup`
3. **Archive to zip** before major moves
4. **Test builds** after each cleanup phase

### Validation After Cleanup
1. **Build validation**: `npm run build` succeeds
2. **Test validation**: Core tests still pass
3. **Link validation**: All documentation links work
4. **Import validation**: All code imports resolve

## 📈 Success Metrics

### Organization Metrics
- **Root directory files**: Reduce from 120+ to <20
- **Documentation findability**: <3 clicks to any doc
- **Script discoverability**: Clear categorization
- **Build time**: No performance degradation

### Developer Experience
- **Faster navigation**: Clear directory structure
- **Easier onboarding**: Logical file organization
- **Reduced confusion**: No duplicate/conflicting files
- **Better maintenance**: Automated organization

## 🎯 Integration with Vibe-Coder Implementation

### Week 1 (Phase 1): Foundation
- **Day 1**: Archive legacy files
- **Day 2**: Create new structure
- **Day 3**: Move documentation
- **Day 4**: Organize scripts and tests
- **Day 5**: Validate and fix references

### Week 2-3 (Phase 1-2): Enhancement
- **Parallel with block registry work**
- **Clean up as we refactor**
- **Archive obsolete files during migration**

### Week 4+ (Phase 2-3): Automation
- **Automated maintenance tools**
- **Pre-commit organization checks**
- **Regular health reports**

## 🚀 Next Steps

1. **Review this plan** - Confirm approach and priorities
2. **Create enhanced cleanup scripts** - Automate the migration
3. **Start with Phase 1** - Archive and organize
4. **Run in parallel** with Vibe-Coder implementation
5. **Monitor and adjust** - Refine based on results

**This cleanup will happen alongside the Vibe-Coder implementation, not as a separate project, ensuring we maintain momentum while improving organization.**
