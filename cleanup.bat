@echo off
echo.
echo 🚀 ResearchHub Project Cleanup
echo ==============================
echo.
echo Choose an option:
echo 1. Full cleanup (move files)
echo 2. Dry run (preview only)
echo 3. Verbose cleanup (detailed output)
echo 4. Cancel
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🔄 Running full project cleanup...
    npm run cleanup
) else if "%choice%"=="2" (
    echo.
    echo 🔍 Running dry run preview...
    npm run cleanup:dry-run
) else if "%choice%"=="3" (
    echo.
    echo 🔄 Running verbose cleanup...
    npm run cleanup:verbose
) else if "%choice%"=="4" (
    echo.
    echo ❌ Cleanup cancelled.
) else (
    echo.
    echo ❌ Invalid choice. Please run again.
)

echo.
echo Press any key to continue...
pause > nul
