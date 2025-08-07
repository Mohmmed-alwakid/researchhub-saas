@echo off
echo 🚀 ResearchHub Port 5175 Force Restart Script
echo ========================================

echo Step 1: Killing any process using port 5175...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5175') do (
    echo Found process %%a using port 5175, killing it...
    taskkill /PID %%a /F >nul 2>&1
)

echo Step 2: Killing any process using port 3003 (API)...
for /f "tokens=5" %%b in ('netstat -ano ^| findstr :3003') do (
    echo Found process %%b using port 3003, killing it...
    taskkill /PID %%b /F >nul 2>&1
)

echo Step 3: Waiting 2 seconds for ports to be released...
timeout /t 2 /nobreak >nul

echo Step 4: Starting ResearchHub on port 5175...
echo Frontend: http://localhost:5175
echo API: http://localhost:3003
echo.
npm run dev:fullstack

pause
