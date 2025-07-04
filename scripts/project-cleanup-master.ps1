# PROJECT CLEANUP MASTER SCRIPT
# Single command to organize entire ResearchHub project
# Usage: .\scripts\project-cleanup-master.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "🚀 ResearchHub Project Cleanup Master Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No files will be moved" -ForegroundColor Yellow
}

# Define target directories
$directories = @{
    "docs\reports\2025\07-july" = "Report and status files"
    "testing\manual" = "Manual test HTML files"
    "testing\screenshots\archive" = "Screenshot files"
    "testing\specs\archive" = "Test spec files"
    "scripts\debug" = "Debug scripts"
    "scripts\migration" = "Migration scripts" 
    "scripts\testing" = "Testing scripts"
    "database\migrations" = "Database migration files"
    "temp\archive" = "Temporary and miscellaneous files"
}

# Create directories
Write-Host "`n📁 Creating directory structure..." -ForegroundColor Green
foreach ($dir in $directories.Keys) {
    if (!(Test-Path $dir)) {
        if (!$DryRun) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Exists: $dir" -ForegroundColor Gray
    }
}

# File movement rules
$moveRules = @(
    @{
        Pattern = "*REPORT*.md", "*SUCCESS*.md", "*COMPLETE*.md", "*STATUS*.md", "*IMPLEMENTATION*.md", "*ANALYSIS*.md", "*DOCUMENTATION*.md"
        Destination = "docs\reports\2025\07-july"
        Description = "Report files"
    },
    @{
        Pattern = "*test*.html", "*debug*.html", "*admin*.html", "*auth*.html"
        Destination = "testing\manual"
        Description = "Manual test files"
    },
    @{
        Pattern = "*.png", "*.jpg", "*.jpeg", "*.gif", "*screenshot*"
        Destination = "testing\screenshots\archive"
        Description = "Screenshot files"
    },
    @{
        Pattern = "*.spec.ts", "*test*.spec.*", "*e2e*.ts"
        Destination = "testing\specs\archive"
        Description = "Test spec files"
    },
    @{
        Pattern = "*debug*.js", "*fix*.js", "*test*.js", "apply-*.js", "apply-*.mjs"
        Destination = "scripts\debug"
        Description = "Debug scripts"
    },
    @{
        Pattern = "*migration*.js", "*migration*.mjs", "*.sql"
        Destination = "database\migrations"
        Description = "Migration files"
    },
    @{
        Pattern = "*cleanup*.ps1", "*clean*.ps1", "*organize*.ps1"
        Destination = "scripts\testing"
        Description = "Cleanup scripts"
    }
)

# Move files according to rules
Write-Host "`n📦 Moving files to organized locations..." -ForegroundColor Green
$totalMoved = 0

foreach ($rule in $moveRules) {
    Write-Host "`n  🔄 Processing: $($rule.Description)" -ForegroundColor Yellow
    
    foreach ($pattern in $rule.Pattern) {
        $files = Get-ChildItem -Path "." -Name $pattern -File | Where-Object { $_ -notlike "node_modules*" }
        
        foreach ($file in $files) {
            $destination = Join-Path $rule.Destination $file
            
            if (Test-Path $file) {
                if ($Verbose) {
                    Write-Host "    📄 $file → $($rule.Destination)" -ForegroundColor Cyan
                }
                
                if (!$DryRun) {
                    try {
                        Move-Item -Path $file -Destination $destination -Force
                        $totalMoved++
                    } catch {
                        Write-Host "    ❌ Error moving $file`: $_" -ForegroundColor Red
                    }
                } else {
                    Write-Host "    📄 [DRY RUN] Would move: $file → $($rule.Destination)" -ForegroundColor Cyan
                    $totalMoved++
                }
            }
        }
    }
}

# Remove empty duplicate directories
Write-Host "`n🗑️  Removing duplicate/empty directories..." -ForegroundColor Green
$duplicateDirs = @("tests", "ProductManager", "e2e-tests", "playwright-tests", "database-migrations")

foreach ($dir in $duplicateDirs) {
    if (Test-Path $dir) {
        $itemCount = (Get-ChildItem $dir -Recurse -File).Count
        if ($itemCount -eq 0) {
            if (!$DryRun) {
                Remove-Item $dir -Recurse -Force
            }
            Write-Host "  ✅ Removed empty directory: $dir" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Directory $dir still contains $itemCount files - manual review needed" -ForegroundColor Yellow
        }
    }
}

# Validate project structure
Write-Host "`n🔍 Validating project structure..." -ForegroundColor Green

$requiredDirs = @("src", "api", "docs", "testing", "scripts", "database")
$missingDirs = @()

foreach ($dir in $requiredDirs) {
    if (!(Test-Path $dir)) {
        $missingDirs += $dir
    }
}

if ($missingDirs.Count -eq 0) {
    Write-Host "  ✅ All required directories present" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Missing directories: $($missingDirs -join ', ')" -ForegroundColor Yellow
}

# Check root directory cleanliness
$rootFiles = Get-ChildItem -Path "." -File | Where-Object { 
    $_.Name -notlike "package*" -and 
    $_.Name -notlike "*.config.*" -and 
    $_.Name -notlike "README*" -and 
    $_.Name -notlike "*.env*" -and
    $_.Name -notlike "index.html" -and
    $_.Name -notlike "*.json" -and
    $_.Name -notlike "*.lock" -and
    $_.Name -notlike "*.log"
}

Write-Host "`n📊 Root directory status:" -ForegroundColor Green
Write-Host "  📁 Total files in root: $((Get-ChildItem -Path "." -File).Count)" -ForegroundColor Cyan
Write-Host "  🗑️  Files that could be moved: $($rootFiles.Count)" -ForegroundColor Cyan

if ($rootFiles.Count -gt 0 -and $Verbose) {
    Write-Host "  📄 Files that could be organized:" -ForegroundColor Yellow
    foreach ($file in $rootFiles) {
        Write-Host "    - $($file.Name)" -ForegroundColor Gray
    }
}

# Generate summary report
Write-Host "`n📋 CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "📦 Files moved: $totalMoved" -ForegroundColor Green
Write-Host "📁 Directories created: $($directories.Count)" -ForegroundColor Green
Write-Host "🗑️  Duplicate directories removed: $(($duplicateDirs | Where-Object { !(Test-Path $_) }).Count)" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n💡 This was a dry run. To actually move files, run:" -ForegroundColor Yellow
    Write-Host "   .\scripts\project-cleanup-master.ps1" -ForegroundColor White
} else {
    Write-Host "`n✅ Project cleanup completed successfully!" -ForegroundColor Green
    Write-Host "🔧 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Review moved files in their new locations" -ForegroundColor White
    Write-Host "   2. Update any hardcoded file paths in your code" -ForegroundColor White
    Write-Host "   3. Run tests to ensure everything still works" -ForegroundColor White
}

Write-Host "`n🎯 Project is now organized according to ResearchHub standards!" -ForegroundColor Green
