@echo off
echo 🚀 Railway Deployment Monitor - After Fixes Applied
echo ================================================
echo.

set /p RAILWAY_URL="Enter your Railway URL (e.g., https://researchhub-production-xyz123.railway.app): "

if "%RAILWAY_URL%"=="" (
    echo ❌ No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo 🔍 Testing Railway deployment: %RAILWAY_URL%
echo.

echo 📋 Testing health endpoints...
echo.

echo 🏥 Testing /health endpoint...
powershell -Command "try { $r = Invoke-WebRequest -Uri '%RAILWAY_URL%/health' -TimeoutSec 10; Write-Host '✅ Health Check (HTTP' $r.StatusCode '): OK'; $json = $r.Content | ConvertFrom-Json; Write-Host '   Message:' $json.message; Write-Host '   Uptime:' $json.uptime 'seconds' } catch { Write-Host '❌ Health Check Failed:' $_.Exception.Message }"

echo.
echo 🔌 Testing /api/health endpoint...
powershell -Command "try { $r = Invoke-WebRequest -Uri '%RAILWAY_URL%/api/health' -TimeoutSec 10; Write-Host '✅ API Health (HTTP' $r.StatusCode '): OK'; $json = $r.Content | ConvertFrom-Json; Write-Host '   Status:' $json.status } catch { Write-Host '❌ API Health Failed:' $_.Exception.Message }"

echo.
echo 🌐 Testing root endpoint...
powershell -Command "try { $r = Invoke-WebRequest -Uri '%RAILWAY_URL%/' -TimeoutSec 10; Write-Host '✅ Root Endpoint (HTTP' $r.StatusCode '): OK'; $json = $r.Content | ConvertFrom-Json; Write-Host '   Message:' $json.message; Write-Host '   Environment:' $json.environment } catch { Write-Host '❌ Root Endpoint Failed:' $_.Exception.Message }"

echo.
echo 📊 Testing complete!
echo.
echo 💡 If all tests passed:
echo    1. Copy this Railway URL: %RAILWAY_URL%
echo    2. Go to Vercel dashboard
echo    3. Update VITE_API_URL=%RAILWAY_URL%/api
echo    4. Redeploy frontend
echo.
echo 🚀 Your hybrid architecture will then be complete!
echo.
pause
