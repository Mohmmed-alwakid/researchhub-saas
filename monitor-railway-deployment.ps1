# Railway Deployment Monitor & URL Discovery
# Updated for ResearchHub Backend - Post-Fixes Deployment Check

<#
.SYNOPSIS
    Railway Deployment Monitor with URL Discovery
.DESCRIPTION
    Monitors Railway deployment and discovers the live URL after all fixes applied
.NOTES
    All critical fixes applied: Express v4, start path, featureFlags imports
#>

param(
    [string]$RailwayUrl = ""
)

# Railway Project Details (Updated June 4, 2025)
$ProjectId = "95c09b83-e303-4e20-9906-524cce66fc3b"
$ServiceId = "db52a3b7-fc09-45b7-be15-a46ba8c97306"
$DashboardUrl = "https://railway.app/project/$ProjectId"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $ColorMap = @{
        "Red" = "Red"
        "Green" = "Green" 
        "Yellow" = "Yellow"
        "Cyan" = "Cyan"
        "Magenta" = "Magenta"
        "Blue" = "Blue"
        "Gray" = "Gray"
        "White" = "White"
    }
    
    Write-Host $Message -ForegroundColor $ColorMap[$Color]
}

function Test-RailwayEndpoint {
    param(
        [string]$Url,
        [string]$Endpoint = "",
        [string]$Description = "Endpoint"
    )
    
    $FullUrl = "$Url$Endpoint"
    
    try {
        $Response = Invoke-WebRequest -Uri $FullUrl -TimeoutSec 10 -ErrorAction Stop
        
        Write-ColorOutput "✅ $Description (HTTP $($Response.StatusCode))" "Green"
        
        try {
            $Json = $Response.Content | ConvertFrom-Json
            if ($Json.message) {
                Write-ColorOutput "   📝 Message: $($Json.message)" "Gray"
            }
            if ($Json.status) {
                Write-ColorOutput "   📊 Status: $($Json.status)" "Gray"
            }
            if ($Json.uptime) {
                Write-ColorOutput "   ⏱️  Uptime: $([math]::Round($Json.uptime, 2)) seconds" "Gray"
            }
            if ($Json.environment) {
                Write-ColorOutput "   🌍 Environment: $($Json.environment)" "Gray"
            }
        } catch {
            Write-ColorOutput "   📄 Response: $($Response.Content.Substring(0, [Math]::Min(100, $Response.Content.Length)))" "Gray"
        }
        
        return $true
    }
    catch {
        $StatusCode = ""
        if ($_.Exception.Response) {
            $StatusCode = " (HTTP $([int]$_.Exception.Response.StatusCode))"
        }
        
        Write-ColorOutput "❌ $Description$StatusCode - $($_.Exception.Message)" "Red"
        return $false
    }
}

# Header
Clear-Host
Write-ColorOutput "🚀 Railway Deployment Monitor - Real Time" "Cyan"
Write-ColorOutput "═══════════════════════════════════════════" "Gray"
Write-ColorOutput "📅 Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Gray"
Write-ColorOutput "🔧 Monitoring deployment with critical fixes applied" "Yellow"
Write-ColorOutput "" "White"

if (-not $RailwayUrl) {
    Write-ColorOutput "🎯 Railway URL Setup" "Magenta"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━" "Gray"
    Write-ColorOutput "After creating your Railway project, you'll get a URL like:" "White"
    Write-ColorOutput "   https://researchhub-production-abc123.railway.app" "Cyan"
    Write-ColorOutput "" "White"
    
    $RailwayUrl = Read-Host "Enter your Railway URL (or press Enter to use known URL)"
    
    if (-not $RailwayUrl) {
        $RailwayUrl = "https://afakar-production.up.railway.app"
        Write-ColorOutput "Using known URL: $RailwayUrl" "Yellow"
    }
}

Write-ColorOutput "" "White"
Write-ColorOutput "🔍 Monitoring: $RailwayUrl" "Magenta"
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Gray"

$AttemptCount = 0
$MaxAttempts = 20
$Success = $false

while ($AttemptCount -lt $MaxAttempts -and -not $Success) {
    $AttemptCount++
    
    Write-ColorOutput "" "White"
    Write-ColorOutput "🔄 Attempt $AttemptCount of $MaxAttempts" "Cyan"
    Write-ColorOutput "⏰ $(Get-Date -Format 'HH:mm:ss')" "Gray"
    Write-ColorOutput "────────────────────────────────────────" "Gray"
    
    # Test all endpoints
    $HealthResult = Test-RailwayEndpoint -Url $RailwayUrl -Endpoint "/health" -Description "Health Check"
    Start-Sleep -Seconds 2
    
    $ApiHealthResult = Test-RailwayEndpoint -Url $RailwayUrl -Endpoint "/api/health" -Description "API Health"
    Start-Sleep -Seconds 2
    
    $RootResult = Test-RailwayEndpoint -Url $RailwayUrl -Endpoint "/" -Description "Root Endpoint"
    
    if ($HealthResult -or $ApiHealthResult -or $RootResult) {
        $Success = $true
        Write-ColorOutput "" "White"
        Write-ColorOutput "🎉 SUCCESS! Railway deployment is working!" "Green"
        Write-ColorOutput "═══════════════════════════════════════════════════" "Green"
        Write-ColorOutput "✅ Backend is live and responding correctly" "Green"
        Write-ColorOutput "🌐 Railway URL: $RailwayUrl" "Cyan"
        Write-ColorOutput "" "White"
        
        Write-ColorOutput "🔄 NEXT STEPS:" "Yellow"
        Write-ColorOutput "1. Copy this URL: $RailwayUrl" "White"
        Write-ColorOutput "2. Go to Vercel dashboard" "White"
        Write-ColorOutput "3. Update VITE_API_URL=$RailwayUrl/api" "White"
        Write-ColorOutput "4. Redeploy frontend" "White"
        Write-ColorOutput "" "White"
        
        Write-ColorOutput "🧪 Quick Test Commands:" "Yellow"
        Write-ColorOutput "Health: $RailwayUrl/health" "Cyan"
        Write-ColorOutput "API: $RailwayUrl/api/health" "Cyan"
        Write-ColorOutput "Frontend: https://researchhub-saas.vercel.app" "Cyan"
        
        break
    } else {
        if ($AttemptCount -lt $MaxAttempts) {
            Write-ColorOutput "" "White"
            Write-ColorOutput "⏳ Deployment still in progress..." "Yellow"
            Write-ColorOutput "   💡 Railway deployments typically take 5-10 minutes" "Gray"
            Write-ColorOutput "   🔄 Retrying in 30 seconds..." "Gray"
            
            # Countdown
            for ($i = 30; $i -gt 0; $i--) {
                Write-Host "`r   ⏱️  Next check in: $i seconds" -NoNewline -ForegroundColor Gray
                Start-Sleep -Seconds 1
            }
            Write-Host ""
        }
    }
}

if (-not $Success) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "❌ Deployment Check Timeout" "Red"
    Write-ColorOutput "═══════════════════════════════════════" "Red"
    Write-ColorOutput "After $MaxAttempts attempts, the deployment is not responding." "Red"
    Write-ColorOutput "" "White"
    
    Write-ColorOutput "🔍 Troubleshooting Steps:" "Yellow"
    Write-ColorOutput "1. Check Railway dashboard for deployment status" "White"
    Write-ColorOutput "2. Review build logs for any errors" "White"
    Write-ColorOutput "3. Verify all environment variables are set" "White"
    Write-ColorOutput "4. Ensure you're deploying from 'main' branch" "White"
    Write-ColorOutput "" "White"
    
    Write-ColorOutput "💡 The deployment might still be building." "Cyan"
    Write-ColorOutput "   Try running this script again in 5-10 minutes." "Cyan"
}

Write-ColorOutput "" "White"
Write-ColorOutput "📊 Monitor completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Gray"
