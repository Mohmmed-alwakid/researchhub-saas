# n8n Setup and Deployment Script for ResearchHub

## 🚀 Quick n8n Installation & Workflow Deployment

### **Option 1: Local n8n Installation (Recommended for Development)**

```powershell
# Install n8n globally via npm
npm install -g n8n

# Create n8n workspace directory
mkdir n8n-workspace
cd n8n-workspace

# Initialize n8n with ResearchHub configuration
n8n init --config-file=n8n-config.json

# Start n8n server
n8n start --tunnel
```

### **Option 2: Docker Installation (Production Ready)**

```powershell
# Create docker-compose.yml for n8n
docker-compose up -d

# Access n8n at http://localhost:5678
```

### **Option 3: Cloud n8n (Fastest Setup)**
1. Go to https://n8n.cloud
2. Sign up for free account
3. Import workflow JSON directly

---

## 📁 **Workflow Deployment Steps**

### **1. Copy Workflow File**
```powershell
# Ensure workflow is in accessible location
copy "n8n-workflows\researchhub-study-cycle-testing-workflow.json" ".\workflow.json"
```

### **2. Import via n8n Interface**
1. Open n8n (http://localhost:5678)
2. Click "+" → "Import from File"
3. Select `researchhub-study-cycle-testing-workflow.json`
4. Click "Import"

### **3. Configure Slack Credentials**
1. Go to Settings → Credentials
2. Add "Slack" credential
3. Use OAuth or Bot Token method
4. Test connection

### **4. Create Slack Channels**
Create these channels in your Slack workspace:
- `#researchhub-monitoring` (for success notifications)
- `#researchhub-alerts` (for failure alerts)

### **5. Activate Workflow**
1. Open the imported workflow
2. Click "Active" toggle to enable
3. Test with "Execute Workflow" button

---

## ⚙️ **n8n Configuration File**

Create `n8n-config.json`:

```json
{
  "database": {
    "type": "sqlite",
    "database": "n8n.sqlite"
  },
  "credentials": {
    "overwrite": {
      "endpoint": "http://localhost:5678"
    }
  },
  "endpoints": {
    "rest": "/api/v1",
    "webhook": "/webhook",
    "webhookTest": "/webhook-test"
  },
  "security": {
    "basicAuth": {
      "active": false
    }
  },
  "nodes": {
    "exclude": []
  },
  "executions": {
    "saveExecutionProgress": true,
    "saveDataManualExecutions": true
  }
}
```

---

## 🐳 **Docker Compose Configuration**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-researchhub
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=false
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-workflows:/home/node/.n8n/workflows
    networks:
      - n8n_network

volumes:
  n8n_data:

networks:
  n8n_network:
    driver: bridge
```

---

## 🧪 **Testing Your Deployment**

### **Manual Workflow Test**
1. Open n8n workflow
2. Click "Execute Workflow"
3. Check execution log
4. Verify Slack notifications

### **API Endpoint Validation**
```powershell
# Test each endpoint the workflow monitors
curl https://researchhub-saas.vercel.app/api/health
curl -X POST "https://researchhub-saas.vercel.app/api/auth-consolidated?action=health-check"
curl "https://researchhub-saas.vercel.app/api/research-consolidated?action=health-check"
curl "https://researchhub-saas.vercel.app/api/templates-consolidated?action=get-templates"
```

### **Slack Integration Test**
1. Send test message to both channels
2. Verify formatting appears correctly
3. Check emoji and formatting render properly

---

## 🔧 **Troubleshooting Common Issues**

### **n8n Won't Start**
```powershell
# Clear n8n cache
npm cache clean --force
# Reinstall n8n
npm uninstall -g n8n
npm install -g n8n
```

### **Workflow Import Fails**
- Check JSON syntax is valid
- Ensure file is UTF-8 encoded
- Try importing via copy-paste instead of file upload

### **Slack Notifications Don't Work**
- Verify Slack credentials are correct
- Check channel names match exactly
- Ensure bot has permission to post

### **API Tests Fail**
- Verify ResearchHub production site is accessible
- Check if APIs require authentication
- Validate URL endpoints are correct

---

## 📊 **Next Steps After Deployment**

1. **Monitor for 24 hours** to ensure stable operation
2. **Review Slack notifications** for formatting and content
3. **Adjust schedule** if hourly is too frequent/infrequent
4. **Add additional endpoints** as needed
5. **Set up escalation** for critical failures

---

## 🎯 **Success Metrics**

- ✅ n8n successfully installed and running
- ✅ Workflow imported without errors
- ✅ Manual execution completes successfully
- ✅ Slack notifications received in correct channels
- ✅ Hourly schedule activates automatically
- ✅ All 4 ResearchHub APIs respond correctly

---

**Once this is deployed, we'll move to creating the additional automation workflows for comprehensive ResearchHub monitoring!**
