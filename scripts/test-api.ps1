# ResearchHub API Testing Script
# Usage: .\scripts\test-api.ps1

Write-Host "🧪 ResearchHub API Testing Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if server is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "Health check result: $($health | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Server is not running on localhost:3003" -ForegroundColor Red
    Write-Host "Please run: npm run dev:fullstack" -ForegroundColor Yellow
    exit 1
}

# Test authentication endpoint
Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Blue
try {
    $authTest = @{
        email = "abwanwr77+researcher@gmail.com"
        password = "Testtest123"
    } | ConvertTo-Json

    $authResult = Invoke-RestMethod -Uri "http://localhost:3003/api/auth-consolidated?action=login" -Method POST -Body $authTest -ContentType "application/json"
    Write-Host "✅ Authentication working" -ForegroundColor Green
    
    if ($authResult.success -eq $true) {
        $token = $authResult.data.token
        Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Cyan
        
        # Test authenticated endpoint
        Write-Host "`n📊 Testing Studies Endpoint..." -ForegroundColor Blue
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $studies = Invoke-RestMethod -Uri "http://localhost:3003/api/research-consolidated?action=get-studies" -Headers $headers
        Write-Host "✅ Studies endpoint working" -ForegroundColor Green
        Write-Host "Studies found: $($studies.data.Count)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Testing complete!" -ForegroundColor Green
