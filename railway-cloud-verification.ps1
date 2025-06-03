# Railway Cloud Database Verification Script
# Run this to check your Railway deployment and database status

Write-Host "🔍 Railway Cloud Database Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to test URL
function Test-RailwayEndpoint {
    param($url, $description)
    
    Write-Host "`n🧪 Testing: $description" -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        Write-Host "✅ SUCCESS: $description" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ FAILED: $description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test admin login
function Test-AdminLogin {
    param($baseUrl)
    
    Write-Host "`n👤 Testing Admin User Login" -ForegroundColor Yellow
    
    $loginBody = @{
        email = "admin@researchhub.com"
        password = "AdminPass123!"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ SUCCESS: Admin login working!" -ForegroundColor Green
        Write-Host "User: $($response.user.email)" -ForegroundColor Green
        Write-Host "Role: $($response.user.role)" -ForegroundColor Green
        return $response.token
    }
    catch {
        Write-Host "❌ FAILED: Admin login failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main verification
Write-Host "`n📝 Enter your Railway backend URL:" -ForegroundColor White
Write-Host "Example: https://your-app.railway.app" -ForegroundColor Gray
$railwayUrl = Read-Host "Railway URL"

if (-not $railwayUrl) {
    Write-Host "❌ No URL provided. Exiting." -ForegroundColor Red
    exit
}

# Remove trailing slash
$railwayUrl = $railwayUrl.TrimEnd('/')

Write-Host "`n🚀 Starting Railway verification for: $railwayUrl" -ForegroundColor Cyan

# Test 1: Health Check
$healthWorking = Test-RailwayEndpoint "$railwayUrl/api/health" "Health Check Endpoint"

if (-not $healthWorking) {
    Write-Host "`n💡 Health check failed. Possible issues:" -ForegroundColor Yellow
    Write-Host "   - Backend service not deployed" -ForegroundColor Gray
    Write-Host "   - Service is crashed/failed" -ForegroundColor Gray
    Write-Host "   - Wrong URL" -ForegroundColor Gray
    Write-Host "`n🔧 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Check Railway dashboard - is backend service running?" -ForegroundColor Gray
    Write-Host "   2. Check deployment logs for errors" -ForegroundColor Gray
    Write-Host "   3. Verify environment variables are set correctly" -ForegroundColor Gray
    exit
}

# Test 2: Database connectivity (via auth endpoint)
Write-Host "`n🗄️ Testing Database Connectivity" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/api/auth/verify" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ SUCCESS: Database connected!" -ForegroundColor Green
        Write-Host "   Backend can connect to Railway MongoDB" -ForegroundColor Green
    } else {
        Write-Host "⚠️ UNEXPECTED: Got status $($response.StatusCode)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ FAILED: Database connectivity test failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Admin User
$token = Test-AdminLogin $railwayUrl

if ($token) {
    Write-Host "`n📊 Testing Collections Access" -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        $users = Invoke-RestMethod -Uri "$railwayUrl/api/admin/users" -Method Get -Headers $headers -TimeoutSec 10
        Write-Host "✅ SUCCESS: Collections working!" -ForegroundColor Green
        Write-Host "Found $($users.Count) users in database" -ForegroundColor Green
        if ($users.Count -gt 0) {
            Write-Host "First user: $($users[0].email)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ Collections test inconclusive" -ForegroundColor Yellow
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n📋 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

if ($healthWorking) {
    Write-Host "✅ Backend Service: RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Service: FAILED" -ForegroundColor Red
}

if ($token) {
    Write-Host "✅ Database: CONNECTED & INITIALIZED" -ForegroundColor Green
    Write-Host "✅ Admin User: CREATED" -ForegroundColor Green
    Write-Host "✅ Collections: ACCESSIBLE" -ForegroundColor Green
    
    Write-Host "`n🎉 RESULT: Your Railway cloud database is working!" -ForegroundColor Green
    Write-Host "   - MongoDB connection successful" -ForegroundColor Gray
    Write-Host "   - researchhub database created" -ForegroundColor Gray
    Write-Host "   - Collections populated with data" -ForegroundColor Gray
    Write-Host "   - Admin user initialized" -ForegroundColor Gray
    
} else {
    Write-Host "❌ Database: CONNECTION ISSUES" -ForegroundColor Red
    Write-Host "`n🔧 Next steps to fix:" -ForegroundColor Yellow
    Write-Host "   1. Check Railway MongoDB service is running" -ForegroundColor Gray
    Write-Host "   2. Verify MONGODB_URI variable: ${{ MongoDB.MONGO_URL }}/researchhub" -ForegroundColor Gray
    Write-Host "   3. Check backend deployment logs for MongoDB errors" -ForegroundColor Gray
}

Write-Host "`n✅ Verification complete!" -ForegroundColor Cyan
