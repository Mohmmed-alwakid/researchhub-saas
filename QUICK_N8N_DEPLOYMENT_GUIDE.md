# 🚀 **QUICK START: Deploy ResearchHub n8n Workflow**

## **Option 1: Cloud n8n (Fastest - Recommended)**

### **Step 1: Set Up n8n Cloud Account**
1. Go to [n8n.cloud](https://n8n.cloud)
2. Sign up for a free account
3. Verify your email
4. Access your n8n dashboard

### **Step 2: Import the Workflow**
1. In your n8n dashboard, click **"+ New Workflow"**
2. Click **"Import from JSON"** 
3. Copy the contents of `n8n-workflows/researchhub-study-cycle-testing-workflow.json`
4. Paste into the import box
5. Click **"Import"**

### **Step 3: Configure Slack Integration**
1. Click **"Settings"** → **"Credentials"**
2. Click **"+ Add Credential"**
3. Search for **"Slack"**
4. Choose **"Slack OAuth2 API"**
5. Follow the Slack app setup wizard

### **Step 4: Create Slack Channels**
In your Slack workspace, create:
- `#researchhub-monitoring` (for success notifications)
- `#researchhub-alerts` (for failure alerts)

### **Step 5: Test & Activate**
1. Click **"Execute Workflow"** to test manually
2. Check that notifications appear in Slack
3. Toggle **"Active"** to enable hourly scheduling

---

## **Option 2: Local Setup with Updated Node.js**

### **Update Node.js (Required)**
```powershell
# Install Node Version Manager for Windows
winget install CoreyButler.NVMforWindows

# Restart PowerShell, then:
nvm install 20.19.0
nvm use 20.19.0

# Verify version
node --version  # Should show v20.19.0

# Now install n8n
npm install -g n8n

# Start n8n
n8n start --tunnel
```

---

## **🧪 Test the Deployment**

### **Manual Test Commands**
```powershell
# Test the ResearchHub APIs that n8n will monitor
curl https://researchhub-saas.vercel.app/api/health
curl -X POST "https://researchhub-saas.vercel.app/api/auth-consolidated?action=health-check"
curl "https://researchhub-saas.vercel.app/api/research-consolidated?action=health-check"
curl "https://researchhub-saas.vercel.app/api/templates-consolidated?action=get-templates"
```

### **Expected Results**
- ✅ Each API should return status 200
- ✅ n8n workflow executes without errors
- ✅ Slack receives formatted notifications
- ✅ Hourly schedule activates automatically

---

## **🎯 Quick Validation Checklist**

- [ ] n8n account created and accessible
- [ ] Workflow imported successfully
- [ ] Slack credentials configured
- [ ] Slack channels created
- [ ] Manual execution test passed
- [ ] Slack notifications received
- [ ] Workflow activated for scheduling

---

## **⚡ What's Next?**

Once the first workflow is deployed and working:

1. **Monitor for 24 hours** to ensure stable operation
2. **Create additional workflows** for:
   - Study Creation Validation
   - User Registration Monitoring  
   - Database Health Monitoring
   - Performance Monitoring

---

**🎉 Ready to deploy? Start with n8n.cloud for the fastest setup!**
