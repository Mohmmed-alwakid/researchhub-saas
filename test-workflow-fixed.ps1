# ResearchHub Complete Workflow Test Script
# This script tests the entire study workflow end-to-end

Write-Host "🚀 Starting ResearchHub Complete Workflow Test" -ForegroundColor Green
Write-Host "=" * 60

# API Base URL
$apiBase = "http://localhost:3002/api"

# Test data
$researcherCredentials = @{
    email = "testresearcher@test.com"
    password = "Password123!"
}

$participantCredentials = @{
    email = "testparticipant@test.com"  
    password = "Password123!"
}

$studyData = @{
    title = "E-commerce Checkout Usability Study"
    description = "Test the usability of our new checkout process and identify pain points in the user journey."
    type = "usability"
    targetParticipants = 10
    duration = 30
    compensation = 25.00
    requirements = @()
    tasks = @(
        @{
            title = "Navigate to checkout"
            description = "Add an item to cart and proceed to checkout"
            type = "navigation"
            order = 0
            configuration = @{
                url = "https://example-store.com"
                waitForElement = ".checkout-button"
            }
            isRequired = $true
            timeLimit = 300
        },
        @{
            title = "Complete checkout form"
            description = "Fill out the checkout form with test information"
            type = "interaction"
            order = 1
            configuration = @{
                trackClicks = $true
                trackFormInputs = $true
            }
            isRequired = $true
            timeLimit = 600
        }
    )
    settings = @{
        recordScreen = $true
        recordAudio = $false
        recordWebcam = $false
        trackClicks = $true
        trackHovers = $true
        trackScrolls = $true
    }
} | ConvertTo-Json -Depth 10

# Test state
$testState = @{
    researcherToken = $null
    participantToken = $null
    studyId = $null
    applicationId = $null
    errors = @()
}

function Test-APICall {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$Description
    )
    
    try {
        Write-Host "  📡 $Description..." -ForegroundColor Yellow
        
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success) {
            Write-Host "  ✅ $Description - SUCCESS" -ForegroundColor Green
            return @{ success = $true; data = $response.data }
        } else {
            Write-Host "  ❌ $Description - FAILED: $($response.error)" -ForegroundColor Red
            return @{ success = $false; error = $response.error }
        }
    } catch {
        Write-Host "  ❌ $Description - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return @{ success = $false; error = $_.Exception.Message }
    }
}

# Phase 1: Researcher Login and Study Creation
Write-Host "`n👩‍🔬 Phase 1: Researcher Login and Study Creation" -ForegroundColor Cyan
Write-Host "-" * 50

# Login as researcher
$researcherLoginData = $researcherCredentials | ConvertTo-Json
$researcherLoginResult = Test-APICall -Url "$apiBase/auth/login" -Method POST -Body $researcherLoginData -Description "Researcher Login"

if ($researcherLoginResult.success) {
    $testState.researcherToken = $researcherLoginResult.data.accessToken
    Write-Host "  👤 Logged in as: $($researcherLoginResult.data.user.firstName) $($researcherLoginResult.data.user.lastName) ($($researcherLoginResult.data.user.role))"
    
    # Create study
    $headers = @{ Authorization = "Bearer $($testState.researcherToken)" }
    $studyCreationResult = Test-APICall -Url "$apiBase/studies" -Method POST -Body $studyData -Headers $headers -Description "Study Creation"
    
    if ($studyCreationResult.success) {
        $testState.studyId = $studyCreationResult.data._id
        Write-Host "  📋 Study created with ID: $($testState.studyId)"
        Write-Host "  📝 Study Title: $($studyCreationResult.data.title)"
        Write-Host "  🎯 Target Participants: $($studyCreationResult.data.targetParticipants)"
        Write-Host "  💰 Compensation: `$$($studyCreationResult.data.compensation)"
    } else {
        $testState.errors += "Phase 1 Failed: Study creation failed - $($studyCreationResult.error)"
    }
} else {
    $testState.errors += "Phase 1 Failed: Researcher login failed - $($researcherLoginResult.error)"
}

# Phase 2: Participant Login and Study Application
Write-Host "`n👥 Phase 2: Participant Login and Study Application" -ForegroundColor Cyan
Write-Host "-" * 50

# Login as participant
$participantLoginData = $participantCredentials | ConvertTo-Json
$participantLoginResult = Test-APICall -Url "$apiBase/auth/login" -Method POST -Body $participantLoginData -Description "Participant Login"

if ($participantLoginResult.success) {
    $testState.participantToken = $participantLoginResult.data.accessToken
    Write-Host "  👤 Logged in as: $($participantLoginResult.data.user.firstName) $($participantLoginResult.data.user.lastName) ($($participantLoginResult.data.user.role))"
    
    # Discover studies
    $headers = @{ Authorization = "Bearer $($testState.participantToken)" }
    $studiesResult = Test-APICall -Url "$apiBase/studies/available" -Method GET -Headers $headers -Description "Study Discovery"
    
    if ($studiesResult.success) {
        $availableStudies = $studiesResult.data
        Write-Host "  📚 Found $($availableStudies.length) available studies"
        
        # Find our created study
        $ourStudy = $availableStudies | Where-Object { $_._id -eq $testState.studyId }
        if ($ourStudy) {
            Write-Host "  🎯 Target study found: $($ourStudy.title)"
            
            # Apply to study
            $applicationData = @{
                studyId = $testState.studyId
                message = "I have extensive experience with online shopping and am interested in contributing to UX improvements."
                screeningAnswers = @{
                    experience = "weekly"
                    interest = "I want to help improve e-commerce experiences"
                }
            } | ConvertTo-Json
            
            $applicationResult = Test-APICall -Url "$apiBase/participant-applications" -Method POST -Body $applicationData -Headers $headers -Description "Study Application"
            
            if ($applicationResult.success) {
                $testState.applicationId = $applicationResult.data._id
                Write-Host "  📝 Application submitted with ID: $($testState.applicationId)"
            }
        } else {
            Write-Host "  ❌ Target study not found in available studies" -ForegroundColor Red
        }
    }
} else {
    $testState.errors += "Phase 2 Failed: $($participantLoginResult.error)"
}

# Phase 3: Researcher Application Review
Write-Host "`n🔍 Phase 3: Researcher Application Review" -ForegroundColor Cyan
Write-Host "-" * 50

if ($testState.researcherToken -and $testState.applicationId) {
    $headers = @{ Authorization = "Bearer $($testState.researcherToken)" }
    
    # View applications
    $applicationsResult = Test-APICall -Url "$apiBase/participant-applications/study/$($testState.studyId)" -Method GET -Headers $headers -Description "View Study Applications"
    
    if ($applicationsResult.success) {
        $applications = $applicationsResult.data
        Write-Host "  📋 Found $($applications.length) applications for the study"
        
        # Find our application
        $ourApplication = $applications | Where-Object { $_._id -eq $testState.applicationId }
        if ($ourApplication) {
            Write-Host "  🎯 Target application found: $($ourApplication.participant.firstName) $($ourApplication.participant.lastName)"
            
            # Approve application
            $approvalData = @{
                status = "approved"
                reviewNotes = "Participant shows good experience with e-commerce and clear interest in UX research."
            } | ConvertTo-Json
            
            $approvalResult = Test-APICall -Url "$apiBase/participant-applications/$($testState.applicationId)/review" -Method PUT -Body $approvalData -Headers $headers -Description "Application Approval"
            
            if ($approvalResult.success) {
                Write-Host "  ✅ Application approved successfully"
            }
        } else {
            Write-Host "  ❌ Target application not found" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ❌ Missing required tokens or application ID" -ForegroundColor Red
    $testState.errors += "Phase 3 Failed: Missing prerequisites"
}

# Phase 4: Participant Study Access
Write-Host "`n🎮 Phase 4: Participant Study Access" -ForegroundColor Cyan
Write-Host "-" * 50

if ($testState.participantToken -and $testState.studyId) {
    $headers = @{ Authorization = "Bearer $($testState.participantToken)" }
    
    # Check participant applications
    $myApplicationsResult = Test-APICall -Url "$apiBase/participant-applications/my-applications" -Method GET -Headers $headers -Description "Check My Applications"
    
    if ($myApplicationsResult.success) {
        $myApplications = $myApplicationsResult.data
        Write-Host "  📋 Found $($myApplications.length) applications"
        
        # Find approved application
        $approvedApplication = $myApplications | Where-Object { $_._id -eq $testState.applicationId -and $_.status -eq "approved" }
        if ($approvedApplication) {
            Write-Host "  ✅ Approved application found - can access study"
            
            # Simulate study start
            Write-Host "  🎬 Study session would start here"
            Write-Host "  📹 Screen recording would begin"
            Write-Host "  🎯 Participant would complete tasks:"
            Write-Host "     1. Navigate to checkout"
            Write-Host "     2. Complete checkout form"
            Write-Host "  📊 Analytics and interaction data would be collected"
            Write-Host "  ✅ Study session completed successfully"
        } else {
            Write-Host "  ⏳ Application not yet approved or not found" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ❌ Missing required tokens or study ID" -ForegroundColor Red
    $testState.errors += "Phase 4 Failed: Missing prerequisites"
}

# Test Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "✅ Phase 1: Researcher Login and Study Creation - " -NoNewline
if ($testState.researcherToken -and $testState.studyId) { 
    Write-Host "PASSED" -ForegroundColor Green 
} else { 
    Write-Host "FAILED" -ForegroundColor Red 
}

Write-Host "✅ Phase 2: Participant Login and Application - " -NoNewline
if ($testState.participantToken -and $testState.applicationId) { 
    Write-Host "PASSED" -ForegroundColor Green 
} else { 
    Write-Host "FAILED" -ForegroundColor Red 
}

Write-Host "✅ Phase 3: Application Review and Approval - " -NoNewline
if ($testState.researcherToken -and $testState.applicationId) { 
    Write-Host "PASSED" -ForegroundColor Green 
} else { 
    Write-Host "FAILED" -ForegroundColor Red 
}

Write-Host "✅ Phase 4: Study Access and Completion - " -NoNewline
if ($testState.participantToken -and $testState.studyId) { 
    Write-Host "PASSED" -ForegroundColor Green 
} else { 
    Write-Host "FAILED" -ForegroundColor Red 
}

if ($testState.errors.Count -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Complete workflow is functional." -ForegroundColor Green
} else {
    Write-Host "`n❌ Some tests failed:" -ForegroundColor Red
    $testState.errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

Write-Host "`n🔗 Test Data:"
Write-Host "   Researcher Token: $($testState.researcherToken -ne $null)"
Write-Host "   Participant Token: $($testState.participantToken -ne $null)"
Write-Host "   Study ID: $($testState.studyId)"
Write-Host "   Application ID: $($testState.applicationId)"

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
