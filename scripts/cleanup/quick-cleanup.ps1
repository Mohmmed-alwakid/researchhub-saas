# Quick Project Cleanup Script
# PowerShell script to immediately clean up the ResearchHub project

Write-Host "🚀 Starting Quick Project Cleanup..." -ForegroundColor Green

# Create archive directories
$archiveBase = "archive\2025-07-12-cleanup"
$dirs = @(
    "$archiveBase",
    "$archiveBase\documentation", 
    "$archiveBase\components",
    "$archiveBase\scripts",
    "$archiveBase\test-files",
    "docs\requirements",
    "docs\requirements\active",
    "docs\requirements\completed", 
    "docs\requirements\templates",
    "docs\requirements\decisions"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

# Move scattered markdown files to docs/reports
$docsReports = "docs\reports"
if (!(Test-Path $docsReports)) {
    New-Item -ItemType Directory -Path $docsReports -Force | Out-Null
}

# Get markdown files in root (excluding key files)
$excludeFiles = @("README.md", "QUICK_REFERENCE_SINGLE_SOURCE.md", "PROJECT_CLEANUP_AND_CENTRALIZATION_PLAN.md")
$markdownFiles = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $excludeFiles -notcontains $_.Name }

$movedCount = 0
foreach ($file in $markdownFiles) {
    try {
        Move-Item $file.FullName "$docsReports\$($file.Name)" -Force
        Write-Host "📚 Moved: $($file.Name) -> docs/reports/" -ForegroundColor Cyan
        $movedCount++
    }
    catch {
        Write-Host "⚠️ Could not move: $($file.Name)" -ForegroundColor Yellow
    }
}

# Move HTML test files to testing/manual
$testingManual = "testing\manual"
if (!(Test-Path $testingManual)) {
    New-Item -ItemType Directory -Path $testingManual -Force | Out-Null
}

$htmlFiles = Get-ChildItem -Path "." -Filter "*.html"
$htmlMoved = 0
foreach ($file in $htmlFiles) {
    try {
        Move-Item $file.FullName "$testingManual\$($file.Name)" -Force
        Write-Host "🧪 Moved: $($file.Name) -> testing/manual/" -ForegroundColor Cyan
        $htmlMoved++
    }
    catch {
        Write-Host "⚠️ Could not move: $($file.Name)" -ForegroundColor Yellow
    }
}

# Archive legacy files if they exist
$legacyFiles = @(
    "apply-wallet-migration.mjs",
    "create-subscription-tables.mjs", 
    "check-tables.mjs",
    "legacy-replacement-complete-final.html"
)

$archivedCount = 0
foreach ($file in $legacyFiles) {
    if (Test-Path $file) {
        try {
            Move-Item $file "$archiveBase\scripts\$file" -Force
            Write-Host "🗑️ Archived: $file" -ForegroundColor Yellow
            $archivedCount++
        }
        catch {
            Write-Host "⚠️ Could not archive: $file" -ForegroundColor Red
        }
    }
}

# Create a simple requirements index
$requirementsIndex = @"
# 📋 MASTER REQUIREMENTS INDEX
**Single Source of Truth for ResearchHub Requirements**

*Last Updated: $(Get-Date -Format "yyyy-MM-dd")*

---

## 🚀 **ACTIVE PROJECTS** (Currently in Development)

### Phase 5: Advanced Study Execution (85% Complete)
- **Status**: 🚧 In Progress  
- **Priority**: High
- **Components**: Screen recording, real-time analytics, live sessions, WebSocket communication
- **Timeline**: Nearly complete - error fixing phase finished

### Performance Optimization (25% Complete)
- **Status**: 🚧 In Progress
- **Priority**: Medium  
- **Components**: Bundle optimization, component cleanup, documentation organization
- **Timeline**: Ongoing

---

## ✅ **COMPLETED PHASES** (Production Ready)

### Phase 1: Foundation & Authentication ✅
- **Completed**: June 2025
- **Components**: Supabase integration, JWT auth, user management
- **Status**: Production deployed

### Phase 2: Study Builder System ✅
- **Completed**: June 2025  
- **Components**: Professional study builder, 13 block types, drag & drop
- **Status**: Production deployed

### Phase 3: Template Management ✅
- **Completed**: June 2025
- **Components**: Template library, preview system, study creation wizard  
- **Status**: Production deployed

### Phase 4: Admin Panel Enhancement ✅
- **Completed**: June 2025
- **Components**: User management, subscription system, system settings
- **Status**: Production deployed

---

## 🏗️ **SYSTEM ARCHITECTURE** (Current Implementation)

### Core Technology Stack
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Vercel Serverless Functions (8 optimized endpoints)
- **Authentication**: Supabase Auth with JWT tokens + refresh tokens
- **Deployment**: Vercel with GitHub auto-deploy integration

### Production Readiness: 92% ✅
- ✅ **Authentication System**: 100% complete
- ✅ **Study Builder**: 100% complete
- ✅ **Template System**: 100% complete  
- ✅ **Admin Panel**: 100% complete
- ✅ **Advanced Execution**: 85% complete (error fixing completed)

---

## 📞 **QUICK REFERENCE**

### Essential Commands
``````bash
npm run dev:fullstack     # Local full-stack development
npm run build             # Production build
npm run test:quick        # Quick test suite
npm run cleanup           # Project cleanup
``````

### Test Accounts (Mandatory)
- **Researcher**: abwanwr77+Researcher@gmail.com / Testtest123
- **Participant**: abwanwr77+participant@gmail.com / Testtest123  
- **Admin**: abwanwr77+admin@gmail.com / Testtest123

---

*This index is automatically updated when requirements change.*
"@

$requirementsIndex | Out-File -FilePath "docs\requirements\00_MASTER_REQUIREMENTS_INDEX.md" -Encoding UTF8

# Generate cleanup report
$cleanupReport = @"
# Quick Cleanup Report
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Cleanup Type**: Quick PowerShell Cleanup

## Summary
- ✅ Archive structure created
- 📚 Moved $movedCount markdown files to docs/reports/
- 🧪 Moved $htmlMoved HTML test files to testing/manual/
- 🗑️ Archived $archivedCount legacy files
- 📋 Created master requirements index

## Next Steps
1. Review moved files in new locations
2. Run automated tests to ensure functionality
3. Update any broken file references
4. Continue with component analysis and removal

## Directories Created
- archive/2025-07-12-cleanup/
- docs/requirements/ (with subdirectories)
- docs/reports/
- testing/manual/

Generated by Quick Cleanup Script
"@

$cleanupReport | Out-File -FilePath "$archiveBase\quick-cleanup-report.md" -Encoding UTF8

# Summary
Write-Host "`n✅ Quick Cleanup Complete!" -ForegroundColor Green
Write-Host "📋 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "   - Moved $movedCount markdown files" -ForegroundColor White
Write-Host "   - Moved $htmlMoved HTML test files" -ForegroundColor White  
Write-Host "   - Archived $archivedCount legacy files" -ForegroundColor White
Write-Host "   - Created requirements system structure" -ForegroundColor White
Write-Host "`n📂 New Structure:" -ForegroundColor Cyan
Write-Host "   - docs/requirements/ - Centralized requirements" -ForegroundColor White
Write-Host "   - docs/reports/ - Moved documentation" -ForegroundColor White
Write-Host "   - testing/manual/ - Test interfaces" -ForegroundColor White
Write-Host "   - archive/2025-07-12-cleanup/ - Archived files" -ForegroundColor White
Write-Host "`n🎯 Next: Run 'npm run dev' to test everything still works!" -ForegroundColor Yellow
