# ResearchHub Project Cleanup Script
Write-Host "Starting ResearchHub Project Cleanup..." -ForegroundColor Green

# Create organized directory structure
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "testing\manual" -Force | Out-Null
New-Item -ItemType Directory -Path "testing\screenshots\archive" -Force | Out-Null
New-Item -ItemType Directory -Path "docs\reports\2025\07-july" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts\debug" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts\migration" -Force | Out-Null
New-Item -ItemType Directory -Path "scripts\testing" -Force | Out-Null
New-Item -ItemType Directory -Path "database\migrations" -Force | Out-Null

# Move files
Write-Host "Moving test files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*test*.html" | ForEach-Object { Move-Item $_ "testing\manual\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving debug files..." -ForegroundColor Yellow  
Get-ChildItem -Path "." -Name "debug-*" | ForEach-Object { Move-Item $_ "scripts\debug\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving migration files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "apply-*" | ForEach-Object { Move-Item $_ "scripts\migration\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving reports..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*REPORT*.md" | ForEach-Object { Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue }
Get-ChildItem -Path "." -Name "*STATUS*.md" | ForEach-Object { Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue }
Get-ChildItem -Path "." -Name "*COMPLETE*.md" | ForEach-Object { Move-Item $_ "docs\reports\2025\07-july\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving screenshots..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.png" | ForEach-Object { Move-Item $_ "testing\screenshots\archive\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving test scripts..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "test-*" | ForEach-Object { Move-Item $_ "scripts\testing\" -Force -ErrorAction SilentlyContinue }
Get-ChildItem -Path "." -Name "check-*" | ForEach-Object { Move-Item $_ "scripts\debug\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving database files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.sql" | ForEach-Object { Move-Item $_ "database\migrations\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving spec files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.spec.ts" | ForEach-Object { Move-Item $_ "testing\e2e\" -Force -ErrorAction SilentlyContinue }

Write-Host "Moving HTML files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Name "*.html" | Where-Object { $_.Name -ne "index.html" } | ForEach-Object { Move-Item $_ "testing\manual\" -Force -ErrorAction SilentlyContinue }

Write-Host "CLEANUP COMPLETED!" -ForegroundColor Green
Write-Host "Files moved to organized structure" -ForegroundColor Cyan

# Show current root directory
Write-Host "`nCurrent root directory files:" -ForegroundColor Cyan
Get-ChildItem -Path "." -File | Select-Object Name | Format-Table -AutoSize
