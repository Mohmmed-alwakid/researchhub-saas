# Vercel Function Consolidation Plan
*Reducing from 22 functions to 10 functions for Hobby plan compatibility*

## 🎯 Target Architecture (10 Functions)

### 1. **auth.js** (Consolidated Authentication)
- **Merge**: auth.js + auth-enhanced.js + auth-debug.js
- **Total Lines**: ~1,098 lines
- **Endpoints**: login, register, refresh, verify, debug, enhanced flows

### 2. **admin.js** (Keep as-is)
- **Current**: 1,753 lines
- **Endpoints**: User management, system administration

### 3. **studies.js** (Keep as-is) 
- **Current**: 1,137 lines
- **Endpoints**: Study CRUD, management, publishing

### 4. **applications.js** (Keep as-is)
- **Current**: 1,631 lines  
- **Endpoints**: Study application management

### 5. **templates.js** (Consolidated Templates)
- **Merge**: templates.js + templates-auth.js + templates-simple.js
- **Total Lines**: ~1,465 lines
- **Endpoints**: Template management, auth, simple operations

### 6. **payments.js** (Consolidated Payments & Wallets)
- **Merge**: payments-consolidated.js + wallets.js + wallets-simulated.js
- **Total Lines**: ~1,411 lines
- **Endpoints**: Payments, wallet management, simulated transactions

### 7. **user-profile.js** (Consolidated User Management)
- **Merge**: profile.js + user-enhanced.js
- **Total Lines**: ~347 lines
- **Endpoints**: Profile management, enhanced user operations

### 8. **system.js** (System Operations)
- **Merge**: health.js + dashboard.js + migration.js
- **Total Lines**: ~609 lines
- **Endpoints**: Health checks, dashboard data, migrations

### 9. **study-sessions.js** (Keep as-is)
- **Current**: 408 lines
- **Endpoints**: Study session management

### 10. **blocks.js** (Keep as-is)
- **Current**: 879 lines
- **Endpoints**: Study block management

## 🗑️ Files to Remove
- **templates-old.js** (909 lines) - Legacy code
- **points.js** (361 lines) - Move to system.js
- **subscriptions.js** (437 lines) - Move to payments.js

## ⚡ Implementation Steps

1. **Phase 1**: Create consolidated files
2. **Phase 2**: Test all endpoints locally
3. **Phase 3**: Deploy and verify
4. **Phase 4**: Remove old files
5. **Phase 5**: Update documentation

## 🎯 Benefits
- **Cost**: $0 vs $240/year
- **Performance**: Better cold start management
- **Maintenance**: Easier to manage 10 vs 22 files
- **Architecture**: Logical grouping of related functionality
