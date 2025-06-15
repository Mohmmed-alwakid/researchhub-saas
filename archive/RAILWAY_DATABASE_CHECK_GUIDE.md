# 🚂 Railway Database Connection Check Guide

**Date**: June 15, 2025  
**Purpose**: Verify MongoDB database connection on Railway deployment

## 🎯 Quick Check Options

### Option 1: Automated Script (Recommended)
```powershell
# Run the comprehensive checker
.\check-railway-db.ps1 -RailwayUrl https://your-app.railway.app
```

### Option 2: Manual Health Check
```bash
# Simple health check via curl or browser
curl https://your-app.railway.app/api/health
```

### Option 3: Direct Node.js Test
```bash
# Run the detailed database test
node check-railway-database.cjs https://your-app.railway.app
```

## 📊 What Gets Checked

### ✅ API Health Status
- Server uptime and memory usage
- API response time
- Environment configuration
- Port and basic connectivity

### 🔌 Database Connection Status
- MongoDB connection state
- Database ping response
- Ready state indicators
- Host and database name verification

### 🔐 Authentication Service
- Auth endpoint accessibility
- API routing functionality
- Service integration status

## 🎯 Expected Healthy Response

When your Railway deployment is working correctly, you should see:

```json
{
  "status": "ok",
  "success": true,
  "message": "ResearchHub API is running",
  "timestamp": "2025-06-15T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 3600,
  "port": 3002,
  "database": {
    "status": "healthy",
    "isConnected": true,
    "readyState": 1,
    "host": "mongodb.railway.internal",
    "name": "researchhub",
    "lastChecked": "2025-06-15T10:30:00.000Z"
  }
}
```

## 🚨 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Symptoms**: `"status": "degraded"` or `"isConnected": false`

**Solutions**:
1. Check MongoDB service status in Railway dashboard
2. Verify `MONGODB_URI` environment variable:
   ```
   MONGODB_URI=${{ MongoDB.MONGO_URL }}/researchhub
   ```
3. Restart MongoDB service in Railway
4. Check Railway service logs for detailed errors

### Issue 2: API Not Responding
**Symptoms**: Timeout or connection refused errors

**Solutions**:
1. Check if Railway deployment is running
2. Verify correct Railway URL
3. Check deployment logs for startup errors
4. Ensure build completed successfully

### Issue 3: Authentication Service Issues
**Symptoms**: Auth endpoints returning errors

**Solutions**:
1. Verify JWT secrets are set in environment variables
2. Check CORS configuration for frontend URL
3. Ensure database is connected (auth requires DB)

## 🔧 Railway Environment Variables Checklist

Ensure these are set in your Railway project:

```bash
NODE_ENV=production
MONGODB_URI=${{ MongoDB.MONGO_URL }}/researchhub
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=https://researchhub-saas.vercel.app
ADMIN_EMAIL=admin@researchhub.com
ADMIN_PASSWORD=AdminPass123!
```

## 📱 Quick Health Check URLs

Replace `your-app.railway.app` with your actual Railway URL:

- **Main Health Check**: `https://your-app.railway.app/api/health`
- **API Documentation**: `https://your-app.railway.app/api/`
- **Auth Health**: `https://your-app.railway.app/api/auth/health`

## 🛠️ Advanced Troubleshooting

### Check Railway Service Status
1. Go to Railway dashboard
2. Navigate to your project
3. Check all services are "Active"
4. Review recent deployment logs

### Verify MongoDB Service
1. In Railway dashboard, find MongoDB service
2. Check it shows "Active" status
3. Note the internal URL (`mongodb.railway.internal:27017`)
4. Verify it's in the same project as your API

### Test Database Connection Directly
If you have MongoDB credentials, test direct connection:
```bash
# Set environment variable and test
$env:MONGODB_URI="your-mongodb-uri"
$env:TEST_DIRECT_CONNECTION="true"
node check-railway-database.cjs https://your-app.railway.app
```

## 📋 Deployment Verification Checklist

After deploying to Railway:

- [ ] API health endpoint returns 200 OK
- [ ] Database status shows "healthy"
- [ ] isConnected is true
- [ ] readyState is 1 (connected)
- [ ] No errors in Railway deployment logs
- [ ] Frontend can communicate with backend
- [ ] Authentication flow works end-to-end

## 🎯 Next Steps After Successful Check

1. **Monitor Deployment**: Set up monitoring for the health endpoint
2. **Test Frontend Integration**: Verify frontend can connect to Railway backend
3. **Test User Flows**: Create account, login, create study
4. **Performance Testing**: Check response times under load
5. **Backup Strategy**: Ensure MongoDB backups are configured

## 📞 Support Resources

- **Railway Documentation**: https://docs.railway.app/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Project Health Check**: `/api/health` endpoint
- **Railway Dashboard**: https://railway.app/dashboard

---

**Remember**: The health check endpoint is designed to work even if some services are degraded, so always check the specific `database.status` field for MongoDB connectivity status.
