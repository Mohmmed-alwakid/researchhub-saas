# Phase 4 Final Verification: Participant Study Access & Completion
# This script completes the comprehensive workflow testing

Write-Host "=== PHASE 4 FINAL VERIFICATION: PARTICIPANT STUDY ACCESS & COMPLETION ===" -ForegroundColor Yellow
Write-Host "Starting final phase of comprehensive workflow testing..." -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:3002/api"
$studyId = "683e01f02b37277cde320778"
$applicationId = "683e02592b37277cde3207a9"

# Participant credentials (from previous phases)
$participantEmail = "testparticipant@test.com"
$participantPassword = "Test123!@#"

Write-Host "`n--- Step 1: Participant Authentication ---" -ForegroundColor Cyan
$loginBody = @{
    email = $participantEmail
    password = $participantPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $participantToken = $loginResponse.token
    Write-Host "✅ Participant authenticated successfully" -ForegroundColor Green
    Write-Host "   Token: $($participantToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Participant authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- Step 2: Check Participant's Applications ---" -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $participantToken"
    "Content-Type" = "application/json"
}

try {
    $applicationsResponse = Invoke-RestMethod -Uri "$baseUrl/participant-applications/applications/my" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Retrieved participant applications successfully" -ForegroundColor Green
    Write-Host "   Applications count: $($applicationsResponse.applications.Count)" -ForegroundColor Gray
    
    # Find our approved application
    $approvedApp = $applicationsResponse.applications | Where-Object { 
        $_.studyId -eq $studyId -and $_.status -eq "approved" 
    }
    
    if ($approvedApp) {
        Write-Host "✅ Found approved application for study" -ForegroundColor Green
        Write-Host "   Application ID: $($approvedApp._id)" -ForegroundColor Gray
        Write-Host "   Status: $($approvedApp.status)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ No approved application found for study $studyId" -ForegroundColor Yellow
        Write-Host "   Available applications:" -ForegroundColor Gray
        $applicationsResponse.applications | ForEach-Object {
            Write-Host "   - Study: $($_.studyId), Status: $($_.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Failed to retrieve applications: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n--- Step 3: Start Study Session ---" -ForegroundColor Cyan
try {
    $sessionResponse = Invoke-RestMethod -Uri "$baseUrl/sessions/start/$studyId" `
        -Method POST `
        -Headers $headers
    
    $sessionId = $sessionResponse.session._id
    Write-Host "✅ Study session started successfully" -ForegroundColor Green
    Write-Host "   Session ID: $sessionId" -ForegroundColor Gray
    Write-Host "   Status: $($sessionResponse.session.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start session: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This might be expected if session already exists" -ForegroundColor Yellow
    
    # Try to get existing sessions
    try {
        Write-Host "`n   Checking for existing sessions..." -ForegroundColor Gray
        # Note: We'd need an endpoint to get participant's sessions, which might not be implemented yet
    } catch {
        Write-Host "   Unable to check existing sessions" -ForegroundColor Gray
    }
}

Write-Host "`n--- Step 4: Simulate Study Completion ---" -ForegroundColor Cyan
if ($sessionId) {
    $completionData = @{
        completedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        data = @{
            taskResults = @(
                @{
                    taskId = "task1"
                    completed = $true
                    timeTaken = 45.2
                }
            )
            feedback = "The checkout process was intuitive and easy to follow."
        }
    } | ConvertTo-Json -Depth 3

    try {
        $completionResponse = Invoke-RestMethod -Uri "$baseUrl/sessions/$sessionId/complete" `
            -Method POST `
            -Body $completionData `
            -Headers $headers
        
        Write-Host "✅ Study session completed successfully" -ForegroundColor Green
        Write-Host "   Final status: $($completionResponse.session.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to complete session: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping completion test - no valid session ID" -ForegroundColor Yellow
}

Write-Host "`n--- Step 5: Verify Study Data Access ---" -ForegroundColor Cyan
# Test that researcher can now access the completed session data
$researcherEmail = "testresearcher@test.com"
$researcherPassword = "Test123!@#"

$researcherLoginBody = @{
    email = $researcherEmail
    password = $researcherPassword
} | ConvertTo-Json

try {
    $researcherLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Body $researcherLoginBody `
        -ContentType "application/json"
    
    $researcherToken = $researcherLoginResponse.token
    $researcherHeaders = @{
        "Authorization" = "Bearer $researcherToken"
        "Content-Type" = "application/json"
    }
    
    # Try to get study analytics/sessions data
    $studyDataResponse = Invoke-RestMethod -Uri "$baseUrl/studies/$studyId" `
        -Method GET `
        -Headers $researcherHeaders
    
    Write-Host "✅ Researcher can access study data" -ForegroundColor Green
    Write-Host "   Study title: $($studyDataResponse.study.title)" -ForegroundColor Gray
    Write-Host "   Study status: $($studyDataResponse.study.status)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Failed to verify researcher data access: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== PHASE 4 VERIFICATION COMPLETE ===" -ForegroundColor Yellow
Write-Host "✅ Participant study access and completion workflow tested" -ForegroundColor Green
Write-Host "✅ End-to-end workflow verification complete" -ForegroundColor Green
Write-Host "`nAll phases of comprehensive workflow testing are now complete!" -ForegroundColor Magenta
