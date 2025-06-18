# 🧪 RESEARCHHUB TESTING RULES & TEST ACCOUNTS

**Date**: June 18, 2025  
**Status**: 📋 **MANDATORY TESTING GUIDELINES** - MUST FOLLOW EVERY TIME

## 🚨 **CRITICAL TESTING RULES - NO EXCEPTIONS**

### **✅ MANDATORY TEST ACCOUNTS - USE THESE ONLY**

**❌ DO NOT CREATE NEW ACCOUNTS - USE EXISTING ACCOUNTS ONLY ❌**

#### **1. Participant Account** 👤
```
Email:    abwanwr77+participant@gmail.com
Password: Testtest123
Role:     participant
Status:   MUST be confirmed/active in Supabase
```

#### **2. Researcher Account** 🔬
```
Email:    abwanwr77+Researcher@gmail.com  
Password: Testtest123
Role:     researcher
Status:   MUST be confirmed/active in Supabase
```

#### **3. Admin Account** ⚡
```
Email:    abwanwr77+admin@gmail.com
Password: Testtest123
Role:     admin
Setup:    MUST be set as admin via admin-setup endpoint
Status:   REQUIRED for admin testing
```

## 🔧 **TESTING PROCEDURES**

### **Password Reset Testing**
1. **ONLY use participant or researcher accounts for password reset testing**
2. **Test forgot password flow**: `/api/password?action=forgot`
3. **Test reset flow**: Follow email instructions (requires SMTP setup)
4. **Test change password**: `/api/password?action=change` (authenticated)

### **Authentication Testing**
1. **Login Test**: Use existing accounts ONLY - `/api/auth?action=login`
2. **Registration Test**: Only use `/api/auth?action=register` for NEW features testing  
3. **Role Testing**: Verify participant/researcher/admin permissions
4. **Session Testing**: Test token refresh `/api/auth?action=refresh` and logout `/api/auth?action=logout`

### **Account Management**
1. **Profile Updates**: Test with existing accounts via `/api/profile`
2. **Role Changes**: Only via admin endpoints `/api/admin-setup`
3. **Email Confirmation**: Manual via Supabase dashboard if needed

## 🛠️ **CONSOLIDATED API ENDPOINTS**
- **Authentication**: `/api/auth?action=[login|register|logout|refresh|status]`
- **Password Management**: `/api/password?action=[forgot|reset|change]`
- **Admin Setup**: `/api/admin-setup`
- **Profile Management**: `/api/profile`
- **Health Check**: `/api/health`
- **Database Check**: `/api/db-check`
- **Studies**: `/api/studies/`

## ⚠️ **MANDATORY RULES FOR ALL DEVELOPERS**

1. **NEVER create new test accounts**
2. **ALWAYS use the 3 specified accounts above**
3. **CONFIRM admin account is set up before admin testing**
4. **VERIFY all accounts are active in Supabase before testing**
5. **TEST password reset with participant/researcher accounts only**
6. **DOCUMENT any issues with these specific accounts**

## 🎯 **CURRENT STATUS & ACTIONS NEEDED**

### **Password Reset Issues (CURRENT FOCUS)**
- ❌ Password reset flow not working properly
- ✅ Endpoints created and consolidated: `/api/password?action=forgot|reset|change`
- ⏳ Need to test with specified accounts only
- ⏳ Admin account needs to be set up: `abwanwr+admin@gmail.com`

### **Next Testing Steps**
1. Set up admin account via `/api/admin-setup`
2. Test password reset flow with participant account
3. Test password reset flow with researcher account  
4. Verify all auth flows work with these accounts
5. Document any remaining issues

## 📞 **SUPPORT & TROUBLESHOOTING**
- Use Supabase dashboard to verify account status
- Check `/api/health` and `/api/db-check` for system status
- All testing must use these 3 accounts ONLY
- Report issues with specific account and endpoint details
