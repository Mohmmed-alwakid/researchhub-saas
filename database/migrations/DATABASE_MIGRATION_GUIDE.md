# 🚀 Database Migration Guide - Screen Recording Tables

## ⚠️ ACTION REQUIRED: Apply Database Migration

The screen recording API is ready, but the database tables need to be created in Supabase.

### 📋 **Step-by-Step Instructions**

#### **1. Open Supabase SQL Editor**
- Go to: **https://supabase.com/dashboard/project/wxpwxzdgdvinlbtnbgdf/sql**
- You'll need to be logged into the Supabase dashboard

#### **2. Copy Migration SQL**
- Open the file: `database-migrations/complete-screen-recording-migration.sql`
- Copy the entire contents (all 300+ lines)

#### **3. Apply Migration**
- Paste the SQL into the Supabase SQL Editor
- Click **"Run"** to execute the migration
- Wait for completion (should take a few seconds)

#### **4. Verify Success**
You should see output similar to:
```
table_name          | row_count
--------------------|----------
recording_sessions  | 1
recordings         | 1
```

#### **5. Test Setup**
Run this command to verify everything works:
```bash
node test-screen-recording-setup.js
```

### 📊 **What the Migration Creates**

#### **Tables:**
- `recording_sessions` - Manages recording session lifecycle
- `recordings` - Stores recording data and metadata

#### **Security:**
- Row Level Security (RLS) policies for data protection
- User-based access control (participants, researchers, admins)

#### **Performance:**
- Indexes for fast queries
- Automatic timestamp updates
- Sample test data

#### **Features:**
- Cloud storage support (AWS S3, etc.)
- Video metadata tracking
- Session status management

### 🎯 **After Migration Complete**

Once the migration is applied successfully:

1. **✅ Database Ready**: Tables created with proper security
2. **✅ API Functional**: All recording endpoints will work
3. **✅ Testing Ready**: Can test end-to-end recording upload
4. **✅ Production Ready**: Foundation for cloud storage integration

### 🧪 **Test Commands After Migration**

```bash
# Test complete setup
node test-screen-recording-setup.js

# Test with browser interface
# Open: screen-recording-test.html

# Check API health
npm run dev:fullstack
# Then visit: http://localhost:3003/api/health
```

### 📱 **Browser Testing**

After migration, you can test the complete screen recording flow:
- Open `screen-recording-test.html` in your browser
- Click "Start Recording" to test screen capture
- Upload recordings will now save to the database
- View and manage recordings through the API

---

## 🔧 **Migration File Location**

The complete migration is in:
```
database-migrations/complete-screen-recording-migration.sql
```

This single file contains everything needed for screen recording functionality.
