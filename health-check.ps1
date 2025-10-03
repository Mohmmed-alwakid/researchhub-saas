#!/usr/bin/env pwsh
# ResearchHub Quick Health Check
# Run this before and after making changes

Write-Host ""
Write-Host "🏥 ResearchHub Health Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Production API
Write-Host "1️⃣  Testing Production API..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app/api/health" -UseBasicParsing -TimeoutSec 10
    if ($health.StatusCode -eq 200) {
        Write-Host "   ✅ Production API is healthy" -ForegroundColor Green
        $score = 1
    }
} catch {
    Write-Host "   ❌ Production API failed: $($_.Exception.Message)" -ForegroundColor Red
    $score = 0
}

# Test 2: Production Site Loads
Write-Host ""
Write-Host "2️⃣  Testing Production Site..." -ForegroundColor Yellow
try {
    $site = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app" -UseBasicParsing -TimeoutSec 10
    if ($site.StatusCode -eq 200) {
        Write-Host "   ✅ Production site loads" -ForegroundColor Green
        $score += 1
    }
} catch {
    Write-Host "   ❌ Production site failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check for obvious errors in main files
Write-Host ""
Write-Host "3️⃣  Checking Project Structure..." -ForegroundColor Yellow

$criticalFiles = @(
    "src/App.tsx",
    "src/main.tsx",
    "api/health.js",
    "package.json",
    "vite.config.ts"
)

$missingFiles = @()
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
        $score += 0.5
    } else {
        Write-Host "   ❌ $file is missing!" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Test 4: Check node_modules
Write-Host ""
Write-Host "4️⃣  Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
    $score += 1
} else {
    Write-Host "   ❌ node_modules missing - Run: npm install" -ForegroundColor Red
}

# Test 5: Git status
Write-Host ""
Write-Host "5️⃣  Checking Git Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $changedFiles = ($gitStatus | Measure-Object).Count
        if ($changedFiles -eq 0) {
            Write-Host "   ✅ No uncommitted changes (clean state)" -ForegroundColor Green
            $score += 1
        } elseif ($changedFiles -lt 10) {
            Write-Host "   ⚠️  $changedFiles files changed (manageable)" -ForegroundColor Yellow
            $score += 0.5
        } else {
            Write-Host "   ⚠️  $changedFiles files changed (consider committing)" -ForegroundColor Yellow
            $score += 0.3
        }
    }
} catch {
    Write-Host "   ⚠️  Git check skipped" -ForegroundColor Yellow
}

# Calculate health score
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Health Score: $score / 5.5" -ForegroundColor Cyan

if ($score -ge 4.5) {
    Write-Host "🟢 STATUS: EXCELLENT - Safe to develop!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Your project is in great shape" -ForegroundColor Green
    Write-Host "✅ You can safely make changes" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Next: npm run dev:fullstack" -ForegroundColor Cyan
} elseif ($score -ge 3) {
    Write-Host "🟡 STATUS: GOOD - Minor issues, proceed with caution" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  Some minor issues detected" -ForegroundColor Yellow
    Write-Host "✅ You can develop, but test carefully" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Consider fixing issues first" -ForegroundColor Cyan
} else {
    Write-Host "🔴 STATUS: NEEDS ATTENTION - Fix issues before developing" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ Critical issues found" -ForegroundColor Red
    Write-Host "❌ Fix these before making changes" -ForegroundColor Red
    Write-Host ""
    if ($missingFiles.Count -gt 0) {
        Write-Host "Missing files:" -ForegroundColor Red
        $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
}

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  - Run this check before and after making changes" -ForegroundColor White
Write-Host "  - If score drops, undo your last change: git reset --hard HEAD" -ForegroundColor White
Write-Host "  - Keep score above 4.0 for safe development" -ForegroundColor White
Write-Host ""
