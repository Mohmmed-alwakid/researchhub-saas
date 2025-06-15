# Railway MongoDB Connection Fixer
Write-Host "Railway MongoDB Connection Fixer" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "From your Railway logs, the MongoDB connection is failing:" -ForegroundColor Yellow
Write-Host "Error: connect ECONNREFUSED researchhub-mongodb.railway.internal:27017" -ForegroundColor Red

Write-Host ""
Write-Host "SOLUTION: Update your MONGODB_URI environment variable" -ForegroundColor Green

Write-Host ""
Write-Host "Step-by-Step Fix:" -ForegroundColor Blue
Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Login and find your ResearchHub project" -ForegroundColor White  
Write-Host "3. Click on your API service" -ForegroundColor White
Write-Host "4. Click Variables tab" -ForegroundColor White
Write-Host "5. Find MONGODB_URI variable" -ForegroundColor White
Write-Host "6. Replace with one of these options:" -ForegroundColor White

Write-Host ""
Write-Host "Option A:" -ForegroundColor Green
Write-Host "`${{ MongoDB.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "Option B:" -ForegroundColor Green  
Write-Host "`${{ Mongo.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "Option C:" -ForegroundColor Green
Write-Host "`${{ database.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "Emergency Atlas fallback:" -ForegroundColor Red
$atlasUri = "mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true`&w=majority`&appName=Cluster0"
Write-Host $atlasUri -ForegroundColor Gray

Write-Host ""
Write-Host "7. Save the variable and redeploy" -ForegroundColor White
Write-Host "8. Watch logs for: Connected to MongoDB successfully" -ForegroundColor White

Write-Host ""
Write-Host "This fix should take 10-15 minutes total" -ForegroundColor Yellow

Write-Host ""
Write-Host "Railway Dashboard: https://railway.app/dashboard" -ForegroundColor Cyan

Write-Host ""
Write-Host "After fixing, test with:" -ForegroundColor Blue
Write-Host "node quick-railway-check.cjs https://your-railway-url.railway.app" -ForegroundColor Cyan

Write-Host ""
Write-Host "Your Railway deployment should work after this fix!" -ForegroundColor Green
