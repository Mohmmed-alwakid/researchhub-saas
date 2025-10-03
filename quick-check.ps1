# ResearchHub Simple Health Check
Write-Host ""
Write-Host "🏥 ResearchHub Quick Check" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Check production
Write-Host ""
Write-Host "Checking production..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://researchhub-saas.vercel.app/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Production: WORKING" -ForegroundColor Green
} catch {
    Write-Host "❌ Production: BROKEN" -ForegroundColor Red
}

# Check files
Write-Host ""
Write-Host "Checking critical files..." -ForegroundColor Yellow
if (Test-Path "src/App.tsx") { Write-Host "✅ App.tsx exists" -ForegroundColor Green } else { Write-Host "❌ App.tsx missing" -ForegroundColor Red }
if (Test-Path "package.json") { Write-Host "✅ package.json exists" -ForegroundColor Green } else { Write-Host "❌ package.json missing" -ForegroundColor Red }
if (Test-Path "node_modules") { Write-Host "✅ Dependencies installed" -ForegroundColor Green } else { Write-Host "❌ Run: npm install" -ForegroundColor Red }

# Check git
Write-Host ""
Write-Host "Checking git status..." -ForegroundColor Yellow
$changedCount = (git status --porcelain | Measure-Object).Count
Write-Host "Info: $changedCount files changed" -ForegroundColor Cyan

Write-Host ""
Write-Host "Quick check complete!" -ForegroundColor Green
Write-Host "Next: npm run dev:fullstack" -ForegroundColor Cyan
Write-Host ""
