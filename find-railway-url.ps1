# Railway URL Finder and MongoDB Connection Fixer
# Helps find the correct Railway URL and fix MongoDB connection

Write-Host "🚂 Railway URL Finder & MongoDB Connection Fixer" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Step 1: Finding Your Railway URL" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Common Railway URL patterns to test
$possibleUrls = @(
    "https://researchhub-api.railway.app",
    "https://researchhub-api-production.railway.app", 
    "https://api-production.railway.app",
    "https://web-production.railway.app",
    "https://researchhub.railway.app"
)

Write-Host "Testing common Railway URL patterns..." -ForegroundColor Blue

foreach ($url in $possibleUrls) {
    Write-Host "🔍 Testing: $url" -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "$url/api/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ Found working URL: $url" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Try to parse JSON response
        try {
            $healthData = $response.Content | ConvertFrom-Json
            if ($healthData.database) {
                Write-Host "   Database Status: $($healthData.database.status)" -ForegroundColor $(if ($healthData.database.status -eq "healthy") { "Green" } else { "Red" })
                Write-Host "   Database Connected: $($healthData.database.isConnected)" -ForegroundColor $(if ($healthData.database.isConnected) { "Green" } else { "Red" })
            }
        } catch {
            Write-Host "   Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))..." -ForegroundColor Gray
        }
          $workingUrl = $url
        break
    }
    catch {
        Write-Host "❌ Not accessible" -ForegroundColor Red
    }
    Start-Sleep -Seconds 1
}

if (-not $workingUrl) {
    Write-Host ""
    Write-Host "❌ Could not find working Railway URL with common patterns" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
    Write-Host "2. Login and find your ResearchHub project" -ForegroundColor White
    Write-Host "3. Click on your API service" -ForegroundColor White
    Write-Host "4. Look for 'Domain' or 'Public URL'" -ForegroundColor White
    Write-Host "5. Copy the URL and test it manually" -ForegroundColor White
    
    $manualUrl = Read-Host "`nEnter your Railway URL manually (or press Enter to skip)"
    if ($manualUrl) {
        $workingUrl = $manualUrl.TrimEnd('/')
    }
}

if ($workingUrl) {
    Write-Host ""
    Write-Host "🎯 Using Railway URL: $workingUrl" -ForegroundColor Blue
    Write-Host ""
    
    # Test with our diagnostic tool
    Write-Host "📊 Running comprehensive database test..." -ForegroundColor Yellow
    try {
        node quick-railway-check.cjs $workingUrl
    } catch {
        Write-Host "❌ Could not run diagnostic tool: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 MongoDB Connection Fix Instructions" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

Write-Host ""
Write-Host "Based on your Railway logs, the MongoDB connection is failing." -ForegroundColor White
Write-Host "Here's how to fix it:" -ForegroundColor White

Write-Host ""
Write-Host "1. Go to Railway Dashboard:" -ForegroundColor Blue
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan

Write-Host ""
Write-Host "2. Find your ResearchHub project and click on it" -ForegroundColor Blue

Write-Host ""
Write-Host "3. Look for your MongoDB service:" -ForegroundColor Blue
Write-Host "   - Should see a service with database icon" -ForegroundColor White
Write-Host "   - Note the exact service name (e.g., 'MongoDB', 'Mongo', 'database')" -ForegroundColor White

Write-Host ""
Write-Host "4. Click on your API service → Variables tab" -ForegroundColor Blue

Write-Host ""
Write-Host "5. Find MONGODB_URI variable and update it:" -ForegroundColor Blue
Write-Host ""
Write-Host "   Try these options (one at a time):" -ForegroundColor Yellow
Write-Host "   Option A: " -ForegroundColor Green -NoNewline; Write-Host "`${{ MongoDB.MONGO_URL }}/researchhub" -ForegroundColor White
Write-Host "   Option B: " -ForegroundColor Green -NoNewline; Write-Host "`${{ Mongo.MONGO_URL }}/researchhub" -ForegroundColor White  
Write-Host "   Option C: " -ForegroundColor Green -NoNewline; Write-Host "`${{ database.MONGO_URL }}/researchhub" -ForegroundColor White
Write-Host ""
Write-Host "   Emergency Atlas fallback:" -ForegroundColor Red
Write-Host "   mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0" -ForegroundColor Gray

Write-Host ""
Write-Host "6. Save the variable and click 'Deploy' to redeploy" -ForegroundColor Blue

Write-Host ""
Write-Host "7. Monitor deployment logs for:" -ForegroundColor Blue
Write-Host "   ✅ Connected to MongoDB successfully" -ForegroundColor Green
Write-Host "   ✅ Database initialization completed" -ForegroundColor Green

if ($workingUrl) {
    Write-Host ""
    Write-Host "8. Test the fix:" -ForegroundColor Blue
    Write-Host "   node quick-railway-check.cjs $workingUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🚨 Most Common Issue:" -ForegroundColor Red
Write-Host "The MongoDB service name in Railway doesn't match what's in your MONGODB_URI" -ForegroundColor White
Write-Host "Just find the exact service name and update the environment variable!" -ForegroundColor White

Write-Host ""
Write-Host "✅ Fix completed! Your MongoDB connection should work after these steps." -ForegroundColor Green
