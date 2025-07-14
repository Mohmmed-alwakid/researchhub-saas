# Phase 2 Component Cleanup
Write-Host "Phase 2: Removing duplicate components..." -ForegroundColor Green

# Create backup
$backupDir = "archive\2025-07-12-cleanup\phase2-backups"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# UI system duplicates to remove
$uiDuplicates = @(
    "src\client\components\ui\AdvancedComponents.tsx",
    "src\client\components\ui\ComponentsV2.tsx",
    "src\client\components\ui\DesignSystemComponents.tsx", 
    "src\client\components\ui\EnhancedUIComponents.tsx",
    "src\client\components\ui\ModernComponents.tsx",
    "src\client\components\ui\OptimizedComponents.tsx",
    "src\client\components\ui\ProfessionalComponents.tsx",
    "src\client\components\ui\ResponsiveComponents.tsx",
    "src\client\components\ui\UILibrary.tsx"
)

$removed = 0
foreach ($file in $uiDuplicates) {
    if (Test-Path $file) {
        $filename = Split-Path $file -Leaf
        Copy-Item $file "$backupDir\$filename" -Force -ErrorAction SilentlyContinue
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $file" -ForegroundColor Green
        $removed++
    }
}

# Dashboard duplicates
$dashboardDuplicates = @(
    "src\client\components\dashboard\AdvancedDashboard.tsx",
    "src\client\components\dashboard\DashboardV2.tsx",
    "src\client\components\dashboard\EnhancedDashboard.tsx",
    "src\client\components\dashboard\LegacyDashboard.tsx",
    "src\client\components\dashboard\ModernDashboard.tsx"
)

foreach ($file in $dashboardDuplicates) {
    if (Test-Path $file) {
        $filename = Split-Path $file -Leaf
        Copy-Item $file "$backupDir\$filename" -Force -ErrorAction SilentlyContinue
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $file" -ForegroundColor Green
        $removed++
    }
}

# Auth duplicates  
$authDuplicates = @(
    "src\client\components\auth\AuthenticationFlow.tsx",
    "src\client\components\auth\AuthModal.tsx",
    "src\client\components\auth\EnhancedAuthFlow.tsx"
)

foreach ($file in $authDuplicates) {
    if (Test-Path $file) {
        $filename = Split-Path $file -Leaf
        Copy-Item $file "$backupDir\$filename" -Force -ErrorAction SilentlyContinue
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $file" -ForegroundColor Green
        $removed++
    }
}

Write-Host ""
Write-Host "Phase 2 complete! Removed $removed duplicate files" -ForegroundColor Cyan
Write-Host "Backups in: $backupDir" -ForegroundColor Yellow
