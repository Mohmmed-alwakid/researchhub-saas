Write-Host "🚀 Quick Railway URL Test" -ForegroundColor Cyan
Write-Host ""

$TestUrls = @(
    "https://researchhub-backend-production.up.railway.app",
    "https://afakar-production.up.railway.app", 
    "https://researchhub-saas-production.up.railway.app",
    "https://web-production-4c53.up.railway.app"
)

foreach ($Url in $TestUrls) {
    Write-Host "Testing: $Url" -ForegroundColor Yellow
    
    try {
        $Response = Invoke-WebRequest -Uri "$Url/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ SUCCESS: Health check returned $($Response.StatusCode)" -ForegroundColor Green
        Write-Host "  📡 LIVE URL FOUND: $Url" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Railway deployment is LIVE!" -ForegroundColor Green
        break
    }
    catch {
        Write-Host "  ❌ Not accessible" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔗 Railway Dashboard: https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b" -ForegroundColor Cyan
