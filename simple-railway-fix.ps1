# Railway MongoDB Connection Fixer - Simple Version

Write-Host "🚂 Railway MongoDB Connection Fixer" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "From your Railway logs, the issue is clear:" -ForegroundColor Yellow
Write-Host "❌ Failed to connect to MongoDB: connect ECONNREFUSED researchhub-mongodb.railway.internal:27017" -ForegroundColor Red

Write-Host ""
Write-Host "🎯 SOLUTION: Update your MONGODB_URI environment variable" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step-by-Step Fix:" -ForegroundColor Blue
Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Login and find your ResearchHub project" -ForegroundColor White  
Write-Host "3. Click on your API service (the one showing the logs)" -ForegroundColor White
Write-Host "4. Click 'Variables' tab" -ForegroundColor White
Write-Host "5. Find MONGODB_URI variable" -ForegroundColor White

Write-Host ""
Write-Host "6. Replace the current value with ONE of these:" -ForegroundColor Blue

Write-Host ""
Write-Host "   Option A (Most likely to work):" -ForegroundColor Green
Write-Host "   `${{ MongoDB.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "   Option B (Alternative):" -ForegroundColor Green  
Write-Host "   `${{ Mongo.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "   Option C (Another alternative):" -ForegroundColor Green
Write-Host "   `${{ database.MONGO_URL }}/researchhub" -ForegroundColor Cyan

Write-Host ""
Write-Host "   Option D (Emergency - Atlas fallback):" -ForegroundColor Red
Write-Host "   'mongodb+srv://abwanwr77:CFm4JCkjeFpKpzO4@cluster0.ackancs.mongodb.net/researchhub?retryWrites=true&w=majority&appName=Cluster0'" -ForegroundColor Gray

Write-Host ""
Write-Host "7. Save the variable" -ForegroundColor White
Write-Host "8. Click 'Deploy' to redeploy your service" -ForegroundColor White
Write-Host "9. Watch deployment logs for: '✅ Connected to MongoDB successfully'" -ForegroundColor White

Write-Host ""
Write-Host "🚨 KEY POINT:" -ForegroundColor Red
Write-Host "The MongoDB service name must match exactly!" -ForegroundColor White
Write-Host "Look at your Railway project services and use the exact name." -ForegroundColor White

Write-Host ""
Write-Host "⏱️ This should take about 10-15 minutes total" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔗 Railway Dashboard: https://railway.app/dashboard" -ForegroundColor Cyan

Write-Host ""
$continue = Read-Host "Press any key when you've made the changes to test the connection..."

Write-Host ""
Write-Host "🔍 Once you've fixed it, test with:" -ForegroundColor Blue
Write-Host "node quick-railway-check.cjs https://your-railway-url.railway.app" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Your Railway deployment should work after this fix!" -ForegroundColor Green
