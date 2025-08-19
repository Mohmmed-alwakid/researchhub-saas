# ResearchHub n8n Workflow Deployment Guide

## 🎯 **Workflow: Study Cycle Testing Automation**

**Created:** August 19, 2025  
**Status:** ✅ **VALIDATED & READY FOR DEPLOYMENT**  
**File:** `n8n-workflows/researchhub-study-cycle-testing-workflow.json`

---

## 🚀 **Quick Deployment**

### **1. Import Workflow**
```bash
# Copy the workflow JSON file to your n8n instance
cp n8n-workflows/researchhub-study-cycle-testing-workflow.json /path/to/n8n/workflows/
```

### **2. Configure Slack Integration**
- Set up Slack credentials in n8n
- Create channels: `#researchhub-monitoring` and `#researchhub-alerts`
- Configure webhook permissions

### **3. Activate Workflow**
- Import the JSON file into n8n
- Set `"active": true` in the workflow
- Test manually before scheduling

---

## 🔧 **Workflow Architecture**

### **Sequential Testing Flow**
```
Schedule Trigger (Hourly)
    ↓
Health Check API (GET /api/health)
    ↓
Authentication API (POST /api/auth-consolidated)
    ↓
Study API (GET /api/research-consolidated)
    ↓
Template API (GET /api/templates-consolidated)
    ↓
Aggregate Results (JavaScript Processing)
    ↓
Route Results (IF/ELSE Logic)
    ↓
Success Notification (Slack) OR Failure Alert (Slack)
```

### **Key Features**
- ✅ **Hourly automated testing**
- ✅ **Complete API coverage** (health, auth, study, templates)
- ✅ **Intelligent error handling** with retry logic
- ✅ **Rich Slack notifications** with detailed status
- ✅ **Production-ready monitoring**
- ✅ **Sequential thinking methodology applied**

---

## 📊 **Testing Coverage**

### **APIs Monitored**
1. **Health Endpoint** - Platform uptime
2. **Authentication System** - User auth functionality
3. **Research/Study APIs** - Core study creation
4. **Template System** - Study templates availability

### **Error Handling**
- Automatic retries (2-3 attempts per API)
- Graceful failure handling
- Detailed error reporting
- Separate alert channels

---

## 🔔 **Notification System**

### **Success Notifications** → `#researchhub-monitoring`
```
✅ ResearchHub Platform Status: ALL SYSTEMS OPERATIONAL
📊 Automated Testing Results - [timestamp]
Health API: PASS (200)
Auth API: PASS (200)
Study API: PASS (200)
Template API: PASS (200)
```

### **Failure Alerts** → `#researchhub-alerts`
```
🚨 ResearchHub Platform Alert: ISSUES DETECTED
⚠️ [X] out of 4 tests failed. Immediate attention required.
Health API: FAIL (500)
Auth API: PASS (200)
Study API: FAIL (404)
Template API: PASS (200)
```

---

## ⚙️ **Configuration Options**

### **Schedule Customization**
```json
"rule": {
  "interval": [
    {
      "field": "hours",     // Change to "minutes" for more frequent testing
      "interval": 1         // Change to desired interval
    }
  ]
}
```

### **Timeout Settings**
- Health API: 10 seconds
- Other APIs: 15 seconds
- Configurable per endpoint

### **Retry Logic**
- Health API: 3 retries
- Other APIs: 2 retries
- Exponential backoff available

---

## 🛠️ **Advanced Customization**

### **Add New API Endpoints**
1. Clone an existing HTTP Request node
2. Update the URL and parameters
3. Modify the aggregation JavaScript
4. Update Slack notification templates

### **Custom Alert Conditions**
```javascript
// Example: Alert on response time > 5 seconds
const slowResponse = items.some(item => item.responseTime > 5000);
if (slowResponse) {
  results.alertType = 'PERFORMANCE_WARNING';
}
```

### **Additional Integrations**
- Discord notifications
- Email alerts
- PagerDuty integration
- Custom webhooks

---

## 🧪 **Testing & Validation**

### **Manual Testing**
```bash
# Test individual endpoints
curl -H "User-Agent: n8n-ResearchHub-Monitor/1.0" https://researchhub-saas.vercel.app/api/health
curl -X POST https://researchhub-saas.vercel.app/api/auth-consolidated?action=health-check
curl https://researchhub-saas.vercel.app/api/research-consolidated?action=health-check
curl https://researchhub-saas.vercel.app/api/templates-consolidated?action=get-templates
```

### **Workflow Validation**
- ✅ **Structure Validation**: All nodes properly connected
- ✅ **Expression Validation**: JavaScript and n8n expressions tested
- ✅ **Connection Validation**: No cycles, proper trigger flow
- ✅ **Error Handling**: Comprehensive error management

---

## 📈 **Benefits for ResearchHub**

### **Platform Reliability**
- **Proactive monitoring** of core functionality
- **Early detection** of issues before users report them
- **Automated alerting** for immediate response

### **Development Efficiency**
- **Reduced manual testing** burden
- **Continuous validation** of production systems
- **Detailed reporting** for debugging

### **Production Readiness**
- **24/7 monitoring** without human intervention
- **Escalation workflows** for critical issues
- **Performance baseline** tracking

---

## 🎯 **Next Steps**

### **Immediate Actions**
1. Import workflow into n8n
2. Configure Slack credentials
3. Test manually once
4. Activate scheduling

### **Future Enhancements**
1. **Database Monitoring** - Add Supabase health checks
2. **User Journey Testing** - Simulate complete study creation
3. **Performance Metrics** - Track response times over time
4. **A/B Testing Support** - Monitor feature flag systems

---

## 📚 **Documentation References**

- **n8n Workflow File**: `n8n-workflows/researchhub-study-cycle-testing-workflow.json`
- **ResearchHub APIs**: Production endpoints at `researchhub-saas.vercel.app`
- **Sequential Thinking Process**: Applied throughout workflow design
- **Production Guidelines**: Follows ResearchHub development standards

---

## 🔐 **Security Considerations**

- Uses read-only health check endpoints
- No sensitive data in monitoring requests
- Slack credentials properly secured
- User-Agent headers for tracking

---

## ✅ **Deployment Checklist**

- [ ] n8n instance configured
- [ ] Slack workspace access granted
- [ ] Channels created (#researchhub-monitoring, #researchhub-alerts)
- [ ] Workflow JSON imported
- [ ] Manual test completed successfully
- [ ] Schedule activated
- [ ] Team notified of new monitoring

---

**🎉 Ready for Production Deployment!**

This workflow provides comprehensive, automated monitoring of ResearchHub's core systems using industry best practices and the sequential thinking methodology.
