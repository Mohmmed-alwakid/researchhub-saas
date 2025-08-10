# Simple Auth Test
Write-Host "Testing auth endpoint directly..." -ForegroundColor Yellow

$uri = "http://localhost:3003/api/auth-consolidated?action=login"
$body = '{"email":"abwanwr77+researcher@gmail.com","password":"Testtest123"}'

Write-Host "URI: $uri" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
