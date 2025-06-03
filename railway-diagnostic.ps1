# Railway Deployment Diagnostic Script
# Comprehensive check for Railway deployment issues

Write-Host "🔍 Railway Deployment Diagnostic Tool" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$railwayUrl = "https://afakar-production.up.railway.app"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "🕐 Diagnostic started at: $timestamp" -ForegroundColor Yellow
Write-Host "🌐 Testing Railway URL: $railwayUrl" -ForegroundColor Yellow
Write-Host ""

# Test multiple endpoints
$endpoints = @(
    "/",
    "/health", 
    "/api/health",
    "/api",
    "/test"
)

$results = @()

foreach ($endpoint in $endpoints) {
    $fullUrl = "$railwayUrl$endpoint"
    Write-Host "🧪 Testing: $fullUrl" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -TimeoutSec 15 -ErrorAction Stop
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   📄 Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
        
        $contentPreview = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
        Write-Host "   📝 Content: $contentPreview..." -ForegroundColor Gray
        
        $results += @{
            Endpoint = $endpoint
            Status = "Success"
            StatusCode = $response.StatusCode
            ContentType = $response.Headers['Content-Type']
        }
    }
    catch {
        $statusCode = "N/A"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   📊 Status Code: $statusCode" -ForegroundColor Red
        
        $results += @{
            Endpoint = $endpoint
            Status = "Failed"
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "📊 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Status -eq "Success" }).Count
$totalCount = $results.Count

Write-Host "✅ Successful endpoints: $successCount/$totalCount" -ForegroundColor Green

if ($successCount -eq 0) {
    Write-Host ""
    Write-Host "🚨 CRITICAL: All endpoints failed!" -ForegroundColor Red
    Write-Host "🔧 Possible issues:" -ForegroundColor Yellow
    Write-Host "   1. Railway build failed" -ForegroundColor Yellow
    Write-Host "   2. Server not starting properly" -ForegroundColor Yellow
    Write-Host "   3. Wrong start command in railway.toml" -ForegroundColor Yellow
    Write-Host "   4. Port binding issues" -ForegroundColor Yellow
    Write-Host "   5. Environment variables missing" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Check Railway deployment logs" -ForegroundColor White
    Write-Host "   2. Verify railway.toml configuration" -ForegroundColor White
    Write-Host "   3. Test with simple server (railway-test-server.js)" -ForegroundColor White
} elseif ($successCount -lt $totalCount) {
    Write-Host ""
    Write-Host "⚠️  PARTIAL: Some endpoints working" -ForegroundColor Yellow
    Write-Host "🔧 Check API routing configuration" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🎉 SUCCESS: All endpoints responding!" -ForegroundColor Green
    Write-Host "✅ Railway deployment is working correctly" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔗 Railway Dashboard: https://railway.app/project/afakar" -ForegroundColor Blue
Write-Host "📋 Check deployment logs for detailed error information" -ForegroundColor Gray
