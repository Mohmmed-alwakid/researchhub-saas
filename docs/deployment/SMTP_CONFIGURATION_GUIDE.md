# 📧 SUPABASE SMTP CONFIGURATION GUIDE

**Date**: June 18, 2025  
**Objective**: Set up production-ready email flow for ResearchHub

## 🔧 **SMTP CONFIGURATION STEPS**

### **Step 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/wxpwxzdgdvinlbtnbgdf
2. Navigate to: **Authentication** → **Settings** → **SMTP Settings**

### **Step 2: SMTP Provider Options**

#### **Option A: Gmail SMTP (Recommended for testing)**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-gmail@gmail.com
SMTP Password: [App Password - not regular password]
```

#### **Option B: SendGrid (Recommended for production)**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [SendGrid API Key]
```

#### **Option C: AWS SES (Enterprise)**
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [AWS Access Key]
SMTP Password: [AWS Secret Key]
```

### **Step 3: Email Templates Configuration**

#### **Confirm Email Template**
```html
<h1>Welcome to ResearchHub!</h1>
<p>Hi {{ .Name }},</p>
<p>Thank you for signing up for ResearchHub. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Address</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
<p>Best regards,<br>The ResearchHub Team</p>
```

#### **Reset Password Template**
```html
<h1>Reset Your Password</h1>
<p>Hi {{ .Name }},</p>
<p>You requested to reset your password for ResearchHub. Click the link below to reset it:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Best regards,<br>The ResearchHub Team</p>
```

### **Step 4: Email Settings**
```
From Email: noreply@researchhub.com
From Name: ResearchHub
Reply To: support@researchhub.com
```

### **Step 5: Verification**
1. Test email sending from Supabase dashboard
2. Check spam folders
3. Verify email delivery and formatting

---

## 🔄 **ALTERNATIVE: Temporary Testing Configuration**

For immediate testing, we can temporarily disable email confirmation:

### **Quick Test Setup**
1. Supabase Dashboard → Authentication → Settings
2. **Disable**: "Enable email confirmations"
3. **Enable**: "Allow signups"
4. Test login immediately after registration

### **Re-enable for Production**
After testing, re-enable email confirmation for security.

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Phase 1: SMTP Setup**
- [ ] Choose SMTP provider
- [ ] Configure SMTP settings in Supabase
- [ ] Set up email templates
- [ ] Test email delivery

### **Phase 2: Application Integration**
- [ ] Verify email confirmation URLs work
- [ ] Test password reset flow
- [ ] Update frontend for email verification states
- [ ] Add resend verification functionality

### **Phase 3: Production Validation**
- [ ] Test with real email addresses
- [ ] Verify deliverability across providers
- [ ] Check spam folder placement
- [ ] Performance test email sending

---

*Configuration Guide - June 18, 2025*
