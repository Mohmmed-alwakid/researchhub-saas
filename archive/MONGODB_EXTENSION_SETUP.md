# 🍃 MongoDB Extension Setup for ResearchHub

## Option 1: Use MongoDB Extension with Local Connection

If you have MongoDB extension in VS Code, let's configure it:

### Step 1: Start Local MongoDB (if you have MongoDB installed)
If MongoDB is installed locally, start it with:
```bash
# Windows (if MongoDB is installed)
net start MongoDB

# Or if using MongoDB Community Edition
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### Step 2: Connect via VS Code MongoDB Extension
1. Open VS Code MongoDB Extension
2. Click "Add Connection"
3. Use connection string: `mongodb://localhost:27017`
4. Database name: `researchhub`

### Step 3: Create Required Collections
In the MongoDB extension, create these collections:
- `users`
- `studies` 
- `sessions`
- `recordings`

## Option 2: Quick MongoDB Setup with Docker

If you don't have MongoDB installed, let's use Docker:

```bash
# Start MongoDB with Docker
docker run -d --name researchhub-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=researchhub \
  -e MONGO_INITDB_ROOT_PASSWORD=researchhub2025secure \
  -e MONGO_INITDB_DATABASE=researchhub \
  mongo:latest
```

Connection string for Docker MongoDB:
```
mongodb://researchhub:researchhub2025secure@localhost:27017/researchhub?authSource=admin
```

## Option 3: Use MongoDB Extension with Atlas

If you prefer cloud MongoDB:
1. Open MongoDB extension in VS Code
2. Click "Connect with Connection String"
3. Use Atlas connection string
4. Browse and manage your database

## 🚀 Which Option Would You Prefer?

**Option A: Local MongoDB** (if you have it installed)
- Fastest for development
- No internet dependency
- Free

**Option B: Docker MongoDB** (if you have Docker)
- Easy setup
- Isolated environment
- Good for testing

**Option C: MongoDB Atlas** (cloud)
- Production-ready
- Managed service
- Free tier available

Let me know which option you'd like to use, and I'll help you configure it!
