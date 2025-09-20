@echo off
title ResearchHub Study Workflow Test Suite
color 0a

echo.
echo ================================================================
echo       ResearchHub - Study Workflow Test Suite
echo ================================================================
echo.
echo This test suite validates the complete study workflow including:
echo.
echo  ^✅ Main Workflow: Create study ^-^> Apply ^-^> Accept ^-^> Complete
echo  ^✅ Edge Cases: Participant limits, timeouts, network issues
echo  ^✅ Performance: Load times and API response validation
echo  ^✅ Cross-browser: Chrome, Firefox, Safari, Mobile testing
echo.
echo ================================================================
echo                        PREREQUISITES
echo ================================================================
echo.
echo 1. Development server running: npm run dev:fullstack
echo 2. Test accounts configured with correct roles
echo 3. Playwright installed: npx playwright install
echo.

REM Check if we're in correct directory
if not exist "package.json" (
    echo ^❌ ERROR: package.json not found
    echo Please run this script from the ResearchHub root directory
    echo.
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ^❌ ERROR: Node.js not found
    echo Please install Node.js and try again
    echo.
    pause
    exit /b 1
)

echo ^✅ Prerequisites check passed
echo.

:MENU
echo ================================================================
echo                        TEST OPTIONS
echo ================================================================
echo.
echo  1. ^🚀 Quick Demo Test      (5 min  - Main workflow only)
echo  2. ^🎯 Complete Test Suite  (20 min - All scenarios)
echo  3. ^⚡ Performance Only     (2 min  - Speed validation)  
echo  4. ^🚨 Edge Cases Only      (15 min - Error scenarios)
echo  5. ^🔧 Custom Test          (Variable - Interactive)
echo  6. ^📋 View Test Results    (Browse previous reports)
echo  7. ^❓ Help ^& Documentation (Show guides)
echo  8. ^🚪 Exit
echo.
echo ================================================================

set /p choice="Select option (1-8): "

if "%choice%"=="1" goto QUICK_TEST
if "%choice%"=="2" goto COMPLETE_TEST
if "%choice%"=="3" goto PERFORMANCE_TEST
if "%choice%"=="4" goto EDGE_CASES
if "%choice%"=="5" goto CUSTOM_TEST
if "%choice%"=="6" goto VIEW_RESULTS
if "%choice%"=="7" goto HELP
if "%choice%"=="8" goto EXIT
goto INVALID_CHOICE

:QUICK_TEST
echo.
echo ^🚀 Running Quick Demo Test...
echo This will test the main study workflow (create ^-^> apply ^-^> accept ^-^> complete)
echo.
npx playwright test testing/playwright-mcp/demo-study-workflow.spec.js --grep "DEMO: Complete Study Workflow" --headed --timeout=120000
goto TEST_COMPLETE

:COMPLETE_TEST
echo.
echo ^🎯 Running Complete Test Suite...
echo This includes main workflow + all edge cases + performance testing
echo.
node testing/playwright-mcp/run-comprehensive-tests.js
goto TEST_COMPLETE

:PERFORMANCE_TEST
echo.
echo ^⚡ Running Performance Tests...
echo Testing page load times and API response speeds
echo.
npx playwright test testing/playwright-mcp/demo-study-workflow.spec.js --grep "Performance" --headed
goto TEST_COMPLETE

:EDGE_CASES
echo.
echo ^🚨 Running Edge Case Tests...
echo Testing participant limits, timeouts, network issues
echo.
npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "Edge Case" --headed
goto TEST_COMPLETE

:CUSTOM_TEST
echo.
set /p testname="Enter test name to search for: "
echo.
echo Running custom test: %testname%
echo.
npx playwright test testing/playwright-mcp/comprehensive-study-workflow.spec.js --grep "%testname%" --headed
goto TEST_COMPLETE

:VIEW_RESULTS
echo.
echo ^📋 Opening test results...
if exist "testing\reports" (
    explorer testing\reports
) else (
    echo No test reports found. Run tests first to generate reports.
)
echo.
pause
goto MENU

:HELP
echo.
echo ^📚 HELP ^& DOCUMENTATION
echo ========================
echo.
echo Test Files Created:
echo  • testing/playwright-mcp/STUDY_WORKFLOW_TEST_GUIDE.md
echo  • testing/playwright-mcp/COMPREHENSIVE_STUDY_WORKFLOW_TEST_SCENARIOS.md  
echo  • testing/playwright-mcp/IMPLEMENTATION_COMPLETE_SUMMARY.md
echo.
echo Test Scripts:
echo  • comprehensive-study-workflow.spec.js  (Complete test suite)
echo  • demo-study-workflow.spec.js           (Simple demo)
echo  • run-comprehensive-tests.js            (Test runner)
echo.
echo Edge Cases Tested:
echo  • Participant limits exceeded
echo  • Study timeout ^& notifications
echo  • Network interruption recovery
echo  • Session management ^& resume
echo  • Data validation ^& quality
echo.
echo For detailed documentation, see:
echo testing/playwright-mcp/IMPLEMENTATION_COMPLETE_SUMMARY.md
echo.
pause
goto MENU

:TEST_COMPLETE
echo.
echo ================================================================
echo                        TEST COMPLETED
echo ================================================================
echo.
echo ^📊 Results:
if exist "test-results" (
    echo  • Screenshots: test-results/
)
if exist "testing\reports" (
    echo  • Reports: testing/reports/
)
echo  • HTML Report: Available at localhost:9323 (if shown)
echo.
echo ^🎯 Next Steps:
echo  • Review test results above
echo  • Check screenshots for any failures  
echo  • Fix issues and re-run tests
echo  • View detailed reports for analysis
echo.
echo ^🔄 Run another test? (Press any key to return to menu)
pause >nul
goto MENU

:INVALID_CHOICE
echo.
echo ^❌ Invalid choice. Please select 1-8.
echo.
pause
goto MENU

:EXIT
echo.
echo ^👋 Thanks for using ResearchHub Test Suite!
echo.
echo Created test files:
echo  • Comprehensive test scenarios
echo  • Automated test implementations  
echo  • Performance ^& edge case validation
echo  • Cross-browser compatibility testing
echo.
echo Happy testing! ^🎭
echo.
pause
exit /b 0
