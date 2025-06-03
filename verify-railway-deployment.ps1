#!/usr/bin/env powershell

<#
.SYNOPSIS
    Railway Deployment Verification Script - Monitors Current Deployment
.DESCRIPTION
    Checks Railway deployment status after applying critical fixes
.PARAMETER RailwayUrl
    The Railway URL to monitor (optional, will use known URLs if not provided)
#>

param(
    [string]$RailwayUrl = ""
)

Write-Host "🚀 Railway Deployment Verification - June 3, 2025" -ForegroundColor Green
Write-Host "📊 Monitoring deployment after critical fixes applied..." -ForegroundColor Cyan
Write-Host ""

# Known Railway URLs from project history
$KnownUrls = @(
    "https://afakar-production.up.railway.app",
    "https://researchhub-backend-production.up.railway.app",
    "https://researchhub-saas-production.railway.app"
)

$UrlsToCheck = @()

if ($RailwayUrl) {
    $UrlsToCheck += $RailwayUrl
    Write-Host "🎯 Using provided URL: $RailwayUrl" -ForegroundColor Yellow
} else {
    $UrlsToCheck = $KnownUrls
    Write-Host "🔍 Checking known Railway URLs from project history..." -ForegroundColor Yellow
}

Write-Host ""

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Endpoint,
        [string]$Label
    )
    
    $FullUrl = "$Url$Endpoint"
    
    try {
        Write-Host "🔄 Testing $Label`: $FullUrl" -ForegroundColor Cyan
        
        $Response = Invoke-WebRequest -Uri $FullUrl -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "✅ $Label (HTTP $($Response.StatusCode))" -ForegroundColor Green
        
        # Try to parse JSON response
        try {
            $Json = $Response.Content | ConvertFrom-Json
            Write-Host "   📄 Response: $($Json.message -or $Json.status -or 'Success')" -ForegroundColor Gray
            
            if ($Json.uptime) {
                Write-Host "   ⏱️  Uptime: $([math]::Round($Json.uptime, 2)) seconds" -ForegroundColor Gray
            }
            
            if ($Json.timestamp) {
                Write-Host "   🕐 Timestamp: $($Json.timestamp)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "   📄 Response: $($Response.Content.Substring(0, [Math]::Min(100, $Response.Content.Length)))" -ForegroundColor Gray
        }
        
        return $true
    }
    catch [System.Net.WebException] {
        $StatusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "❌ $Label (HTTP $StatusCode)" -ForegroundColor Red
        Write-Host "   ⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
    catch {
        Write-Host "❌ $Label (Connection Failed)" -ForegroundColor Red
        Write-Host "   ⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        return $false
    }
}

$SuccessfulUrls = @()
$FailedUrls = @()

foreach ($Url in $UrlsToCheck) {
    Write-Host "🌐 Checking Railway URL: $Url" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    $HealthCheck = Test-Endpoint -Url $Url -Endpoint "/health" -Label "Health Check"
    Start-Sleep -Seconds 1
    
    $ApiHealth = Test-Endpoint -Url $Url -Endpoint "/api/health" -Label "API Health"
    Start-Sleep -Seconds 1
    
    $Root = Test-Endpoint -Url $Url -Endpoint "/" -Label "Root Endpoint"
    
    if ($HealthCheck -or $ApiHealth -or $Root) {
        $SuccessfulUrls += $Url
        Write-Host ""
        Write-Host "🎉 SUCCESS! $Url is responding!" -ForegroundColor Green
    } else {
        $FailedUrls += $Url
        Write-Host ""
        Write-Host "💔 FAILED: $Url is not responding" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Summary
Write-Host "📊 DEPLOYMENT STATUS SUMMARY" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray

if ($SuccessfulUrls.Count -gt 0) {
    Write-Host "✅ Working Railway URLs:" -ForegroundColor Green
    foreach ($Url in $SuccessfulUrls) {
        Write-Host "   🌐 $Url" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "🎉 GREAT NEWS! Your Railway backend is live!" -ForegroundColor Green
    Write-Host "🔗 Next Step: Update Vercel frontend environment variable" -ForegroundColor Cyan
    Write-Host "   📝 Set VITE_API_URL=$($SuccessfulUrls[0])/api in Vercel" -ForegroundColor Yellow
} else {
    Write-Host "❌ No working Railway URLs found" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 This could mean:" -ForegroundColor Yellow
    Write-Host "   1. 🔄 Deployment is still in progress (Railway takes 5-10 minutes)" -ForegroundColor Yellow
    Write-Host "   2. 🚀 You need to create a new Railway deployment" -ForegroundColor Yellow
    Write-Host "   3. 🔧 Railway service needs to be recreated" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎯 Recommended Actions:" -ForegroundColor Cyan
    Write-Host "   1. Check Railway dashboard for deployment status" -ForegroundColor White
    Write-Host "   2. If no active deployments, follow DEPLOY_NOW_RAILWAY.md" -ForegroundColor White
    Write-Host "   3. Wait 10 minutes and run this script again" -ForegroundColor White
}

if ($FailedUrls.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Failed URLs:" -ForegroundColor Red
    foreach ($Url in $FailedUrls) {
        Write-Host "   💔 $Url" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 To manually deploy to Railway:" -ForegroundColor Cyan
Write-Host "   1. Visit: https://railway.app/new" -ForegroundColor White
Write-Host "   2. Deploy from GitHub: Mohmmed-alwakid/researchhub-saas" -ForegroundColor White
Write-Host "   3. Add environment variables from RAILWAY_ENV_VARS.txt" -ForegroundColor White
Write-Host ""
Write-Host "⏰ Script completed at: $(Get-Date)" -ForegroundColor Gray
