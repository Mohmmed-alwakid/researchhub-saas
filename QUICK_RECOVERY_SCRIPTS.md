# 🚀 Quick Recovery Scripts

## Run this to see what's working:
```powershell
# Test your site health
Write-Host "`n🔍 Checking Production Site..." -ForegroundColor Cyan
$health = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app/api/health" -Method GET -UseBasicParsing
$healthData = $health.Content | ConvertFrom-Json
Write-Host "✅ Production Status: " -NoNewline
Write-Host $healthData.status -ForegroundColor Green
Write-Host ""

# Test local development
Write-Host "🏠 Starting Local Development..." -ForegroundColor Cyan
Write-Host "Run this in your terminal: npm run dev:fullstack" -ForegroundColor Yellow
Write-Host ""

# Show your test accounts
Write-Host "👥 Your Test Accounts:" -ForegroundColor Cyan
Write-Host "Researcher:  abwanwr77+Researcher@gmail.com / Testtest123" -ForegroundColor White
Write-Host "Participant: abwanwr77+participant@gmail.com / Testtest123" -ForegroundColor White
Write-Host "Admin:       abwanwr77+admin@gmail.com / Testtest123" -ForegroundColor White
```

## Create Your Safety Branch:
```powershell
# Save your current state
git add .
git commit -m "Checkpoint before recovery - $(Get-Date -Format 'yyyy-MM-dd')"
git push origin main

# Create backup branch
git checkout -b working-backup-oct3-2025
git push origin working-backup-oct3-2025

# Go back to main
git checkout main

Write-Host "✅ Safety branch created: working-backup-oct3-2025" -ForegroundColor Green
Write-Host "You can always return to this state!" -ForegroundColor Yellow
```

## Daily Testing Checklist:
```powershell
Write-Host "`n📋 Daily Testing Checklist" -ForegroundColor Cyan
Write-Host "Before you make ANY changes, test these:" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ ] 1. Production site loads: https://researchhub-saas.vercel.app" -ForegroundColor White
Write-Host "[ ] 2. Login works (test with researcher account)" -ForegroundColor White
Write-Host "[ ] 3. Dashboard displays without errors" -ForegroundColor White
Write-Host "[ ] 4. Can navigate to Studies page" -ForegroundColor White
Write-Host "[ ] 5. No red errors in browser console (F12)" -ForegroundColor White
Write-Host ""
Write-Host "✅ If all pass: SAFE TO CODE" -ForegroundColor Green
Write-Host "❌ If any fail: FIX BEFORE CODING" -ForegroundColor Red
```

## Emergency Undo:
```powershell
# If something breaks, run this:
Write-Host "⚠️  EMERGENCY UNDO - Last resort!" -ForegroundColor Red
Write-Host "This will undo ALL uncommitted changes" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure? (yes/no)"

if ($confirm -eq "yes") {
    git reset --hard HEAD
    Write-Host "✅ Changes undone. Back to last commit." -ForegroundColor Green
} else {
    Write-Host "❌ Cancelled. No changes made." -ForegroundColor Yellow
}
```
