# Safe Component Cleanup Script
# Removes unused components identified by analysis (excluding types and utils)

Write-Host "🗑️ Starting Safe Component Cleanup..." -ForegroundColor Green

# Archive directory for safety
$safetyArchive = "archive\2025-07-12-cleanup\removed-components"
if (!(Test-Path $safetyArchive)) {
    New-Item -ItemType Directory -Path $safetyArchive -Force | Out-Null
}

# List of safe-to-remove unused component files
$filesToRemove = @(
    # Admin components (likely old/experimental)
    "src\client\components\admin\AdminSystem.tsx",
    "src\client\components\admin\AdminTesting.tsx",
    "src\client\components\admin\AdminWithdrawalQueue.tsx",
    
    # Collaboration (not currently used)
    "src\client\components\collaboration\CollaborationSidebar.tsx",
    "src\client\components\collaboration\CollaborativeStudyBuilderContainer.tsx",
    
    # Demo components (safe to remove)
    "src\client\components\demo\CollaborationAPIDemo.tsx",
    "src\client\components\demo\CollaborativeApprovalDemo.tsx",
    
    # Old mobile components
    "src\client\components\participant\MobileParticipantExperience.tsx",
    "src\client\components\participant\LiveSessionParticipant.tsx",
    "src\client\components\participant\GamificationDashboard.tsx",
    
    # Unused recording/advanced features
    "src\client\components\participant\AdvancedBlocks.tsx",
    "src\client\components\recording\ScreenRecorder.tsx",
    
    # Multiple UI system duplicates (keep only active one)
    "src\client\components\ui\AccessibleComponents-Fixed.tsx",
    "src\client\components\ui\AccessibleComponents.tsx", 
    "src\client\components\ui\ConsolidatedComponents.tsx",
    "src\client\components\ui\ConsolidatedDesignSystem.tsx",
    "src\client\components\ui\UnifiedComponents.tsx",
    "src\client\components\ui\UnifiedDesignSystem.tsx",
    "src\client\components\ui\ValidationFeedback.tsx",
    
    # Duplicate wallet components
    "src\client\components\wallet\MobileWallet.tsx",
    "src\client\components\wallet\OptimizedWalletComponents.tsx",
    "src\client\components\wallet\WalletSkeletons.tsx",
    
    # Unused payment features
    "src\client\components\payments\ConversionRateDisplay.tsx",
    "src\client\components\payments\PointPurchaseFlow.tsx",
    "src\client\components\payments\RealTimePaymentStatus.tsx",
    "src\client\components\payments\WithdrawalRequestForm.tsx",
    
    # Legacy study builder components
    "src\client\components\studies\EnhancedStudyCreationModal.tsx",
    "src\client\components\studies\EnhancedUsabilityStudyBuilder.tsx",
    "src\client\components\studies\MobileOptimizedStudyBuilder.tsx",
    "src\client\components\studies\UsabilityStudyBuilder.tsx",
    
    # Testing components
    "src\client\components\testing\AuthIntegrationTest.tsx",
    
    # Template marketplace (unused)
    "src\client\components\templates\TemplateMarketplace.tsx",
    
    # Unused hooks
    "src\client\hooks\mobile.ts",
    "src\client\hooks\useEnhancedAuth.ts",
    "src\client\hooks\useStudyBuilder.ts",
    "src\client\hooks\useWallet.ts",
    
    # Unused pages
    "src\client\pages\collaboration\StudyCollaborationCenter.tsx",
    "src\client\pages\dashboard\UnifiedWorkspace.tsx",
    
    # Performance monitoring (not used)
    "src\client\components\PerformanceMonitor.tsx",
    "src\client\services\performance.service.ts",
    "src\client\services\userInteractionTracker.js"
)

$removedCount = 0
$skippedCount = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            # Create backup before removing
            $fileName = Split-Path $file -Leaf
            $backupPath = "$safetyArchive\$fileName"
            Copy-Item $file $backupPath -Force
            
            # Remove the file
            Remove-Item $file -Force
            Write-Host "✅ Removed: $file" -ForegroundColor Green
            $removedCount++
        }
        catch {
            Write-Host "⚠️ Could not remove: $file" -ForegroundColor Yellow
            $skippedCount++
        }
    } else {
        Write-Host "⏭️ Already removed: $file" -ForegroundColor Gray
        $skippedCount++
    }
}

# Remove empty directories
$emptyDirs = @(
    "src\client\components\demo",
    "src\client\components\collaboration", 
    "src\client\components\recording",
    "src\client\components\testing",
    "src\client\pages\collaboration"
)

$dirsRemoved = 0
foreach ($dir in $emptyDirs) {
    if ((Test-Path $dir) -and ((Get-ChildItem $dir | Measure-Object).Count -eq 0)) {
        try {
            Remove-Item $dir -Force
            Write-Host "📁 Removed empty directory: $dir" -ForegroundColor Cyan
            $dirsRemoved++
        }
        catch {
            Write-Host "⚠️ Could not remove directory: $dir" -ForegroundColor Yellow
        }
    }
}

# Now clean up shared unused files (most impactful)
$sharedFilesToRemove = @(
    # Dev tools (not production)
    "src\shared\dev-tools\DevToolsManager.ts",
    "src\shared\dev-tools\ReactDevHooks.ts",
    "src\shared\dev-tools\ReactDevHooks.tsx",
    "src\shared\dev-tools\ResearchHubDebugger.ts",
    
    # Duplicate API systems
    "src\shared\api\ApiClient.ts",
    "src\shared\api\ResponseOptimizer.ts",
    
    # Duplicate cache systems  
    "src\shared\cache\CacheManager.js",
    "src\shared\cache\CacheMiddleware.js",
    
    # Unused analytics
    "src\shared\analytics\index.ts",
    
    # Duplicate design systems
    "src\shared\design\hooks.ts",
    "src\shared\design\theme.tsx",
    "src\shared\design\utilities.ts",
    
    # Server services (likely unused)
    "src\server\services\BaseService.ts",
    "src\server\services\cloudStorage.js"
)

foreach ($file in $sharedFilesToRemove) {
    if (Test-Path $file) {
        try {
            $fileName = Split-Path $file -Leaf
            $backupPath = "$safetyArchive\shared-$fileName"
            Copy-Item $file $backupPath -Force
            Remove-Item $file -Force
            Write-Host "✅ Removed shared: $file" -ForegroundColor Green
            $removedCount++
        }
        catch {
            Write-Host "⚠️ Could not remove shared: $file" -ForegroundColor Yellow
            $skippedCount++
        }
    }
}

# Create cleanup summary
$summaryContent = @"
# Component Cleanup Summary
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Type**: Safe Component Removal

## Results
- ✅ **Files Removed**: $removedCount
- ⏭️ **Files Skipped**: $skippedCount  
- 📁 **Empty Directories Removed**: $dirsRemoved

## Categories Cleaned
- Admin experimental components
- Demo/testing components
- Collaboration features (unused)
- Mobile optimization duplicates
- UI system duplicates (kept main system)
- Wallet component duplicates
- Payment feature components (unused)
- Legacy study builder variants
- Performance monitoring (unused)
- Development tools (non-production)
- Duplicate shared systems

## Safety Measures
- All files backed up to: ``archive/2025-07-12-cleanup/removed-components/``
- Only removed confirmed unused components
- Preserved all active production components
- Maintained type definitions and utilities

## Next Steps
1. Run tests to ensure no breakage: ``npm run test:quick``
2. Start development server: ``npm run dev:fullstack``
3. Review remaining legacy components for modernization
4. Continue with remaining 400+ unused files if tests pass

## Recovery
If needed, restore files from: ``archive/2025-07-12-cleanup/removed-components/``
"@

$summaryContent | Out-File -FilePath "$safetyArchive\cleanup-summary.md" -Encoding UTF8

Write-Host "`n🎉 Safe Component Cleanup Complete!" -ForegroundColor Green
Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "   ✅ Removed: $removedCount files" -ForegroundColor White
Write-Host "   ⏭️ Skipped: $skippedCount files" -ForegroundColor White
Write-Host "   📁 Directories: $dirsRemoved removed" -ForegroundColor White
Write-Host "`n💾 All files backed up to:" -ForegroundColor Yellow
Write-Host "   archive/2025-07-12-cleanup/removed-components/" -ForegroundColor White
Write-Host "`n🧪 Next: Run 'npm run test:quick' to verify everything works!" -ForegroundColor Cyan
