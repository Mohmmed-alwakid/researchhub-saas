# ResearchHub Project Cleanup Script (Final Version)
# Moves scattered files to proper directories

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "ResearchHub Project Cleanup Starting..." -ForegroundColor Green
if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
}

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Yellow
$dirs = @(
    "docs\reports\2025\07-july",
    "testing\manual",
    "testing\screenshots\archive", 
    "testing\e2e",
    "scripts\debug",
    "database\migrations"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        if (!$DryRun) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        if ($Verbose) { Write-Host "  Created: $dir" -ForegroundColor Green }
    }
}

# Move files
Write-Host "Moving files..." -ForegroundColor Yellow
$moveCount = 0

# Helper function to move files safely
function MoveFiles {
    param($Pattern, $Destination, $Description)
    
    $files = Get-ChildItem -Path "." -Name $Pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if (Test-Path $file) {
            if (!$DryRun) {
                Move-Item $file $Destination -Force -ErrorAction SilentlyContinue
            }
            $script:moveCount++
            if ($Verbose) { Write-Host "  $Description`: $file" -ForegroundColor Cyan }
        }
    }
}

# Move report files
$reportPatterns = @("*REPORT*.md", "*SUCCESS*.md", "*COMPLETE*.md", "*STATUS*.md", "*IMPLEMENTATION*.md", "*ANALYSIS*.md")
foreach ($pattern in $reportPatterns) {
    MoveFiles $pattern "docs\reports\2025\07-july\" "Report"
}

# Move test HTML files
$testPatterns = @("*test*.html", "*debug*.html", "*admin*.html", "*fix*.html")
foreach ($pattern in $testPatterns) {
    MoveFiles $pattern "testing\manual\" "Test file"
}

# Move screenshots
MoveFiles "*.png" "testing\screenshots\archive\" "Screenshot"

# Move spec files
MoveFiles "*.spec.ts" "testing\e2e\" "E2E test"

# Move debug scripts
$debugPatterns = @("*debug*.js", "*fix*.js", "*test*.js")
foreach ($pattern in $debugPatterns) {
    MoveFiles $pattern "scripts\debug\" "Debug script"
}

# Move migration files
$migrationPatterns = @("apply-*.js", "apply-*.mjs", "*.sql")
foreach ($pattern in $migrationPatterns) {
    MoveFiles $pattern "database\migrations\" "Migration"
}

# Count current root files
$rootFiles = (Get-ChildItem -Path "." -File | Measure-Object).Count

# Summary
Write-Host "`nCLEANUP SUMMARY" -ForegroundColor Green
Write-Host "Files processed: $moveCount" -ForegroundColor White
if ($DryRun) {
    Write-Host "This was a dry run. To actually move files, run:" -ForegroundColor Yellow
    Write-Host "npm run cleanup" -ForegroundColor Cyan
}
Write-Host "Current root directory files: $rootFiles" -ForegroundColor White

Write-Host "`nProject cleanup completed!" -ForegroundColor Green
