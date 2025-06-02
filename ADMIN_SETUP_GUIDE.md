# 👤 Admin Account Setup Guide

## 🎯 Overview
This guide covers setting up the initial super admin account for ResearchHub deployment.

## 🔧 Quick Setup (5 minutes)

### Step 1: Configure Environment Variables
Add these to your deployment platform (Railway, Vercel, Render, etc.):

```bash
# Required Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=Your
ADMIN_LAST_NAME=Name
ADMIN_ORGANIZATION=Your Organization
```

### Step 2: Deploy Application
The admin account is automatically created during first startup.

### Step 3: Verify Creation
Check deployment logs for:
```
✅ Super admin account created successfully!
📧 Email: admin@yourdomain.com
```

### Step 4: Login & Secure
1. Visit your app: `https://your-app.com/login`
2. Login with your admin credentials
3. **Immediately change password** in admin settings
4. Verify all admin functions work

## 🛡️ Security Best Practices

### Password Requirements
- **Minimum 8 characters**
- **Mix of uppercase, lowercase, numbers, symbols**
- **Avoid common passwords**
- **Change default password immediately after first login**

### Email Configuration
- **Use a real email address** you can access
- **Enable 2FA** if available in your email provider
- **Monitor for suspicious login attempts**

### Admin Account Management
- **Limit number of super admin accounts**
- **Use regular admin accounts for daily operations**
- **Log all admin activities**
- **Regular password rotation**

## 🔍 Troubleshooting

### Admin Account Not Created
If the admin account isn't created automatically:

1. **Check environment variables** are set correctly
2. **Check deployment logs** for error messages
3. **Verify database connection** is working
4. **Manual creation** via MongoDB (see below)

### Manual Admin Creation
If automatic creation fails, create manually via MongoDB:

```javascript
// Connect to MongoDB and run:
use researchhub

db.users.insertOne({
  email: "admin@yourdomain.com",
  password: "$2a$12$your_bcrypt_hashed_password",
  firstName: "Admin",
  lastName: "User",
  role: "super_admin",
  organization: "Your Organization",
  status: "active",
  isVerified: true,
  isEmailVerified: true,
  profile: {
    isOnboardingComplete: true,
    preferences: {
      emailNotifications: true,
      marketingEmails: false,
      language: "en",
      timezone: "UTC"
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Can't Login
If you can't login with admin credentials:

1. **Check credentials** match environment variables exactly
2. **Check database** for user existence:
   ```javascript
   db.users.findOne({email: "admin@yourdomain.com"})
   ```
3. **Reset password** via MongoDB if needed
4. **Check application logs** for authentication errors

## 📊 Admin Roles & Permissions

### Super Admin (`super_admin`)
- **Full system access**
- **Create/delete admin accounts**
- **Manage all studies and users**
- **System configuration**
- **Billing and subscription management**

### Admin (`admin`)
- **Manage users in their organization**
- **Create/manage studies**
- **View analytics and reports**
- **Limited system configuration**

### Researcher (`researcher`)
- **Create/manage own studies**
- **View own analytics**
- **Manage own participants**

### Participant (`participant`)
- **Participate in studies**
- **View own participation history**

## 🚀 Post-Setup Actions

### Immediate Actions (First 24 hours)
- [ ] Login with admin credentials
- [ ] Change default password
- [ ] Update admin profile information
- [ ] Test key system functions
- [ ] Create additional admin accounts if needed

### Ongoing Management
- [ ] Regular password updates
- [ ] Monitor admin activity logs
- [ ] Review user permissions quarterly
- [ ] Backup admin account access methods

## 📞 Support

### Common Issues
- **"Admin not found"**: Check environment variables and redeploy
- **"Invalid credentials"**: Verify password matches exactly
- **"Access denied"**: Check user role is `super_admin`

### Debug Commands
```bash
# Check environment variables
echo $ADMIN_EMAIL
echo $ADMIN_PASSWORD

# Check database connection
curl https://your-app.com/api/health

# Check admin user exists
# (Use MongoDB Compass or CLI to query users collection)
```

### Contact Support
If you need help with admin setup:
1. Check deployment logs first
2. Verify all environment variables are set
3. Test database connectivity
4. Review this guide completely

## 🔗 Related Documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [User Management](./docs/USER_MANAGEMENT.md)
- [Permission System](./docs/PERMISSION_SYSTEM.md)
- [Security Guide](./docs/SECURITY_GUIDE.md)
