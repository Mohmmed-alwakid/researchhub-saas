# Simple Workflow Test
Write-Host "🚀 Starting Simple Workflow Test" -ForegroundColor Green

$apiBase = "http://localhost:3002/api"

# Test 1: Researcher Login
Write-Host "`n1. Testing Researcher Login..." -ForegroundColor Cyan
$researcherCredentials = @{
    email = "testresearcher@test.com"
    password = "Password123!"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "$apiBase/auth/login" -Method POST -Body $researcherCredentials -ContentType "application/json"
    Write-Host "✅ Researcher login successful" -ForegroundColor Green
    $researcherToken = $loginResult.data.accessToken
    Write-Host "Token received: $($researcherToken.Substring(0,20))..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Researcher login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Study Creation
Write-Host "`n2. Testing Study Creation..." -ForegroundColor Cyan
$headers = @{ Authorization = "Bearer $researcherToken" }
$studyData = @{
    title = "Test Study $(Get-Date -Format 'HHmmss')"
    description = "Automated test study"
    type = "usability"
    targetParticipants = 5
    duration = 30
    compensation = 25.00
} | ConvertTo-Json

try {
    $studyResult = Invoke-RestMethod -Uri "$apiBase/studies" -Method POST -Body $studyData -ContentType "application/json" -Headers $headers
    Write-Host "✅ Study creation successful" -ForegroundColor Green
    $studyId = $studyResult.data._id
    Write-Host "Study ID: $studyId" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Study creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Participant Login
Write-Host "`n3. Testing Participant Login..." -ForegroundColor Cyan
$participantCredentials = @{
    email = "testparticipant@test.com"
    password = "Password123!"
} | ConvertTo-Json

try {
    $participantLoginResult = Invoke-RestMethod -Uri "$apiBase/auth/login" -Method POST -Body $participantCredentials -ContentType "application/json"
    Write-Host "✅ Participant login successful" -ForegroundColor Green
    $participantToken = $participantLoginResult.data.accessToken
    Write-Host "Token received: $($participantToken.Substring(0,20))..." -ForegroundColor Yellow
} catch {
    Write-Host "❌ Participant login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Study Discovery
Write-Host "`n4. Testing Study Discovery..." -ForegroundColor Cyan
$participantHeaders = @{ Authorization = "Bearer $participantToken" }

try {
    $studiesResult = Invoke-RestMethod -Uri "$apiBase/studies/available" -Method GET -Headers $participantHeaders
    Write-Host "✅ Study discovery successful" -ForegroundColor Green
    Write-Host "Found $($studiesResult.data.Count) available studies" -ForegroundColor Yellow
    
    # Find our study
    $ourStudy = $studiesResult.data | Where-Object { $_._id -eq $studyId }
    if ($ourStudy) {
        Write-Host "✅ Our test study found in available studies" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Our test study not found in available studies" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Study discovery failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Workflow test completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor White
Write-Host "- Researcher Token: $(if($researcherToken) {'✅'} else {'❌'})" -ForegroundColor Gray
Write-Host "- Study ID: $(if($studyId) {'✅'} else {'❌'})" -ForegroundColor Gray  
Write-Host "- Participant Token: $(if($participantToken) {'✅'} else {'❌'})" -ForegroundColor Gray
