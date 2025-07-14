# Phase 2 Component Cleanup - Aggressive Unused File Removal
Write-Host "🗑️ Phase 2: Aggressive Component Cleanup" -ForegroundColor Green

# Create backup directory for this phase
$backupDir = "archive\2025-07-12-cleanup\phase2-removal"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# More aggressive list of unused components (UI duplicates, old systems)
$phase2RemovalList = @(
    # Multiple UI system duplicates - keep only the main one
    "src\client\components\ui\AdvancedComponents.tsx",
    "src\client\components\ui\ComponentsV2.tsx", 
    "src\client\components\ui\DesignSystemComponents.tsx",
    "src\client\components\ui\EnhancedUIComponents.tsx",
    "src\client\components\ui\ModernComponents.tsx",
    "src\client\components\ui\OptimizedComponents.tsx",
    "src\client\components\ui\ProfessionalComponents.tsx",
    "src\client\components\ui\ResponsiveComponents.tsx",
    "src\client\components\ui\UILibrary.tsx",
    
    # Duplicate auth components
    "src\client\components\auth\AuthenticationFlow.tsx",
    "src\client\components\auth\AuthModal.tsx", 
    "src\client\components\auth\AuthenticationWrapper.tsx",
    "src\client\components\auth\EnhancedAuthFlow.tsx",
    "src\client\components\auth\LoginForm.tsx",
    "src\client\components\auth\RegistrationForm.tsx",
    
    # Old dashboard variations
    "src\client\components\dashboard\AdvancedDashboard.tsx",
    "src\client\components\dashboard\DashboardV2.tsx",
    "src\client\components\dashboard\EnhancedDashboard.tsx", 
    "src\client\components\dashboard\LegacyDashboard.tsx",
    "src\client\components\dashboard\ModernDashboard.tsx",
    "src\client\components\dashboard\OptimizedDashboard.tsx",
    "src\client\components\dashboard\ResearcherDashboardV2.tsx",
    
    # Multiple form system duplicates
    "src\client\components\forms\AdvancedFormComponents.tsx",
    "src\client\components\forms\DynamicFormBuilder.tsx",
    "src\client\components\forms\EnhancedFormFields.tsx",
    "src\client\components\forms\FormComponentsV2.tsx",
    "src\client\components\forms\ModernFormFields.tsx",
    "src\client\components\forms\OptimizedFormComponents.tsx",
    
    # Payment system duplicates
    "src\client\components\payments\AdvancedPaymentFlow.tsx",
    "src\client\components\payments\EnhancedPaymentSystem.tsx",
    "src\client\components\payments\ModernPaymentComponents.tsx",
    "src\client\components\payments\PaymentFlowV2.tsx",
    "src\client\components\payments\PaymentSystemV2.tsx",
    
    # Study builder variations (keep main one)
    "src\client\components\studies\AdvancedStudyBuilder.tsx",
    "src\client\components\studies\EnhancedStudyBuilder.tsx",
    "src\client\components\studies\ModernStudyBuilder.tsx", 
    "src\client\components\studies\OptimizedStudyBuilder.tsx",
    "src\client\components\studies\StudyBuilderV2.tsx",
    "src\client\components\studies\StudyCreationV2.tsx",
    
    # Template system duplicates
    "src\client\components\templates\AdvancedTemplateSystem.tsx",
    "src\client\components\templates\EnhancedTemplateBuilder.tsx",
    "src\client\components\templates\ModernTemplateComponents.tsx",
    "src\client\components\templates\TemplateBuilderV2.tsx",
    "src\client\components\templates\TemplateSystemV2.tsx",
    
    # Unused mobile components
    "src\client\components\mobile\MobileComponents.tsx",
    "src\client\components\mobile\MobileOptimizations.tsx",
    "src\client\components\mobile\ResponsiveMobile.tsx",
    
    # Analytics duplicates
    "src\client\components\analytics\AdvancedAnalytics.tsx",
    "src\client\components\analytics\AnalyticsV2.tsx",
    "src\client\components\analytics\EnhancedAnalytics.tsx",
    "src\client\components\analytics\ModernAnalytics.tsx",
    
    # Notification system duplicates
    "src\client\components\notifications\AdvancedNotifications.tsx",
    "src\client\components\notifications\EnhancedNotifications.tsx", 
    "src\client\components\notifications\NotificationSystemV2.tsx",
    
    # Settings duplicates
    "src\client\components\settings\AdvancedSettings.tsx",
    "src\client\components\settings\EnhancedSettings.tsx",
    "src\client\components\settings\ModernSettings.tsx",
    "src\client\components\settings\SettingsV2.tsx",
    
    # Shared service duplicates
    "src\shared\services\api\APIServiceV2.ts",
    "src\shared\services\api\EnhancedAPIService.ts",
    "src\shared\services\api\ModernAPIService.ts",
    "src\shared\services\auth\AuthServiceV2.ts",
    "src\shared\services\auth\EnhancedAuthService.ts",
    "src\shared\services\data\DataServiceV2.ts",
    "src\shared\services\data\EnhancedDataService.ts",
    
    # Old utility files
    "src\shared\utils\utilsV2.ts",
    "src\shared\utils\enhancedUtils.ts",
    "src\shared\utils\modernUtils.ts",
    "src\shared\utils\legacyUtils.ts",
    
    # Test utilities (not production)
    "src\shared\testing\testUtils.ts",
    "src\shared\testing\mockData.ts",
    "src\shared\testing\testHelpers.ts"
)

$removed = 0
$notFound = 0

Write-Host "🎯 Targeting $(($phase2RemovalList).Count) files for removal..." -ForegroundColor Cyan

foreach ($file in $phase2RemovalList) {
    if (Test-Path $file) {
        try {
            # Create backup
            $filename = Split-Path $file -Leaf
            $timestamp = Get-Date -Format "HHmmss"
            Copy-Item $file "$backupDir\$timestamp-$filename" -Force
            
            # Remove file
            Remove-Item $file -Force
            Write-Host "✅ Removed: $file" -ForegroundColor Green
            $removed++
        }
        catch {
            Write-Host "⚠️ Failed to remove: $file" -ForegroundColor Yellow
        }
    } else {
        $notFound++
    }
}

# Remove empty directories
Write-Host "`n📁 Cleaning empty directories..." -ForegroundColor Cyan
$dirsToCheck = @(
    "src\client\components\mobile",
    "src\shared\testing"
)

$dirsRemoved = 0
foreach ($dir in $dirsToCheck) {
    if ((Test-Path $dir) -and ((Get-ChildItem $dir -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0)) {
        try {
            Remove-Item $dir -Force -ErrorAction SilentlyContinue
            Write-Host "📁 Removed empty: $dir" -ForegroundColor Cyan
            $dirsRemoved++
        }
        catch {
            # Ignore errors for directory removal
        }
    }
}

# Create summary
Write-Host "`n🎉 Phase 2 Cleanup Complete!" -ForegroundColor Green
Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "   ✅ Files Removed: $removed" -ForegroundColor White
Write-Host "   ⏭️ Files Not Found: $notFound" -ForegroundColor Gray
Write-Host "   📁 Directories Cleaned: $dirsRemoved" -ForegroundColor White
Write-Host "`n💾 Backups saved to: $backupDir" -ForegroundColor Yellow

# Estimate impact
$estimatedReduction = $removed * 5 # Assume average 5KB per component
Write-Host "`n📈 Estimated Impact:" -ForegroundColor Cyan
Write-Host "   💾 Code Reduction: ~$estimatedReduction KB" -ForegroundColor White
Write-Host "   🚀 Bundle Size: Reduced import tree" -ForegroundColor White
Write-Host "   🧹 Maintainability: Fewer duplicate files" -ForegroundColor White

Write-Host "`n🧪 Next: Test with 'npm run dev:fullstack'" -ForegroundColor Yellow
