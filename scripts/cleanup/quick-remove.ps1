# Quick Component Removal Script
Write-Host "Removing unused components..." -ForegroundColor Green

# Create safety backup directory
$backupDir = "archive\2025-07-12-cleanup\component-backups"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Target files for removal (most obviously unused)
$removeList = @(
    "src\client\components\admin\AdminTesting.tsx",
    "src\client\components\demo\CollaborationAPIDemo.tsx", 
    "src\client\components\demo\CollaborativeApprovalDemo.tsx",
    "src\client\components\collaboration\CollaborationSidebar.tsx",
    "src\client\components\testing\AuthIntegrationTest.tsx",
    "src\client\components\ui\AccessibleComponents-Fixed.tsx",
    "src\client\components\ui\ConsolidatedComponents.tsx",
    "src\client\components\ui\UnifiedComponents.tsx",
    "src\client\components\ui\ValidationFeedback.tsx",
    "src\client\components\recording\ScreenRecorder.tsx",
    "src\client\hooks\mobile.ts",
    "src\client\hooks\useWallet.ts",
    "src\client\services\userInteractionTracker.js",
    "src\shared\dev-tools\DevToolsManager.ts",
    "src\shared\dev-tools\ReactDevHooks.ts"
)

$removed = 0
foreach ($file in $removeList) {
    if (Test-Path $file) {
        try {
            # Backup first
            $filename = Split-Path $file -Leaf
            Copy-Item $file "$backupDir\$filename" -Force
            
            # Remove
            Remove-Item $file -Force
            Write-Host "Removed: $file" -ForegroundColor Green
            $removed++
        }
        catch {
            Write-Host "Failed to remove: $file" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Cleanup complete! Removed $removed files" -ForegroundColor Cyan
Write-Host "Backups saved to: $backupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Run 'npm run dev:fullstack' to test!" -ForegroundColor White
