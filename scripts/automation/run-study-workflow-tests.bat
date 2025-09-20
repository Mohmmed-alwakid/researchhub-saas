@echo off
echo =============================================================
echo ResearchHub - Comprehensive Study Workflow Test Runner
echo =============================================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the ResearchHub root directory
    pause
    exit /b 1
)

echo 1. Quick Test (Main workflow only)
echo 2. Complete Test Suite (All scenarios)
echo 3. Performance Test Only
echo 4. Edge Cases Only
echo 5. Custom Test (Interactive)
echo.
set /p choice="Select test option (1-5): "

if "%choice%"=="1" (
    echo Running Quick Test - Main Workflow Only...
    echo.
    npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Main Workflow" --headed
) else if "%choice%"=="2" (
    echo Running Complete Test Suite...
    echo.
    node testing/playwright-mcp/run-comprehensive-tests.js
) else if "%choice%"=="3" (
    echo Running Performance Test Only...
    echo.
    npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Performance Test" --headed
) else if "%choice%"=="4" (
    echo Running Edge Cases Only...
    echo.
    npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Edge Case" --headed
) else if "%choice%"=="5" (
    echo Custom Test Runner...
    echo.
    set /p testname="Enter test name to search for: "
    npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "%testname%" --headed
) else (
    echo Invalid choice. Running default quick test...
    npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Main Workflow" --headed
)

echo.
echo =============================================================
echo Test execution completed!
echo Check the console output above for results.
echo.
echo For detailed reports, check:
echo - testing/reports/ (HTML and JSON reports)
echo - testing/screenshots/ (Screenshots if tests failed)
echo =============================================================
pause
