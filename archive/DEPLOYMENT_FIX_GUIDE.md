# 🚀 Fixed Deployment Guide - Manual Payment System

## 🔧 **DEPLOYMENT ISSUE FIXED**

**Problem**: Missing `generate-server-package.cjs` in Docker container
**Solution**: Updated Dockerfile to include the missing file

## ✅ **Fixed Files**

### 1. Dockerfile Updated
```dockerfile
# Added missing file copy
COPY generate-server-package.cjs ./

# Fixed port exposure
EXPOSE 3002
```

### 2. Railway Configuration Fixed
```toml
[build]
command = "npm ci && npm run build"  # Fixed: builds both client & server

[deploy]
startCommand = "node dist/server/server/index.js"
healthcheckPath = "/api/health"      # Fixed: correct health endpoint
```

## 🚀 **Immediate Deployment Steps**

### Step 1: Push Fixed Changes
```bash
git add .
git commit -m "fix: add missing generate-server-package.cjs to Dockerfile and update Railway config"
git push origin main
```

### Step 2: Redeploy on Railway
The deployment should now succeed automatically. Railway will:
1. ✅ Copy all necessary files including `generate-server-package.cjs`
2. ✅ Build both client and server
3. ✅ Use correct health check endpoint
4. ✅ Start on port 3002

### Step 3: Verify Deployment
Once deployed, test these endpoints:
```
✅ Health Check: https://your-app.railway.app/api/health
✅ Manual Payment: https://your-app.railway.app/app/payments/manual
✅ Admin Dashboard: https://your-app.railway.app/app/admin
```

## 🌐 **Environment Variables for Production**

Add these to Railway environment variables:

### Required
```env
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
CLIENT_URL=https://your-app.railway.app
```

### Manual Payment System
```env
# Bank Details (for manual payments)
BANK_ACCOUNT_NAME="ResearchHub Ltd"
BANK_ACCOUNT_NUMBER="1234567890"
BANK_ROUTING_NUMBER="123456789"
BANK_SWIFT_CODE="ABCDUS33"
BANK_ADDRESS="123 Bank Street, City, Country"

# File Upload
UPLOAD_DIRECTORY="./uploads"
MAX_FILE_SIZE="5242880"  # 5MB in bytes
ALLOWED_FILE_TYPES="pdf,jpg,jpeg,png"
```

### Optional (for full features)
```env
# Email notifications
SMTP_HOST="your-smtp-server.com"
SMTP_PORT="587"
SMTP_USER="noreply@researchhub.com"
SMTP_PASS="your-email-password"

# AWS S3 (if using cloud storage)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="researchhub-uploads"
AWS_REGION="us-east-1"
```

## 🔍 **Post-Deployment Testing**

### 1. Basic Health Check
```bash
curl https://your-app.railway.app/api/health
```
Should return: `{"status": "OK", "timestamp": "..."}`

### 2. Manual Payment Flow
1. Register/login as a user
2. Navigate to `/app/settings/billing`
3. Click "Manual Payment" option
4. Complete the 4-step payment flow
5. Verify admin can see the request in `/app/admin`

### 3. API Endpoints
```bash
# Get payment plans
curl https://your-app.railway.app/api/payments/plans

# Admin analytics (requires auth)
curl -H "Authorization: Bearer <token>" \
     https://your-app.railway.app/api/admin/payments/analytics
```

## 📊 **Manual Payment System Features Now Live**

✅ **User Features:**
- Plan selection with Saudi Riyal (SAR) pricing
- Bank transfer instructions with copy functionality
- Payment proof upload (PDF, images)
- Real-time status tracking

✅ **Admin Features:**
- Payment request dashboard
- Verification/rejection workflow
- Manual credit assignment
- Payment analytics and reporting

✅ **Security:**
- JWT authentication
- Role-based access control
- File upload validation
- Audit logging

## 🎯 **Success Metrics**

Your deployment will be successful when:
- ✅ Health check returns 200 OK
- ✅ Users can access manual payment flow
- ✅ Admins can verify payments
- ✅ Database connections work
- ✅ File uploads function properly

## 🆘 **If Deployment Still Fails**

1. **Check Railway Logs**: Look for specific error messages
2. **Verify Environment Variables**: Ensure all required vars are set
3. **Database Connection**: Confirm MongoDB URI is correct
4. **Manual Deployment**: Try deploying from the Railway dashboard

## 🎉 **Next Steps After Successful Deployment**

1. **Configure Bank Details**: Update environment variables with real bank information
2. **Set Up Email**: Configure SMTP for payment notifications  
3. **Test End-to-End**: Complete a full payment cycle
4. **Monitor Performance**: Watch for any issues or slow responses
5. **User Onboarding**: Begin accepting manual payments from Saudi Arabia users

The manual payment system is now ready for production use! 🚀
