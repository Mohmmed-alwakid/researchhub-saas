# Phase 2: Target Existing Unused Components
Write-Host "Removing confirmed unused components..." -ForegroundColor Green

$backupDir = "archive\2025-07-12-cleanup\phase2-existing"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Target confirmed unused files that exist
$targetFiles = @(
    # Wallet duplicates (keep main wallet system)
    "src\client\components\wallet\OptimizedWalletComponents.tsx",
    "src\client\components\wallet\MobileWallet.tsx", 
    "src\client\components\wallet\WalletSkeletons.tsx",
    "src\client\components\wallet\EnhancedWithdrawalForm.tsx",
    "src\client\components\wallet\EnhancedTransactionHistory.tsx",
    
    # Performance monitoring (unused in production)
    "src\client\components\PerformanceMonitor.tsx",
    "src\client\components\performance\PerformanceReportModal.tsx",
    "src\client\components\performance\FloatingReportButton.tsx",
    
    # Payment features (unused)
    "src\client\components\payments\WithdrawalRequestForm.tsx",
    "src\client\components\payments\RealTimePaymentStatus.tsx", 
    "src\client\components\payments\PointPurchaseFlow.tsx",
    "src\client\components\payments\ConversionRateDisplay.tsx",
    
    # Template marketplace (not implemented)
    "src\client\components\templates\TemplateMarketplace.tsx",
    
    # UI system duplicates
    "src\client\components\ui\ConsolidatedDesignSystem.tsx",
    "src\client\components\ui\MobileOptimizedComponents.tsx",
    
    # Workspace features (not actively used)
    "src\client\components\workspace\WorkspaceSelector.tsx",
    "src\client\components\workspace\WorkspaceManager.tsx",
    "src\client\components\workspace\TeamMemberList.tsx",
    "src\client\components\workspace\InviteTeamMember.tsx",
    
    # Study creator experimental
    "src\client\components\study-creator\IntentCapture.tsx"
)

$removed = 0
foreach ($file in $targetFiles) {
    if (Test-Path $file) {
        try {
            $filename = Split-Path $file -Leaf
            Copy-Item $file "$backupDir\$filename" -Force
            Remove-Item $file -Force
            Write-Host "Removed: $file" -ForegroundColor Green
            $removed++
        }
        catch {
            Write-Host "Failed: $file" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Phase 2 Complete! Removed $removed files" -ForegroundColor Cyan
Write-Host "Total removed so far: $(15 + $removed) files" -ForegroundColor White
Write-Host "Backups: $backupDir" -ForegroundColor Yellow
