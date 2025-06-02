# Phase 3: Researcher Application Review Testing

Write-Host "🚀 Phase 3: Testing Researcher Application Review" -ForegroundColor Green

$apiBase = "http://localhost:3002/api"
$studyId = "683e01f02b37277cde320778"

# Step 1: Login as researcher
Write-Host "`n1. Logging in as researcher..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = "testresearcher@test.com"
        password = "Password123!"
    } | ConvertTo-Json

    $loginResult = Invoke-RestMethod -Uri "$apiBase/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $researcherToken = $loginResult.data.accessToken
    $headers = @{ Authorization = "Bearer $researcherToken" }
    Write-Host "✅ Researcher login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Researcher login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get applications for study
Write-Host "`n2. Retrieving applications for study $studyId..." -ForegroundColor Cyan
try {
    $applications = Invoke-RestMethod -Uri "$apiBase/participant-applications/studies/$studyId/applications" -Method GET -Headers $headers
    Write-Host "✅ Applications retrieved successfully" -ForegroundColor Green
    Write-Host "Total applications: $($applications.data.applications.Count)" -ForegroundColor Yellow
    
    if ($applications.data.applications.Count -gt 0) {
        foreach ($app in $applications.data.applications) {
            Write-Host "  - Application ID: $($app._id)" -ForegroundColor White
            Write-Host "    Status: $($app.status)" -ForegroundColor White
            Write-Host "    Applied: $($app.appliedAt)" -ForegroundColor White
            Write-Host "    Participant: $($app.participantId.email)" -ForegroundColor White
            Write-Host "" 
        }
    } else {
        Write-Host "No applications found for this study" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to retrieve applications: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Step 3: If applications exist, test review process
if ($applications -and $applications.data.applications.Count -gt 0) {
    $firstApp = $applications.data.applications[0]
    if ($firstApp.status -eq "pending") {
        Write-Host "`n3. Testing application review (approve)..." -ForegroundColor Cyan
        try {
            $reviewBody = @{
                action = "approve"
                notes = "Approved via automated testing"
            } | ConvertTo-Json

            $reviewResult = Invoke-RestMethod -Uri "$apiBase/participant-applications/applications/$($firstApp._id)/review" -Method PATCH -Body $reviewBody -ContentType "application/json" -Headers $headers
            Write-Host "✅ Application review successful" -ForegroundColor Green
            Write-Host "New status: $($reviewResult.data.status)" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Application review failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n3. Application already reviewed (status: $($firstApp.status))" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n3. No applications to review" -ForegroundColor Yellow
}

Write-Host "`n🎉 Phase 3 testing completed!" -ForegroundColor Green
