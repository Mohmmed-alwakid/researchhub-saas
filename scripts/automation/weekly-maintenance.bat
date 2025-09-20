@echo off
REM ResearchHub Automated Maintenance Script
REM Runs all necessary cleanup and organization tasks

echo 🔧 ResearchHub Automated Maintenance
echo ===================================

echo.
echo ⏰ %date% %time%

echo.
echo 📊 Pre-maintenance status:
for /f %%i in ('dir /b /a-d ^| find /c /v ""') do echo - Files in root: %%i

echo.
echo 🧹 Running project cleanup...
if exist scripts\automation\comprehensive-cleanup.bat (
    call scripts\automation\comprehensive-cleanup.bat
) else (
    echo Warning: Cleanup script not found in expected location
)

echo.
echo 🛡️ Enforcing project structure rules...
node scripts\development\project-enforcer.js enforce

echo.
echo 📈 Running health checks...
if exist testing\health-monitoring\platform-health-audit.mjs (
    node testing\health-monitoring\platform-health-audit.mjs
) else (
    echo Warning: Health audit script not found
)

echo.
echo 📊 Post-maintenance status:
for /f %%i in ('dir /b /a-d ^| find /c /v ""') do echo - Files in root: %%i

echo.
echo ✅ Maintenance Complete!
echo 📅 Next maintenance: Add this to your weekly schedule

REM Log maintenance activity
echo %date% %time% - Automated maintenance completed >> scripts\automation\maintenance.log

echo.
echo 💡 Tip: Run this script weekly to maintain project organization
pause