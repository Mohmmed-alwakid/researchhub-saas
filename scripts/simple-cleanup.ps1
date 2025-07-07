# ResearchHub Project Cleanup Script
Write-Host "Starting ResearchHub Project Cleanup..." -ForegroundColor Cyan

# Create archive directory
$archiveDir = "archive\legacy-files"
if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    Write-Host "Created archive directory: $archiveDir" -ForegroundColor Green
}

# Move HTML test files
Write-Host "Moving HTML test files..." -ForegroundColor Yellow
Get-ChildItem "*.html" | ForEach-Object {
    if ($_.Name -notlike "index.html") {
        Move-Item $_.FullName "$archiveDir\$($_.Name)" -Force -ErrorAction SilentlyContinue
        Write-Host "Moved: $($_.Name)" -ForegroundColor Green
    }
}

# Move documentation files (except main ones)
Write-Host "Moving documentation files..." -ForegroundColor Yellow
$docPatterns = @("*DOCUMENTATION*.md", "*IMPLEMENTATION*.md", "*ANALYSIS*.md", "*ROADMAP*.md", "*STATUS*.md", "*REPORT*.md")
foreach ($pattern in $docPatterns) {
    Get-ChildItem $pattern | ForEach-Object {
        if ($_.Name -notlike "README.md" -and $_.Name -notlike "VIBE_CODER_MCP_COMPLETE.md") {
            Move-Item $_.FullName "$archiveDir\$($_.Name)" -Force -ErrorAction SilentlyContinue
            Write-Host "Moved: $($_.Name)" -ForegroundColor Green
        }
    }
}

# Move script files from root
Write-Host "Moving script files..." -ForegroundColor Yellow
Get-ChildItem "*.mjs" | ForEach-Object {
    Move-Item $_.FullName "$archiveDir\$($_.Name)" -Force -ErrorAction SilentlyContinue
    Write-Host "Moved: $($_.Name)" -ForegroundColor Green
}

Get-ChildItem "*.cjs" | ForEach-Object {
    Move-Item $_.FullName "$archiveDir\$($_.Name)" -Force -ErrorAction SilentlyContinue
    Write-Host "Moved: $($_.Name)" -ForegroundColor Green
}

# Move JSON reports
Write-Host "Moving JSON report files..." -ForegroundColor Yellow
Get-ChildItem "*report*.json", "*audit*.json", "completion-tracking.json" | ForEach-Object {
    Move-Item $_.FullName "$archiveDir\$($_.Name)" -Force -ErrorAction SilentlyContinue
    Write-Host "Moved: $($_.Name)" -ForegroundColor Green
}

# Handle test directories
Write-Host "Consolidating test directories..." -ForegroundColor Yellow
$testDirs = @("playwright-tests", "test-results", "e2e-tests")
foreach ($dir in $testDirs) {
    if (Test-Path $dir) {
        $targetDir = "testing\legacy\$dir"
        if (!(Test-Path "testing\legacy")) {
            New-Item -ItemType Directory -Path "testing\legacy" -Force | Out-Null
        }
        Move-Item $dir $targetDir -Force -ErrorAction SilentlyContinue
        Write-Host "Moved directory: $dir to $targetDir" -ForegroundColor Green
    }
}

Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Files archived in: $archiveDir" -ForegroundColor Cyan
Write-Host "Run 'npm run dev:fullstack' to start development server" -ForegroundColor Cyan
