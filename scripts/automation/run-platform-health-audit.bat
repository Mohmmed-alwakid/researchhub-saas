@echo off
REM ResearchHub Platform Health Audit Runner
REM Created: September 20, 2025
REM Purpose: Easy execution of comprehensive platform health audits

echo.
echo ===============================================
echo   ResearchHub Platform Health Audit System
echo ===============================================
echo.
echo Select audit type to run:
echo.
echo [1] Quick API Health Check (2 minutes)
echo [2] Complete Browser Testing (5 minutes)  
echo [3] Full Platform Audit (7 minutes)
echo [4] Monitor API Contracts Only (30 seconds)
echo [5] Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto api_audit
if "%choice%"=="2" goto browser_audit
if "%choice%"=="3" goto complete_audit
if "%choice%"=="4" goto api_monitor
if "%choice%"=="5" goto exit
goto invalid

:api_audit
echo.
echo 🔗 Running API Health Audit...
echo This will test all API endpoints and data consistency
echo.
node scripts/platform-health-audit.mjs
if %errorlevel%==0 (
    echo.
    echo ✅ API Health Audit completed successfully!
) else (
    echo.
    echo ❌ API Health Audit found issues. Check the output above.
)
goto end

:browser_audit
echo.
echo 🎭 Running Browser Health Audit...
echo This will test UI components and user flows
echo.
node testing/browser-health-audit.mjs
if %errorlevel%==0 (
    echo.
    echo ✅ Browser Health Audit completed successfully!
) else (
    echo.
    echo ❌ Browser Health Audit found issues. Check the output above.
)
goto end

:complete_audit
echo.
echo 🚀 Running Complete Platform Audit...
echo This will run comprehensive API + Browser testing
echo Estimated time: 7 minutes
echo.
node scripts/complete-platform-audit.mjs
if %errorlevel%==0 (
    echo.
    echo 🎉 Complete Platform Audit finished!
    echo Platform health score: Check the output above
) else (
    echo.
    echo ⚠️ Platform audit found issues that need attention.
    echo Check the detailed report in testing/platform-health-reports/
)
goto end

:api_monitor
echo.
echo 📊 Running API Contract Monitor...
echo Quick validation of API response formats
echo.
node scripts/monitor-api-contract.js
if %errorlevel%==0 (
    echo.
    echo ✅ API contracts are valid!
) else (
    echo.
    echo ❌ API contract issues detected.
)
goto end

:invalid
echo.
echo ❌ Invalid choice. Please select 1-5.
echo.
goto start

:exit
echo.
echo 👋 Goodbye!
exit /b 0

:end
echo.
echo ===============================================
echo.
echo 📋 What happened:
echo - Audit results are displayed above
echo - Detailed reports saved in testing/platform-health-reports/
echo - API contracts validated against expected formats
echo - User flows tested for consistency
echo.
echo 💡 Next steps:
echo - Review any issues found above
echo - Fix critical issues first (marked as HIGH priority)
echo - Re-run audit after fixes to verify resolution
echo - Schedule regular audits to prevent future issues
echo.
echo ===============================================
echo.
pause