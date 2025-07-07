# ResearchHub Project Cleanup Script
# Cleans up outdated files and organizes project structure

Write-Host "🧹 Starting ResearchHub Project Cleanup..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Create archive directory if it doesn't exist
$archiveDir = "archive\legacy-files"
if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "✅ Created archive directory: $archiveDir" -ForegroundColor Green
}

# Define files to move to archive
$filesToArchive = @(
    # Old HTML test files
    "*.html",
    # Old MD documentation (except main docs)
    "*DOCUMENTATION*.md",
    "*IMPLEMENTATION*.md", 
    "*ANALYSIS*.md",
    "*ROADMAP*.md",
    "*STATUS*.md",
    "*REPORT*.md",
    "*CHECKLIST*.md",
    "*PLAN*.md",
    "*GUIDE*.md",
    "*STRATEGY*.md",
    "*SUMMARY*.md",
    # Old JS/MJS scripts in root
    "*.mjs",
    "*.cjs",
    # JSON reports
    "*report*.json",
    "*audit*.json",
    "completion-tracking.json"
)

# Keep these important files in root
$keepInRoot = @(
    "README.md",
    "package.json",
    "package-lock.json", 
    "tsconfig*.json",
    "vite.config.ts",
    "tailwind.config.js",
    "eslint.config.js",
    "playwright.config.js",
    "postcss.config.js",
    "vercel.json",
    "render.yaml",
    ".env*",
    ".gitignore",
    ".dockerignore",
    "nodemon.json",
    "vibe-coder-progress.json",
    "VIBE_CODER_MCP_COMPLETE.md"
)

$movedCount = 0
$skippedCount = 0

Write-Host "`n📁 Moving outdated files to archive..." -ForegroundColor Yellow

foreach ($pattern in $filesToArchive) {
    $files = Get-ChildItem -Path "." -Name $pattern -File | Where-Object { 
        $filename = $_
        -not ($keepInRoot | Where-Object { $filename -like $_ })
    }
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            try {
                Move-Item -Path $file -Destination $archiveDir -Force
                Write-Host "  ✅ Moved: $file" -ForegroundColor Green
                $movedCount++
            } catch {
                Write-Host "  ⚠️  Skipped: $file (in use or error)" -ForegroundColor Yellow
                $skippedCount++
            }
        }
    }
}

Write-Host "`n🗂️  Consolidating test directories..." -ForegroundColor Yellow

# Handle duplicate test directories
$testDirs = @("playwright-tests", "test-results", "e2e-tests")

foreach ($dir in $testDirs) {
    if (Test-Path $dir) {
        try {
            $targetDir = "testing\legacy\$dir"
            if (!(Test-Path "testing\legacy")) {
                New-Item -ItemType Directory -Path "testing\legacy" -Force | Out-Null
            }
            Move-Item -Path $dir -Destination $targetDir -Force
            Write-Host "  ✅ Moved directory: $dir -> $targetDir" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not move directory: $dir" -ForegroundColor Yellow
        }
    }
}

# Clean up empty directories
Write-Host "`n🧹 Removing empty directories..." -ForegroundColor Yellow
$emptyDirs = Get-ChildItem -Directory | Where-Object { 
    (Get-ChildItem $_.FullName -Recurse | Measure-Object).Count -eq 0 
}

foreach ($dir in $emptyDirs) {
    try {
        Remove-Item $dir.FullName -Force
        Write-Host "  ✅ Removed empty directory: $($dir.Name)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Could not remove: $($dir.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "  📁 Files moved to archive: $movedCount" -ForegroundColor Green
Write-Host "  ⚠️  Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host "  🗂️  Test directories consolidated" -ForegroundColor Green
Write-Host "  ✅ Project structure cleaned!" -ForegroundColor Green

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review archived files in: $archiveDir" -ForegroundColor White
Write-Host "  2. Delete archive folder if no longer needed" -ForegroundColor White
Write-Host "  3. Run 'npm run dev:fullstack' to start development" -ForegroundColor White

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
