# Quick API Test Script
Write-Host "🧪 Quick ResearchHub API Test" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3003/api/health" -TimeoutSec 5
    Write-Host "✅ Health: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Authentication
Write-Host "`n2. Testing Authentication..." -ForegroundColor Yellow
$authBody = @{
    email = "abwanwr77+researcher@gmail.com"
    password = "Testtest123"
} | ConvertTo-Json

try {
    $authResult = Invoke-RestMethod -Uri "http://localhost:3003/api/auth-consolidated?action=login" -Method POST -Body $authBody -ContentType "application/json" -TimeoutSec 10
    
    if ($authResult.success) {
        $token = $authResult.session.access_token
        Write-Host "✅ Auth successful. Token: $($token.Substring(0, 30))..." -ForegroundColor Green
        Write-Host "   User role: $($authResult.user.role)" -ForegroundColor Cyan
        
        # Test 3: Studies API with token
        Write-Host "`n3. Testing Studies API..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        try {
            $studies = Invoke-RestMethod -Uri "http://localhost:3003/api/research-consolidated?action=get-studies" -Headers $headers -TimeoutSec 10
            Write-Host "✅ Studies API working. Count: $($studies.data.Count)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Studies API failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        # Test 4: Create Study
        Write-Host "`n4. Testing Create Study..." -ForegroundColor Yellow
        $studyData = @{
            title = "Debug Test Study $(Get-Date -Format 'HHmmss')"
            description = "Test study from PowerShell debug script"
            participantLimit = 5
            compensation = 25
            blocks = @()
            status = "active"
        } | ConvertTo-Json -Depth 3
        
        try {
            $createResult = Invoke-RestMethod -Uri "http://localhost:3003/api/studies?action=create-study" -Method POST -Headers $headers -Body $studyData -TimeoutSec 10
            Write-Host "✅ Study created successfully! ID: $($createResult.study.id)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Create study failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Authentication failed: $($authResult.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Authentication error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test completed!" -ForegroundColor Green
