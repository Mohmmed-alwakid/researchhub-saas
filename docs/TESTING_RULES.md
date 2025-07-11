# 🧪 RESEARCHHUB TESTING RULES & TEST ACCOUNTS

**Date**: June 18, 2025  
**Status**: 📋 **MANDATORY TESTING GUIDELINES - FOLLOW EVERY TIME**

## 🚨 **CRITICAL TESTING RULES**

### **✅ MANDATORY TEST ACCOUNTS - ONLY USE THESE**

**⚠️ NEVER CREATE NEW ACCOUNTS - USE ONLY THESE THREE:**

#### **1. Participant Account** 👤
```
Email:    abwanwr77+participant@gmail.com
Password: Testtest123
Role:     participant
Status:   Must be confirmed in Supabase
```

#### **2. Researcher Account** 🔬
```
Email:    abwanwr77+Researcher@gmail.com  
Password: Testtest123
Role:     researcher
Status:   Must be confirmed in Supabase
```

#### **3. Admin Account** ⚡
```
Email:    abwanwr+admin@gmail.com
Role:     admin
Setup:    Must be set as admin via Supabase dashboard
Status:   Special admin privileges required
```

## 🔧 **ACCOUNT SETUP REQUIREMENTS**

### **Before Testing - Verify:**
1. **All accounts exist in Supabase Auth**
2. **All accounts are email confirmed** 
3. **Admin account has admin role in profiles table**
4. **Passwords are exactly: Testtest123**

## 🔧 **TESTING PROCEDURES**

### **Password Reset Testing**
1. **Test forgot password**: Use participant or researcher account
2. **Test reset flow**: Follow email instructions (if SMTP configured)
3. **Test change password**: Use authenticated endpoint

### **Authentication Testing**
1. **Login Test**: Use existing accounts only
2. **Role Testing**: Verify participant/researcher/admin permissions
3. **Session Testing**: Test token refresh and logout

### **Account Management**
1. **Profile Updates**: Test with existing accounts
2. **Role Changes**: Only via admin endpoints
3. **Email Confirmation**: Manual via Supabase dashboard if needed

## 🛠️ **NEW ENDPOINTS ADDED**

### **Password Management** 
```
✅ POST /api/forgot-password     - Request password reset
✅ POST /api/reset-password      - Confirm password reset with tokens
✅ POST /api/change-password     - Change password (authenticated)
```

### **Admin Management**
```
✅ GET  /api/admin-setup         - View test account info
✅ POST /api/admin-setup         - Setup admin or create test accounts
```

## 📋 **TESTING CHECKLIST**

### **Before Testing**
- [ ] Verify test accounts exist in Supabase
- [ ] Confirm emails if needed via dashboard
- [ ] Set admin role for admin account

### **Password Reset Tests**
- [ ] Test forgot password with participant account
- [ ] Test forgot password with researcher account  
- [ ] Test invalid email handling
- [ ] Test password reset confirmation (if tokens available)
- [ ] Test change password while authenticated

### **Authentication Tests**
- [ ] Login with participant account
- [ ] Login with researcher account
- [ ] Login with admin account (after setup)
- [ ] Test invalid credentials
- [ ] Test unconfirmed email handling

### **Role-Based Tests**
- [ ] Participant permissions
- [ ] Researcher permissions  
- [ ] Admin permissions
- [ ] Cross-role access restrictions

## 🚀 **QUICK SETUP COMMANDS**

### **Setup Admin Account**
```bash
POST https://researchhub-saas.vercel.app/api/admin-setup
Body: {
  "action": "setup_admin",
  "email": "abwanwr+admin@gmail.com"
}
```

### **Create Test Accounts** 
```bash
POST https://researchhub-saas.vercel.app/api/admin-setup
Body: {
  "action": "create_test_accounts"
}
```

### **Test Password Reset**
```bash
POST https://researchhub-saas.vercel.app/api/forgot-password
Body: {
  "email": "abwanwr77+participant@gmail.com"
}
```

### **Test Login**
```bash
POST https://researchhub-saas.vercel.app/api/login
Body: {
  "email": "abwanwr77+participant@gmail.com",
  "password": "Testtest123"
}
```

## ⚠️ **IMPORTANT NOTES**

1. **Email Confirmation**: May need manual confirmation in Supabase dashboard
2. **Password Reset**: Requires SMTP setup for full email flow
3. **Admin Setup**: Must be done via API or dashboard
4. **Rate Limiting**: Supabase has built-in rate limiting (49 second cooldown)

## 🎯 **COMPLIANCE**

**ALWAYS follow these rules:**
- ✅ Use specified test accounts only
- ✅ No new test account creation
- ✅ Test all password reset functionality
- ✅ Verify role-based permissions
- ✅ Check email confirmation flows

**This ensures consistent testing and prevents account pollution.**

---

*Testing Rules Established: June 18, 2025*  
*Status: 📋 Mandatory compliance for all testing*
