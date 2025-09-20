@echo off
echo 🧹 COMPREHENSIVE PROJECT CLEANUP
echo ================================

echo.
echo 📊 Current Analysis:
for /f %%i in ('dir /b /a-d *.md ^| find /c "."') do echo - Documentation files in root: %%i
for /f %%i in ('dir /b /a-d ^| find /c "."') do echo - Total files in root: %%i
echo - Target: Maximum 20 essential files in root

echo.
echo 📁 Creating proper directory structure...

if not exist "docs\reports\2025\september" mkdir "docs\reports\2025\september"
if not exist "docs\archive\legacy" mkdir "docs\archive\legacy"
if not exist "testing\reports" mkdir "testing\reports"
if not exist "scripts\automation" mkdir "scripts\automation"
if not exist "archive\documentation" mkdir "archive\documentation"
if not exist "archive\status-reports" mkdir "archive\status-reports"

echo.
echo 📚 Moving documentation files...

REM Move status and production reports
for %%f in (PRODUCTION_ISSUES_*.md CRITICAL_PRODUCTION_*.md) do (
    if exist "%%f" (
        echo Moving %%f to archive\status-reports\
        move "%%f" "archive\status-reports\" >nul
    )
)

REM Move development reports
for %%f in (NEXT_STEPS_*.md DEVELOPMENT_*.md PHASE*_*.md) do (
    if exist "%%f" (
        echo Moving %%f to docs\reports\2025\september\
        move "%%f" "docs\reports\2025\september\" >nul
    )
)

REM Move testing reports
for %%f in (TESTING_*.md COMPREHENSIVE_*_TEST*.md CORE_*_TEST*.md) do (
    if exist "%%f" (
        echo Moving %%f to testing\reports\
        move "%%f" "testing\reports\" >nul
    )
)

REM Move general reports
for %%f in (COMPREHENSIVE_*.md ENHANCED_*.md RESEARCHHUB_*.md) do (
    if exist "%%f" (
        echo Moving %%f to docs\reports\2025\september\
        move "%%f" "docs\reports\2025\september\" >nul
    )
)

REM Move database and technical docs
for %%f in (DATABASE_*.md TYPESCRIPT_*.md) do (
    if exist "%%f" (
        echo Moving %%f to docs\technical\
        if not exist "docs\technical" mkdir "docs\technical"
        move "%%f" "docs\technical\" >nul
    )
)

echo.
echo 🗂️ Moving other root files...

REM Move batch scripts
for %%f in (*.bat) do (
    if not "%%f"=="cleanup-project.bat" (
        echo Moving %%f to scripts\automation\
        move "%%f" "scripts\automation\" >nul
    )
)

REM Move test HTML files
for %%f in (test-*.html) do (
    if exist "%%f" (
        echo Moving %%f to testing\manual\
        move "%%f" "testing\manual\" >nul
    )
)

REM Move JavaScript/MJS files (except essential ones)
for %%f in (*.mjs final-*.mjs check-*.mjs test-*.mjs) do (
    if exist "%%f" (
        echo Moving %%f to scripts\
        move "%%f" "scripts\" >nul
    )
)

REM Move JSON monitoring files
for %%f in (auth-monitor-*.json auth.json) do (
    if exist "%%f" (
        echo Moving %%f to testing\data\
        if not exist "testing\data" mkdir "testing\data"
        move "%%f" "testing\data\" >nul
    )
)

REM Move text reports
for %%f in (*.txt) do (
    if exist "%%f" (
        echo Moving %%f to docs\reports\2025\september\
        move "%%f" "docs\reports\2025\september\" >nul
    )
)

echo.
echo 📊 Cleanup Results:
for /f %%i in ('dir /b /a-d *.md ^| find /c "."') do echo - Documentation files in root: %%i
for /f %%i in ('dir /b /a-d ^| find /c "."') do echo - Total files in root: %%i

echo.
echo ✅ Cleanup Complete!
echo 📋 Summary saved to docs\reports\2025\september\cleanup-summary.txt

echo.
echo Files moved to:
echo - Status reports: archive\status-reports\
echo - Development reports: docs\reports\2025\september\
echo - Testing reports: testing\reports\
echo - Technical docs: docs\technical\
echo - Scripts: scripts\automation\
echo - Test files: testing\manual\

pause