# Vercel Environment Variables Setup for ResearchHub MongoDB Integration
# Run this script to set up production environment variables on Vercel

Write-Host "🔧 Setting up Vercel Environment Variables for MongoDB Integration" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is available
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing now..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Setting up environment variables..." -ForegroundColor Blue

# Generate secure JWT secrets
$jwtSecret = -join ((1..64) | ForEach-Object {[char][byte]((65..90) + (97..122) + (48..57) | Get-Random)})
$jwtRefreshSecret = -join ((1..64) | ForEach-Object {[char][byte]((65..90) + (97..122) + (48..57) | Get-Random)})

Write-Host ""
Write-Host "� Setting up basic environment variables..." -ForegroundColor Yellow

# Core application settings
Write-Host "Setting NODE_ENV..." -ForegroundColor Gray
vercel env add NODE_ENV production production --yes 2>$null

Write-Host "Setting CLIENT_URL..." -ForegroundColor Gray  
vercel env add CLIENT_URL https://researchhub-saas.vercel.app production --yes 2>$null

Write-Host "Setting JWT secrets..." -ForegroundColor Gray
vercel env add JWT_SECRET $jwtSecret production --yes 2>$null
vercel env add JWT_REFRESH_SECRET $jwtRefreshSecret production --yes 2>$null

Write-Host ""
Write-Host "✅ Basic variables set" -ForegroundColor Green

Write-Host ""
Write-Host "�️ MongoDB Atlas Setup Required:" -ForegroundColor Yellow
Write-Host "1. Go to https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "2. Create a new cluster or use existing one" -ForegroundColor White
Write-Host "3. Go to Database Access and create a user" -ForegroundColor White
Write-Host "4. Go to Network Access and allow 0.0.0.0/0 (for Vercel)" -ForegroundColor White
Write-Host "5. Get your connection string from 'Connect' button" -ForegroundColor White
Write-Host ""
Write-Host "Example format: mongodb+srv://username:password@cluster.mongodb.net/researchhub" -ForegroundColor Gray
Write-Host ""

$mongoUri = Read-Host "Enter your MongoDB Atlas URI (or press Enter to skip)"
if ($mongoUri -and $mongoUri.Trim() -ne "") {
    Write-Host "Setting MONGODB_URI..." -ForegroundColor Gray
    vercel env add MONGODB_URI $mongoUri production --yes 2>$null
    Write-Host "✅ MongoDB URI added" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB URI skipped - you can add it later in Vercel dashboard" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Environment variables setup complete!" -ForegroundColor Green
Write-Host "📝 Variables configured:" -ForegroundColor Blue
Write-Host "  ✅ NODE_ENV=production" -ForegroundColor Gray
Write-Host "  ✅ CLIENT_URL=https://researchhub-saas.vercel.app" -ForegroundColor Gray
Write-Host "  ✅ JWT_SECRET=*** (64 characters)" -ForegroundColor Gray
Write-Host "  ✅ JWT_REFRESH_SECRET=*** (64 characters)" -ForegroundColor Gray
if ($mongoUri -and $mongoUri.Trim() -ne "") {
    Write-Host "  ✅ MONGODB_URI=***" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  MONGODB_URI=not set" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "🚀 Next step: git push origin main (if not MongoDB URI was set)" -ForegroundColor Cyan
Write-Host "🌐 Or visit: https://vercel.com/dashboard to add MONGODB_URI manually" -ForegroundColor Cyan
