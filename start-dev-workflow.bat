@echo off
echo 🚀 ResearchHub Development Workflow
echo =====================================

echo.
echo 🔧 Starting development server...
start "ResearchHub Server" cmd /k "npm run dev:fullstack"

echo.
echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo 🧪 Testing API endpoints...
echo.

echo Testing health endpoint...
powershell -Command "try { $result = Invoke-RestMethod -Uri 'http://localhost:3003/api/health'; Write-Host '✅ Health check passed' -ForegroundColor Green; } catch { Write-Host '❌ Health check failed' -ForegroundColor Red }"

echo.
echo Testing authentication...
powershell -Command "try { $body = @{ email='abwanwr77+researcher@gmail.com'; password='Testtest123' } | ConvertTo-Json; $result = Invoke-RestMethod -Uri 'http://localhost:3003/api/auth-consolidated?action=login' -Method POST -Body $body -ContentType 'application/json'; if($result.success) { Write-Host '✅ Authentication working' -ForegroundColor Green } else { Write-Host '❌ Authentication failed' -ForegroundColor Red } } catch { Write-Host '❌ Authentication error' -ForegroundColor Red }"

echo.
echo 🌐 Opening browser...
start http://localhost:5175

echo.
echo ✅ Development environment ready!
echo 📡 Backend: http://localhost:3003
echo 🌐 Frontend: http://localhost:5175
echo.
echo Press any key to close this window...
pause >nul
