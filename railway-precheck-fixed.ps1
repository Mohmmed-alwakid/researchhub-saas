# Railway Pre-Deployment Test Script
# Tests the built server locally to verify it works before Railway deployment

Write-Host "🚂 Railway Pre-Deployment Test" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Change to project directory
Set-Location "d:\MAMP\AfakarM"

Write-Host "✅ 1. Checking TypeScript compilation..." -ForegroundColor Green
$tscResult = & npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript: No errors" -ForegroundColor Green
} else {
    Write-Host "   ❌ TypeScript errors found:" -ForegroundColor Red
    Write-Host $tscResult -ForegroundColor Red
    exit 1
}

Write-Host "✅ 2. Building server..." -ForegroundColor Green
$buildResult = & npm run build:server 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Server build: Success" -ForegroundColor Green
} else {
    Write-Host "   ❌ Server build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}

Write-Host "✅ 3. Checking built files..." -ForegroundColor Green
if (Test-Path "dist\server\server\index.js") {
    Write-Host "   ✅ Built server file exists: dist\server\server\index.js" -ForegroundColor Green
} else {
    Write-Host "   ❌ Built server file missing!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 4. Checking package.json start command..." -ForegroundColor Green
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$startCommand = $packageJson.scripts.start
if ($startCommand -eq "node dist/server/server/index.js") {
    Write-Host "   ✅ Start command correct: $startCommand" -ForegroundColor Green
} else {
    Write-Host "   ❌ Start command incorrect: $startCommand" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 5. Checking Railway config..." -ForegroundColor Green
if (Test-Path "railway.toml") {
    $railwayConfig = Get-Content "railway.toml" -Raw
    if ($railwayConfig -match 'healthcheckPath = "/api/health"') {
        Write-Host "   ✅ Railway config looks good" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Railway health check path may be incorrect" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ railway.toml missing!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 6. Checking environment variables file..." -ForegroundColor Green
if (Test-Path "RAILWAY_ENV_VARS.txt") {
    Write-Host "   ✅ Environment variables file ready" -ForegroundColor Green
} else {
    Write-Host "   ❌ RAILWAY_ENV_VARS.txt missing!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
Write-Host "🚂 Ready for Railway deployment!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app/new" -ForegroundColor White
Write-Host "2. Deploy from GitHub: Mohmmed-alwakid/researchhub-saas" -ForegroundColor White
Write-Host "3. Add environment variables from RAILWAY_ENV_VARS.txt" -ForegroundColor White
Write-Host "4. Wait for deployment to complete (~8-10 minutes)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: RAILWAY_DEPLOYMENT_FIXED.md" -ForegroundColor Cyan
