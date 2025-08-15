@echo off
echo 🧹 ResearchHub Project Cleanup Script
echo =====================================

echo.
echo 📁 Cleaning up project structure...

REM Remove temporary test files
if exist test-demo-data-filtering.html (
    echo Archiving demo filtering test...
    if not exist "testing\manual\" mkdir "testing\manual"
    move "test-demo-data-filtering.html" "testing\manual\test-demo-data-filtering.html" >nul
    echo ✅ Moved to testing\manual\
)

REM Archive old status files if newer ones exist
if exist PROJECT_STATUS_2025-08-15.md (
    if exist PROJECT_STATUS_2025-08-14.md (
        echo Archiving old status file...
        if not exist "archive\status-reports\" mkdir "archive\status-reports"
        move "PROJECT_STATUS_2025-08-14.md" "archive\status-reports\PROJECT_STATUS_2025-08-14.md" >nul
        echo ✅ Archived old status report
    )
)

REM Clean up any temporary log files
for %%f in (*.log *.tmp) do (
    if exist "%%f" (
        echo Removing temporary file: %%f
        del "%%f" >nul
    )
)

REM Clean up node_modules cache if it exists
if exist node_modules\.cache (
    echo Cleaning node_modules cache...
    rmdir /s /q node_modules\.cache >nul 2>&1
    echo ✅ Cache cleaned
)

REM Verify important directories exist
echo.
echo 📂 Verifying directory structure...

if not exist "docs\" mkdir "docs"
if not exist "testing\" mkdir "testing"
if not exist "testing\data\" mkdir "testing\data"
if not exist "testing\manual\" mkdir "testing\manual"
if not exist "scripts\" mkdir "scripts"
if not exist "archive\" mkdir "archive"

echo ✅ All required directories exist

echo.
echo 📊 Project structure summary:
echo - Main directory: %CD%
echo - Documentation: docs\
echo - Testing files: testing\
echo - Scripts: scripts\
echo - Archives: archive\

echo.
echo 🎯 Cleanup completed successfully!
echo 📋 Next steps:
echo   1. Review updated documentation in docs\
echo   2. Run tests: npm run test:quick
echo   3. Check production deployment
echo   4. Review improvement suggestions

pause
