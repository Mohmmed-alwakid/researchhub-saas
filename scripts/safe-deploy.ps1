# AUTOMATED DEPLOYMENT PREVENTION SYSTEM (PowerShell)
# Prevents broken API deployments by checking critical components

Write-Host "🔍 Pre-deployment API Health Check..." -ForegroundColor Cyan

# Check if environment variables are set
Write-Host "📋 Checking environment variables..." -ForegroundColor White

$envVarsOk = $true

# Check local environment files
if (Test-Path ".env.production.local") {
    Write-Host "✅ .env.production.local found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.production.local not found" -ForegroundColor Yellow
}

# Check critical API files exist
Write-Host "📁 Checking API files..." -ForegroundColor White

$apiFilesOk = $true

if (Test-Path "api/research-consolidated.js") {
    Write-Host "✅ research-consolidated.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ research-consolidated.js missing" -ForegroundColor Red
    $apiFilesOk = $false
}

if (Test-Path "api/health.js") {
    Write-Host "✅ health.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ health.js missing" -ForegroundColor Red
    $apiFilesOk = $false
}

# Check package.json has required dependencies
Write-Host "📦 Checking dependencies..." -ForegroundColor White

$packageContent = Get-Content "package.json" -Raw
if ($packageContent -like "*@supabase/supabase-js*") {
    Write-Host "✅ Supabase dependency found" -ForegroundColor Green
} else {
    Write-Host "❌ @supabase/supabase-js not in dependencies" -ForegroundColor Red
    Write-Host "Run: npm install @supabase/supabase-js" -ForegroundColor Yellow
    $apiFilesOk = $false
}

# Check syntax of critical API files
Write-Host "🔧 Checking API syntax..." -ForegroundColor White

try {
    node -c "api/research-consolidated.js" 2>$null
    Write-Host "✅ research-consolidated.js syntax OK" -ForegroundColor Green
} catch {
    Write-Host "❌ research-consolidated.js syntax error" -ForegroundColor Red
    node -c "api/research-consolidated.js"
    $apiFilesOk = $false
}

if (-not $apiFilesOk) {
    Write-Host ""
    Write-Host "🛑 DEPLOYMENT BLOCKED - Fix errors above first!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "🎉 All checks passed! Safe to deploy." -ForegroundColor Green
Write-Host ""

# Ask user confirmation
$confirmation = Read-Host "🚀 Deploy to production? (y/N)"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
    
    # Deploy to Vercel
    vercel --prod --yes
    
    Write-Host ""
    Write-Host "🔍 Post-deployment health check..." -ForegroundColor Cyan
    
    # Wait a moment for deployment to be ready
    Start-Sleep -Seconds 10
    
    # Check if API is responding
    try {
        $response = Invoke-RestMethod -Uri "https://researchhub-saas.vercel.app/api/health" -Method GET -TimeoutSec 10
        Write-Host "✅ API health check passed" -ForegroundColor Green
    } catch {
        Write-Host "❌ API health check failed" -ForegroundColor Red
        Write-Host "🔧 Check deployment logs and environment variables" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎉 Deployment successful and verified!" -ForegroundColor Green
} else {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
}
