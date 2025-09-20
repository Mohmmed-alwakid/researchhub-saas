@echo off
REM ResearchHub Automated Health Monitoring Script
REM Runs comprehensive health checks and generates reports

echo 🏥 ResearchHub Automated Health Monitoring
echo ==========================================
echo.

echo 📅 Starting monitoring session: %date% %time%
echo.

REM Create timestamp for this monitoring session
set timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=%timestamp: =0%

echo 🔄 Running Platform Health Audit...
node scripts/platform-health-audit.mjs > testing/health-monitoring/reports/api-health-%timestamp%.log 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ API Health Check: PASSED
) else (
    echo ❌ API Health Check: FAILED
)

echo.
echo 🎭 Running Browser Health Audit...
node testing/advanced-browser-test.mjs > testing/health-monitoring/reports/browser-health-%timestamp%.log 2>&1

if %ERRORLEVEL% EQU 0 (
    echo ✅ Browser Health Check: PASSED
) else (
    echo ❌ Browser Health Check: FAILED
)

echo.
echo 📊 Generating Health Report...
echo Health monitoring completed at %date% %time% > testing/health-monitoring/reports/summary-%timestamp%.txt
echo API Health: %ERRORLEVEL% >> testing/health-monitoring/reports/summary-%timestamp%.txt
echo Browser Health: %ERRORLEVEL% >> testing/health-monitoring/reports/summary-%timestamp%.txt

echo.
echo ✅ Monitoring session completed!
echo 📄 Reports saved to: testing/health-monitoring/reports/
echo 📊 Dashboard available at: testing/health-monitoring/dashboard.html
echo.

pause