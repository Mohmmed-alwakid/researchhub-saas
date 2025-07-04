# 🗄️ Database Migration Application Guide

## Current Status
✅ **Database Connection**: Working  
✅ **API Endpoints**: Available  
✅ **Authentication**: Functional  
⚠️ **Recording Tables**: **NEED TO BE CREATED**

## 📋 Migration Process

### Step 1: Access Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Navigate to your project: `wxpwxzdgdvinlbtnbgdf`
3. Go to **SQL Editor** (left sidebar)

### Step 2: Execute Migration
1. Click **"New query"**
2. Copy the complete migration script from:
   `database-migrations/complete-screen-recording-migration.sql`
3. Paste into the SQL editor
4. Click **"Run"** to execute

### Step 3: Verify Migration
After running the migration, you should see:
- ✅ `recording_sessions` table created
- ✅ `recordings` table created  
- ✅ Indexes created for performance
- ✅ RLS policies applied for security
- ✅ Sample test data inserted

### Step 4: Test Success
Run the test again to verify:
```bash
node test-recording-api-complete.js
```

## 🔧 What the Migration Creates

### Tables
1. **`recording_sessions`**: Manages recording session lifecycle
   - Session metadata, settings, status tracking
   - Links to studies and participants

2. **`recordings`**: Stores actual recording data
   - Video files, metadata, cloud storage paths
   - Performance and quality metrics

### Security Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Role-based Access**: Researchers, participants, and admins have appropriate permissions
- **Secure APIs**: All endpoints require proper authentication

### Performance Features
- **Indexes**: Optimized queries for common operations
- **Triggers**: Automatic timestamp updates
- **JSON Storage**: Flexible metadata and settings storage

## 🚀 Expected Results After Migration

### ✅ Should Work
- Recording session creation
- Video upload and storage
- Authenticated access to recordings
- Study-based recording organization

### 🔧 Next Implementation Steps
- Video playback system
- Analytics integration
- Real-time recording monitoring

---

**Ready to apply migration? Follow the steps above and then re-run the test!**
