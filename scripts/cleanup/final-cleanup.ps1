# Final Cleanup Phase
Write-Host "Running final cleanup phase..." -ForegroundColor Green

$backupDir = "archive\2025-07-12-cleanup\final-phase"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Final target files
$finalTargets = @(
    "src\client\pages\journey\CreativeJourneyPage.tsx",
    "src\client\pages\studies\EnhancedParticipantDashboard.tsx",
    "src\client\pages\studies\EnhancedStudyResponsesPage.tsx",
    "src\client\pages\payments\ManualPaymentPage.tsx",
    "src\client\pages\templates\PublishTemplatePage.tsx",
    "src\client\hooks\useEnhancedAuth.ts"
)

$removed = 0
foreach ($file in $finalTargets) {
    if (Test-Path $file) {
        $filename = Split-Path $file -Leaf
        Copy-Item $file "$backupDir\$filename" -Force -ErrorAction SilentlyContinue
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "Removed: $file" -ForegroundColor Green
        $removed++
    }
}

$totalRemoved = 49 + $removed
Write-Host ""
Write-Host "COMPREHENSIVE CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "Total files removed: $totalRemoved" -ForegroundColor Cyan
Write-Host "Project is now clean and organized!" -ForegroundColor White
