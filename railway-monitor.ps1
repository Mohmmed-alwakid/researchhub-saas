# Railway Deployment Monitor
# Continuously monitors Railway deployment status

$url = "https://afakar-production.up.railway.app"
$maxAttempts = 20
$delaySeconds = 15

Write-Host "🔄 Monitoring Railway deployment..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Yellow
Write-Host "Will check every $delaySeconds seconds for $maxAttempts attempts" -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le $maxAttempts; $i++) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Attempt $i/$maxAttempts..." -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "🎉 SUCCESS! Railway deployment is working!" -ForegroundColor Green
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response Preview:" -ForegroundColor Green
        Write-Host $response.Content.Substring(0, [Math]::Min(300, $response.Content.Length)) -ForegroundColor White
        
        # Test health endpoint
        try {
            $healthResponse = Invoke-WebRequest -Uri "$url/health" -TimeoutSec 5
            Write-Host "✅ Health check also working: $($healthResponse.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Health check failed but main endpoint works" -ForegroundColor Yellow
        }
        
        break
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*404*") {
            Write-Host "   ❌ 404 Not Found - Deployment not ready yet" -ForegroundColor Red
        } elseif ($errorMsg -like "*500*") {
            Write-Host "   ⚠️  500 Server Error - App deployed but has runtime issues" -ForegroundColor Yellow
        } elseif ($errorMsg -like "*timeout*") {
            Write-Host "   ⏱️  Timeout - Server may be starting up" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Error: $errorMsg" -ForegroundColor Red
        }
        
        if ($i -eq $maxAttempts) {
            Write-Host ""
            Write-Host "🚨 Deployment monitoring failed after $maxAttempts attempts" -ForegroundColor Red
            Write-Host "🔧 Possible issues:" -ForegroundColor Yellow
            Write-Host "   1. Railway build is failing" -ForegroundColor White
            Write-Host "   2. Start command is incorrect" -ForegroundColor White
            Write-Host "   3. Railway service configuration issues" -ForegroundColor White
            Write-Host ""
            Write-Host "📋 Next steps:" -ForegroundColor Cyan
            Write-Host "   1. Check Railway dashboard for build/deploy logs" -ForegroundColor White
            Write-Host "   2. Verify railway.toml configuration" -ForegroundColor White
            Write-Host "   3. Check Railway project settings" -ForegroundColor White
        } else {
            Write-Host "   ⏳ Waiting $delaySeconds seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds $delaySeconds
        }
    }
}

Write-Host ""
Write-Host "🔗 Railway Dashboard: https://railway.app/" -ForegroundColor Blue
Write-Host "📊 Monitor deployment progress in Railway console" -ForegroundColor Gray
