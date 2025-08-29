# Development Server Configuration Guide

## 🚀 Quick Start

### Start Development Server
```bash
npm run dev:fullstack
```

This will:
- ✅ Start backend API on `http://localhost:3003`
- ✅ Start frontend on `http://localhost:5175`
- ✅ Automatically clear demo data on startup
- ✅ Use fallback authentication for development

## 🔧 Configuration Details

### Environment Setup
The development server is configured to work locally without requiring Supabase credentials:

**Backend API**: `http://localhost:3003`
**Frontend**: `http://localhost:5175`

### Authentication (Development Mode)
- Uses fallback token system for development
- Admin access: `fallback-token-admin-admin-admin@example.com`
- Researcher access: `fallback-token-researcher-researcher-researcher@example.com`
- No real Supabase authentication required

### Data Management

#### Demo Data Clearing
- **Automatic**: Demo data is cleared when the server starts
- **Manual**: Call `/api/research-consolidated?action=clear-demo-data`
- Only works in development/staging (blocked in production)

#### Study Storage
- Development uses local file storage: `testing/data/studies.json`
- Studies persist between server restarts
- Real Supabase can be used if credentials are provided

## 🛠 API Endpoints

### Research API (`/api/research-consolidated`)
- `?action=get-studies` - List all studies
- `?action=create-study` - Create new study
- `?action=get-study&id={id}` - Get specific study
- `?action=clear-demo-data` - Clear demo data (dev only)

### Admin API (`/api/admin-consolidated`)
- `?action=users` - List all users
- `?action=overview` - Admin dashboard overview

### Authentication API (`/api/auth-consolidated`)
- Uses fallback authentication in development
- Supports real Supabase auth if configured

## 🐛 Troubleshooting

### Issue: Studies not appearing after launch
**Cause**: Studies are filtered by creator_id in researcher view
**Solution**: Ensure user authentication token includes correct user ID

### Issue: Admin users API returning 400 error
**Cause**: API was expecting subAction parameter
**Fixed**: Now handles `action=users` directly

### Issue: Demo data cluttering studies
**Solution**: Automatic clearing on server start (implemented)

## 🔄 Development Workflow

### 1. Start Server
```bash
npm run dev:fullstack
```

### 2. Access Application
- **Frontend**: http://localhost:5175
- **Backend Health**: http://localhost:3003/api/health
- **Admin Panel**: http://localhost:5175/app/admin

### 3. Test Authentication
Use these test accounts:
- **Admin**: `admin@example.com` / `password123`
- **Researcher**: `researcher@example.com` / `password123`
- **Participant**: `participant@example.com` / `password123`

### 4. Clear Demo Data (if needed)
```bash
curl "http://localhost:3003/api/research-consolidated?action=clear-demo-data" \
  -H "Authorization: Bearer fallback-token-admin-admin-admin@example.com"
```

## 📝 Configuration Files

### Key Development Files
- `scripts/development/local-full-dev.js` - Main development server
- `api/research-consolidated.js` - Studies API with demo data clearing
- `api/admin-consolidated.js` - Admin API with user management
- `api/auth-consolidated.js` - Authentication with fallback support

### Environment Variables (Optional)
```env
# Supabase (optional - fallback will be used if not provided)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development Mode
NODE_ENV=development
```

## 🚨 Production Differences

### Production Environment
- Uses real Supabase authentication
- Demo data clearing is disabled
- Persistent database storage
- Enhanced security headers

### Development Environment
- Fallback authentication system
- Local file storage
- Auto demo data clearing
- CORS enabled for all origins

## 📊 Testing & Validation

### Health Check
```bash
curl http://localhost:3003/api/health
```

### Studies API Test
```bash
curl "http://localhost:3003/api/research-consolidated?action=get-studies" \
  -H "Authorization: Bearer fallback-token-researcher-researcher-researcher@example.com"
```

### Admin API Test
```bash
curl "http://localhost:3003/api/admin-consolidated?action=users" \
  -H "Authorization: Bearer fallback-token-admin-admin-admin@example.com"
```

## 🔄 Updates Made (August 19, 2025)

### Fixed Issues
1. ✅ **Admin users API 400 error** - Fixed parameter handling
2. ✅ **Studies not appearing** - Verified creator_id association
3. ✅ **Demo data clearing** - Added automatic clearing on startup
4. ✅ **Development configuration** - Ensured all APIs work locally

### New Features
1. ✅ **Auto demo data clearing** on server start
2. ✅ **Manual demo data clearing** endpoint
3. ✅ **Improved error handling** in admin API
4. ✅ **Enhanced development documentation**

---

**Last Updated**: August 19, 2025
**Configuration**: Development Server Optimized
**Status**: All systems operational ✅
