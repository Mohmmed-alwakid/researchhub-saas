@echo off
REM Setup Windows Task Scheduler for weekly health monitoring

echo 🔧 Setting up Weekly Health Monitoring...
echo.

REM Create weekly task using schtasks
schtasks /create /tn "ResearchHub Weekly Health Check" /tr "%cd%\run-automated-health-monitoring.bat" /sc weekly /d SUN /st 02:00 /f

if %ERRORLEVEL% EQU 0 (
    echo ✅ Weekly automation configured successfully!
    echo 📅 Health checks will run every Sunday at 2:00 AM
) else (
    echo ❌ Failed to configure automation
    echo Please run as administrator to set up scheduled tasks
)

echo.
echo 📋 Manual Setup Instructions:
echo 1. Open Task Scheduler (taskschd.msc)
echo 2. Create new task: "ResearchHub Weekly Health Check"
echo 3. Set trigger: Weekly, Sundays at 2:00 AM
echo 4. Set action: Start program "%cd%\run-automated-health-monitoring.bat"
echo.

pause