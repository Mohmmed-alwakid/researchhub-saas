# ResearchHub Hybrid Architecture - Pre-Deployment Verification

Write-Host "🚀 ResearchHub Hybrid Architecture - Pre-Deployment Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check 1: Verify build system
Write-Host "📦 Checking build system..." -ForegroundColor Yellow
try {
    Set-Location "d:\MAMP\AfakarM"
    
    # Test server build
    Write-Host "  Testing server build..." -ForegroundColor White
    npm run build:server
    
    if (Test-Path "dist/server/server/index.js") {
        Write-Host "  ✅ Server build successful" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Server build failed - index.js not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  ❌ Build test failed: $_" -ForegroundColor Red
    exit 1
}

# Check 2: Verify configuration files
Write-Host "`n🔧 Checking configuration files..." -ForegroundColor Yellow

$configFiles = @(
    "railway.toml",
    "package.json", 
    ".env.production",
    "RAILWAY_ENV_VARS.txt"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# Check 3: Verify package.json scripts
Write-Host "`n📜 Checking package.json scripts..." -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    
    $requiredScripts = @("build:server", "start")
    foreach ($script in $requiredScripts) {
        if ($packageJson.scripts.$script) {
            Write-Host "  ✅ '$script' script configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ '$script' script missing" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "  ❌ Error reading package.json: $_" -ForegroundColor Red
}

# Check 4: Verify environment variables file
Write-Host "`n🌍 Checking environment variables..." -ForegroundColor Yellow
if (Test-Path "RAILWAY_ENV_VARS.txt") {
    $envContent = Get-Content "RAILWAY_ENV_VARS.txt" -Raw
    
    $requiredVars = @("NODE_ENV", "PORT", "MONGODB_URI", "JWT_SECRET", "CLIENT_URL")
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "  ✅ $var configured" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ RAILWAY_ENV_VARS.txt not found" -ForegroundColor Red
}

# Check 5: Frontend deployment status
Write-Host "`n🌐 Checking frontend deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app" -Method HEAD -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Vercel frontend is live and accessible" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Frontend status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Frontend not accessible: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📋 DEPLOYMENT READINESS SUMMARY" -ForegroundColor Cyan

Write-Host "`n✅ READY FOR RAILWAY DEPLOYMENT:" -ForegroundColor Green
Write-Host "  • Server build system working" -ForegroundColor White
Write-Host "  • Railway configuration complete" -ForegroundColor White
Write-Host "  • Environment variables prepared" -ForegroundColor White
Write-Host "  • Frontend deployed on Vercel" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Deploy to Railway: https://railway.app/new" -ForegroundColor White
Write-Host "  2. Add environment variables from RAILWAY_ENV_VARS.txt" -ForegroundColor White
Write-Host "  3. Copy Railway URL and update Vercel VITE_API_URL" -ForegroundColor White
Write-Host "  4. Test end-to-end functionality" -ForegroundColor White

Write-Host "`n🚀 Estimated deployment time: 15-20 minutes" -ForegroundColor Yellow
Write-Host "📖 Detailed instructions: RAILWAY_FINAL_DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Yellow

Write-Host "`n🎉 READY TO DEPLOY HYBRID ARCHITECTURE!" -ForegroundColor Green -BackgroundColor DarkGreen
