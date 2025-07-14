# Phase 3: Shared Services Cleanup
Write-Host "Phase 3: Cleaning shared services and testing files..." -ForegroundColor Green

$backupDir = "archive\2025-07-12-cleanup\phase3-shared"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Target unused shared testing files (development only)
$testingFiles = @(
    "src\shared\testing\UnitTestFramework.ts",
    "src\shared\testing\TestSuiteBuilder.ts", 
    "src\shared\testing\TestReporting.ts",
    "src\shared\testing\QualityGatesManager.ts",
    "src\shared\testing\PerformanceSecurityTester.ts",
    "src\shared\testing\IntegrationTestSuite.ts",
    "src\shared\testing\E2ETestFramework.ts",
    "src\shared\testing\AdvancedTestRunner.ts"
)

# Target unused performance monitoring (not in production)
$performanceFiles = @(
    "src\shared\performance\PerformanceUtils.ts",
    "src\shared\performance\PerformanceMonitor.ts", 
    "src\shared\performance\PerformanceIntegration.ts"
)

# Target unused dev tools
$devToolFiles = @(
    "src\shared\dev-tools\ResearchHubDebugger.ts",
    "src\shared\dev-tools\index.ts"
)

# AI services not currently used
$aiFiles = @(
    "src\shared\services\aiInsightsEngine.ts"
)

$allTargets = $testingFiles + $performanceFiles + $devToolFiles + $aiFiles
$removed = 0

foreach ($file in $allTargets) {
    if (Test-Path $file) {
        try {
            $filename = Split-Path $file -Leaf
            $subfolder = Split-Path (Split-Path $file -Parent) -Leaf
            $backupPath = "$backupDir\$subfolder-$filename"
            Copy-Item $file $backupPath -Force
            Remove-Item $file -Force
            Write-Host "Removed: $file" -ForegroundColor Green
            $removed++
        }
        catch {
            Write-Host "Failed: $file" -ForegroundColor Yellow
        }
    }
}

# Clean up empty directories
$emptyDirs = @(
    "src\shared\testing",
    "src\shared\performance", 
    "src\shared\dev-tools"
)

$dirsRemoved = 0
foreach ($dir in $emptyDirs) {
    if ((Test-Path $dir) -and ((Get-ChildItem $dir -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0)) {
        try {
            Remove-Item $dir -Force -ErrorAction SilentlyContinue
            Write-Host "Removed empty directory: $dir" -ForegroundColor Cyan
            $dirsRemoved++
        }
        catch {
            # Ignore directory removal errors
        }
    }
}

Write-Host ""
Write-Host "Phase 3 Complete! Removed $removed files and $dirsRemoved directories" -ForegroundColor Cyan
Write-Host "Total removed so far: $(35 + $removed) files" -ForegroundColor White
Write-Host "Backups: $backupDir" -ForegroundColor Yellow
