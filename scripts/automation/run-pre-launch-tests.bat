@echo off
echo.
echo ========================================
echo   ResearchHub SaaS - Pre-Launch Testing
echo ========================================
echo.

echo 🚀 Starting comprehensive pre-launch testing suite...
echo.
echo This will test:
echo   ✓ Platform accessibility
echo   ✓ Email authentication
echo   ✓ Google OAuth (CRITICAL)
echo   ✓ Researcher workflow
echo   ✓ Participant workflow
echo   ✓ Admin functionality
echo   ✓ Performance metrics
echo.

pause

echo.
echo 🔄 Running automated tests...
node testing/automated/pre-launch-testing-suite.js

echo.
echo ========================================
echo   Testing Complete
echo ========================================
echo.
echo 📋 Manual verification steps:
echo   1. Check test results above
echo   2. Fix any CRITICAL issues
echo   3. Test Google OAuth manually
echo   4. Verify all user workflows
echo.
echo 🚀 If all tests pass: Platform ready for launch!
echo.
pause
