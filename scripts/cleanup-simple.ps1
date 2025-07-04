# ResearchHub Project Cleanup Script
# Simple version without special characters that might cause encoding issues

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "ResearchHub Project Cleanup Starting..." -ForegroundColor Green

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
}

# Create directories
Write-Host "Creating directory structure..." -ForegroundColor Yellow
$dirs = @(
    "docs\reports\2025\07-july",
    "testing\manual", 
    "testing\screenshots\archive",
    "scripts\debug",
    "scripts\migration",
    "scripts\testing",
    "database\migrations"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        if (!$DryRun) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Write-Host "Created: $dir" -ForegroundColor Green
    }
}

# Move files
Write-Host "Moving files..." -ForegroundColor Yellow
$moveCount = 0

# Move reports
$reports = Get-ChildItem -Path "." -Name "*REPORT*.md", "*SUCCESS*.md", "*COMPLETE*.md", "*STATUS*.md", "*IMPLEMENTATION*.md"
foreach ($file in $reports) {
    if (!$DryRun) {
        Move-Item $file "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
    }
    $moveCount++
    if ($Verbose) { Write-Host "  Moving: $file" -ForegroundColor Cyan }
}

# Move test HTML files
$testFiles = Get-ChildItem -Path "." -Name "*test*.html", "*debug*.html", "*admin*.html"
foreach ($file in $testFiles) {
    if (!$DryRun) {
        Move-Item $file "testing\manual\" -Force -ErrorAction SilentlyContinue
    }
    $moveCount++
    if ($Verbose) { Write-Host "  Moving: $file" -ForegroundColor Cyan }
}

# Move screenshots
$screenshots = Get-ChildItem -Path "." -Name "*.png"
foreach ($file in $screenshots) {
    if (!$DryRun) {
        Move-Item $file "testing\screenshots\archive\" -Force -ErrorAction SilentlyContinue
    }
    $moveCount++
    if ($Verbose) { Write-Host "  Moving: $file" -ForegroundColor Cyan }
}

# Move debug scripts
$debugFiles = Get-ChildItem -Path "." -Name "*debug*.js", "*fix*.js", "apply-*.js", "apply-*.mjs"
foreach ($file in $debugFiles) {
    if (!$DryRun) {
        Move-Item $file "scripts\debug\" -Force -ErrorAction SilentlyContinue
    }
    $moveCount++
    if ($Verbose) { Write-Host "  Moving: $file" -ForegroundColor Cyan }
}

# Move migration files
$migrationFiles = Get-ChildItem -Path "." -Name "*.sql", "*migration*.js"
foreach ($file in $migrationFiles) {
    if (!$DryRun) {
        Move-Item $file "database\migrations\" -Force -ErrorAction SilentlyContinue
    }
    $moveCount++
    if ($Verbose) { Write-Host "  Moving: $file" -ForegroundColor Cyan }
}

# Summary
Write-Host "`nCLEANUP SUMMARY" -ForegroundColor Green
Write-Host "Files processed: $moveCount" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`nThis was a dry run. To actually move files, run:" -ForegroundColor Yellow
    Write-Host "npm run cleanup" -ForegroundColor White
} else {
    Write-Host "`nProject cleanup completed!" -ForegroundColor Green
}

# Show current root status
$rootFileCount = (Get-ChildItem -Path "." -File).Count
Write-Host "Current root directory files: $rootFileCount" -ForegroundColor Cyan
