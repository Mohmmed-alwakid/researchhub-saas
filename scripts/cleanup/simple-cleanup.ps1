# Simple Project Cleanup Script for ResearchHub
Write-Host "Starting Quick Project Cleanup..." -ForegroundColor Green

# Create required directories
$dirs = @(
    "archive\2025-07-12-cleanup",
    "docs\requirements",
    "docs\reports",
    "testing\manual"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Green
    }
}

# Move markdown files (exclude key files)
$excludeFiles = @("README.md", "QUICK_REFERENCE_SINGLE_SOURCE.md", "PROJECT_CLEANUP_AND_CENTRALIZATION_PLAN.md")
$markdownFiles = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { $excludeFiles -notcontains $_.Name }

$movedCount = 0
foreach ($file in $markdownFiles) {
    try {
        Move-Item $file.FullName "docs\reports\$($file.Name)" -Force
        Write-Host "Moved: $($file.Name)" -ForegroundColor Cyan
        $movedCount++
    }
    catch {
        Write-Host "Could not move: $($file.Name)" -ForegroundColor Yellow
    }
}

# Move HTML test files
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html"
$htmlMoved = 0
foreach ($file in $htmlFiles) {
    if ($file.Name -ne "index.html") {
        try {
            Move-Item $file.FullName "testing\manual\$($file.Name)" -Force
            Write-Host "Moved: $($file.Name)" -ForegroundColor Cyan
            $htmlMoved++
        }
        catch {
            Write-Host "Could not move: $($file.Name)" -ForegroundColor Yellow
        }
    }
}

# Create requirements index
$indexContent = @"
# MASTER REQUIREMENTS INDEX
**Single Source of Truth for ResearchHub Requirements**

## ACTIVE PROJECTS
### Phase 5: Advanced Study Execution (85% Complete)
- Status: In Progress
- Components: Screen recording, real-time analytics, live sessions

### Performance Optimization (25% Complete) 
- Status: In Progress
- Components: Bundle optimization, component cleanup

## COMPLETED PHASES
### Phase 1-4: Core Platform (100% Complete)
- Authentication System
- Study Builder System  
- Template Management
- Admin Panel Enhancement

## SYSTEM STATUS
- Production Readiness: 92%
- Test Accounts Available
- Local Development Ready

## QUICK COMMANDS
npm run dev:fullstack     # Local development
npm run build             # Production build
npm run test:quick        # Quick tests
npm run cleanup           # Project cleanup
"@

$indexContent | Out-File -FilePath "docs\requirements\00_MASTER_INDEX.md" -Encoding UTF8

# Summary
Write-Host ""
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "Moved $movedCount markdown files" -ForegroundColor White
Write-Host "Moved $htmlMoved HTML test files" -ForegroundColor White
Write-Host "Created requirements system" -ForegroundColor White
Write-Host ""
Write-Host "Next: Run 'npm run dev:fullstack' to test!" -ForegroundColor Yellow
