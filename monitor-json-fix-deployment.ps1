Write-Host "🚀 Railway Deployment Monitor - Post JSON Fix" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

$ProjectUrl = "https://railway.app/project/95c09b83-e303-4e20-9906-524cce66fc3b"

Write-Host "📋 Monitoring Railway Deployment After JSON Fix" -ForegroundColor Yellow
Write-Host "🔗 Dashboard: $ProjectUrl" -ForegroundColor Cyan
Write-Host ""

# Test common Railway URL patterns
$TestUrls = @(
    "https://researchhub-backend-production.up.railway.app",
    "https://researchhub-saas-production.up.railway.app", 
    "https://afakar-production.up.railway.app",
    "https://web-production-4c53.up.railway.app"
)

$HealthEndpoints = @("/health", "/api/health")

Write-Host "🔍 Testing Railway URLs..." -ForegroundColor Yellow
Write-Host ""

$DeploymentFound = $false

foreach ($BaseUrl in $TestUrls) {
    Write-Host "🌐 Testing: " -NoNewline -ForegroundColor White
    Write-Host $BaseUrl -ForegroundColor Cyan
    
    foreach ($Endpoint in $HealthEndpoints) {
        $FullUrl = "$BaseUrl$Endpoint"
        
        try {
            $Response = Invoke-WebRequest -Uri $FullUrl -Method GET -TimeoutSec 8 -ErrorAction Stop
            
            if ($Response.StatusCode -eq 200) {
                Write-Host "   ✅ SUCCESS: $Endpoint (200 OK)" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎉 RAILWAY DEPLOYMENT IS LIVE!" -ForegroundColor Green
                Write-Host "📡 Backend URL: $BaseUrl" -ForegroundColor Green
                Write-Host "🏥 Health Check: $FullUrl" -ForegroundColor Green
                Write-Host ""
                Write-Host "🔄 NEXT STEPS:" -ForegroundColor Yellow
                Write-Host "   1. Update Vercel frontend with this backend URL" -ForegroundColor White
                Write-Host "   2. Test frontend-backend integration" -ForegroundColor White
                Write-Host "   3. Verify full-stack functionality" -ForegroundColor White
                
                $DeploymentFound = $true
                break
            }
        }
        catch {
            Write-Host "   ❌ $Endpoint not ready" -ForegroundColor Red
        }
    }
    
    if ($DeploymentFound) { break }
    Write-Host ""
}

if (-not $DeploymentFound) {
    Write-Host "⏳ Deployment not live yet. This could mean:" -ForegroundColor Yellow
    Write-Host "   1. Build still in progress (check dashboard)" -ForegroundColor White
    Write-Host "   2. Different Railway URL than tested" -ForegroundColor White
    Write-Host "   3. Another issue needs resolution" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ JSON fix has been applied - deployment should succeed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔗 Monitor at: $ProjectUrl" -ForegroundColor Cyan
