# ResearchHub Project Cleanup Script
# This script organizes the entire project structure according to our standards

Write-Host "🧹 Starting ResearchHub Project Cleanup..." -ForegroundColor Cyan

# Create organized directory structure
Write-Host "📁 Creating organized directory structure..." -ForegroundColor Yellow

# Create testing subdirectories
New-Item -ItemType Directory -Path "testing\manual" -Force | Out-Null
New-Item -ItemType Directory -Path "testing\screenshots\archive" -Force | Out-Null

# Create docs subdirectories  
New-Item -ItemType Directory -Path "docs\reports\2025\07-july" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\api" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\development" -Force | Out-Null

# Create scripts subdirectories
New-Item -ItemType Directory -Path "scripts\debug" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts\migration" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts\testing" -Force | Out-Null

# Create database subdirectories
New-Item -ItemType Directory -Path "database\migrations" -Force | Out-Null
New-Item -ItemType Directory -Path "database\schemas" -Force | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Move scattered test HTML files
Write-Host "🧪 Organizing test files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*test*.html" | ForEach-Object {
    Move-Item $_ "testing\manual\" -Force -ErrorAction SilentlyContinue
}

# Move debug files  
Write-Host "🐛 Organizing debug files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "debug-*" | ForEach-Object {
    Move-Item $_ "scripts\debug\" -Force -ErrorAction SilentlyContinue
}

# Move migration files
Write-Host "🗄️ Organizing migration files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "apply-*" | ForEach-Object {
    Move-Item $_ "scripts\migration\" -Force -ErrorAction SilentlyContinue
}

# Move report files to docs
Write-Host "📄 Organizing report files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*REPORT*.md" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "*STATUS*.md" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "*COMPLETE*.md" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "*SUCCESS*.md" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "*IMPLEMENTATION*.md" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}

# Move screenshots to archive
Write-Host "📸 Organizing screenshots..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.png" | ForEach-Object {
    Move-Item $_ "testing\screenshots\archive\" -Force -ErrorAction SilentlyContinue
}

# Move check/test scripts 
Write-Host "🔍 Organizing check/test scripts..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "check-*" | ForEach-Object {
    Move-Item $_ "scripts\debug\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "test-*" | ForEach-Object {
    Move-Item $_ "scripts\testing\" -Force -ErrorAction SilentlyContinue
}

# Move database migration files
Write-Host "🗃️ Organizing database files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.sql" | ForEach-Object {
    Move-Item $_ "database\migrations\" -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path "." -Name "*migration*" | ForEach-Object {
    Move-Item $_ "database\migrations\" -Force -ErrorAction SilentlyContinue
}

# Move remaining scattered files
Write-Host "📦 Organizing remaining files..." -ForegroundColor Yellow

# Move spec files to testing
Get-ChildItem -Path "." -Name "*.spec.ts" | ForEach-Object {
    Move-Item $_ "testing\e2e\" -Force -ErrorAction SilentlyContinue
}

# Move JSON reports to docs
Get-ChildItem -Path "." -Name "*report*.json" | ForEach-Object {
    Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue
}

# Move any remaining HTML files that aren't essential
Get-ChildItem -Path "." -Name "*.html" | Where-Object { $_.Name -ne "index.html" } | ForEach-Object {
    Move-Item $_ "testing\manual\" -Force -ErrorAction SilentlyContinue
}

# Clean up any duplicate/legacy directories
Write-Host "Removing legacy directories..." -ForegroundColor Yellow
if (Test-Path "e2e-tests") {
    Remove-Item "e2e-tests" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "playwright-tests") {
    Remove-Item "playwright-tests" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "database-migrations") {
    Get-ChildItem "database-migrations" | ForEach-Object {
        Move-Item $_.FullName "database\migrations\" -Force -ErrorAction SilentlyContinue
    }
    Remove-Item "database-migrations" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Project cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "✅ Test files moved to testing/ structure" -ForegroundColor Green
Write-Host "✅ Reports organized in docs/reports/2025/07-july/" -ForegroundColor Green  
Write-Host "✅ Debug files moved to scripts/debug/" -ForegroundColor Green
Write-Host "✅ Screenshots archived in testing/screenshots/archive/" -ForegroundColor Green
Write-Host "✅ Database files organized in database/" -ForegroundColor Green
Write-Host "✅ Duplicate directories removed" -ForegroundColor Green
Write-Host ""

# Show final root directory status
Write-Host "📁 Current root directory files:" -ForegroundColor Cyan
Get-ChildItem -Path "." -File | Select-Object Name | Format-Table -AutoSize

Write-Host "Your project is now clean and organized!" -ForegroundColor Green
Write-Host "📖 See PROJECT_CLEANUP_AND_ORGANIZATION_PLAN.md for details" -ForegroundColor Yellow
