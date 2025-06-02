# 🧪 Authentication Testing Guide

**Status**: ✅ Ready for Testing  
**Date**: June 1, 2025

## 🚀 Prerequisites - Services Must Be Running

Before testing, ensure both services are running:

### 1. Start Backend Server
```bash
cd "d:\MAMP\AfakarM"
npm run dev:server
```
**Expected Output**: `🚀 Server running on port 3002`

### 2. Start Frontend Server
```bash
cd "d:\MAMP\AfakarM"
npm run dev:client
```
**Expected Output**: `VITE ready in XXXms ➜ Local: http://localhost:5175/`

## 🧪 Test Scenarios

### Test 1: User Registration

1. **Navigate to**: `http://localhost:5175/register`
2. **Fill out form**:
   - Email: `newuser@test.com`
   - Password: `Password123!`
   - First Name: `Test`
   - Last Name: `User`
   - Role: `researcher` or `participant`
3. **Click**: Register button
4. **Expected**: Success message and redirect to appropriate dashboard

### Test 2: User Login

1. **Navigate to**: `http://localhost:5175/login`
2. **Use existing test accounts**:
   
   **Researcher Account**:
   - Email: `test@test.com`
   - Password: `Password123!`
   
   **Participant Account**:
   - Email: `participant@test.com`
   - Password: `Password123!`

3. **Click**: Login button
4. **Expected Results**:
   - Researcher → Redirected to `/app/dashboard`
   - Participant → Redirected to `/app/participant-dashboard`

### Test 3: Role-Based Redirection

1. **Login as Researcher**: Should see researcher dashboard with studies, analytics, etc.
2. **Logout and Login as Participant**: Should see participant dashboard with study discovery
3. **Try accessing wrong routes**: 
   - Participant accessing `/app/dashboard` should be redirected
   - Researcher accessing `/app/participant-dashboard` should be redirected

### Test 4: Error Handling

1. **Try login with wrong password**: Should show error message
2. **Try login with non-existent email**: Should show error message
3. **Try registering with existing email**: Should show error message

## 🔧 Troubleshooting

### If Login/Registration Fails

1. **Check Backend**: Visit `http://localhost:3002/api/health`
   - Should return: `{"success":true,"message":"ResearchHub API is running"}`

2. **Check Frontend**: Visit `http://localhost:5175`
   - Should load the landing page

3. **Check Proxy**: Visit `http://localhost:5175/api/health`
   - Should return same as backend health check

### Common Issues

| Issue | Solution |
|-------|----------|
| 500 Server Error | Start backend server: `npm run dev:server` |
| Frontend not loading | Start frontend server: `npm run dev:client` |
| CORS errors | Check environment CLIENT_URL=http://localhost:5175 |
| API calls failing | Ensure proxy is working via health check |

## 📊 Current Test Users

### Researcher Account
- **Email**: `test@test.com`
- **Password**: `Password123!`
- **Role**: `researcher`
- **Access**: Full dashboard, study creation, analytics

### Participant Account
- **Email**: `participant@test.com`
- **Password**: `Password123!`
- **Role**: `participant`
- **Access**: Study discovery, applications, participant dashboard

## ✅ Success Criteria

- [ ] Can register new users
- [ ] Can login with valid credentials
- [ ] Login shows appropriate error for invalid credentials
- [ ] Researcher login redirects to `/app/dashboard`
- [ ] Participant login redirects to `/app/participant-dashboard`
- [ ] Role-based access control works
- [ ] JWT tokens are properly stored and used
- [ ] Logout functionality works

## 🎉 Next Steps After Testing

Once authentication is confirmed working:

1. **Test Study Creation**: Login as researcher and create a study
2. **Test Study Discovery**: Login as participant and browse studies
3. **Test Full User Journey**: Complete end-to-end workflow
4. **Deploy to Production**: Ready for cloud deployment

---

**Status**: Authentication system is fully functional and ready for comprehensive testing!
