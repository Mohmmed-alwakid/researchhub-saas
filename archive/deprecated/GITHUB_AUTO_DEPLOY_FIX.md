# GitHub Auto-Deploy Fix for Vercel

## Issue Identified
- Latest deployments are coming from CLI (`"source": "cli"`)
- Previous deployment shows GitHub integration was working (`"source": "git"`)
- Manual CLI deployments may have disrupted the GitHub webhook connection

## Solution Steps

### 1. Reconnect GitHub Integration in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your `researchhub-saas` project
3. Go to Settings → Git
4. Check if GitHub repository is properly connected
5. If disconnected, reconnect to `Mohmmed-alwakid/researchhub-saas`

### 2. Verify GitHub App Permissions
1. Go to GitHub → Settings → Applications → Installed GitHub Apps
2. Find "Vercel" app
3. Ensure it has access to `researchhub-saas` repository
4. Check permissions include:
   - Repository contents (read)
   - Deployments (write)
   - Pull requests (read)
   - Commit statuses (write)

### 3. Check Repository Settings
1. Go to GitHub repository: `Mohmmed-alwakid/researchhub-saas`
2. Settings → Webhooks
3. Verify Vercel webhook is present and active
4. URL should be: `https://api.vercel.com/v1/integrations/deploy/...`

### 4. Test Auto-Deploy
After reconnection, test with a small change:
```bash
# Make a small change
echo "# Auto-deploy test" >> README.md
git add .
git commit -m "test: GitHub auto-deploy verification"
git push origin main
```

## Current Deployment Status
- **Latest**: `dpl_CH9QWKQ1DqfidR2x7xNjrjQE5uyo` (CLI deployment)
- **GitHub**: `dpl_Dv47ZNQu3uQxmcysRpAxoY3XduWk` (Last working auto-deploy)
- **Repository**: `Mohmmed-alwakid/researchhub-saas`
- **Branch**: `main`
