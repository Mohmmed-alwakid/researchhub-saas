@echo off
echo.
echo ========================================
echo   ResearchHub Development Environment
echo ========================================
echo.
echo Starting with fixed port configuration:
echo   Frontend:  http://localhost:5177
echo   API:       http://localhost:3005  
echo   WebSocket: ws://localhost:8080
echo.

cd /d "%~dp0"

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting development environment...
npm run dev

pause
