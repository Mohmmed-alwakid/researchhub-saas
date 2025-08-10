# Test the simple study creation endpoint
Write-Host "Testing simple study creation endpoint..." -ForegroundColor Yellow

$authBody = @{
    email = "abwanwr77+researcher@gmail.com"
    password = "Testtest123"
} | ConvertTo-Json

# First authenticate
$authResult = Invoke-RestMethod -Uri "http://localhost:3003/api/auth-consolidated?action=login" -Method POST -Body $authBody -ContentType "application/json"

if ($authResult.success) {
    $token = $authResult.session.access_token
    Write-Host "✅ Auth successful" -ForegroundColor Green
    
    # Test simple study creation
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $studyData = @{
        title = "Simple Test Study"
        description = "Testing simple endpoint"
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3003/api/test-create-study" -Method POST -Headers $headers -Body $studyData
        Write-Host "✅ Simple study creation successful!" -ForegroundColor Green
        Write-Host "Study: $($result | ConvertTo-Json -Compress)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Simple study creation failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
}
