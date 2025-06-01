# ResearchHub - Troubleshooting Guide for Copilot

## 🚨 Common Issues & Solutions

### TypeScript Compilation Errors

#### Problem: "Cannot find module" errors
```bash
# Solution: Check import paths and file extensions
# Use absolute imports with @/ prefix
import { Component } from '@/client/components/Component';

# Verify tsconfig.json paths configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### Problem: Type errors in MongoDB models
```typescript
// Solution: Proper interface definitions
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'researcher' | 'participant';
}

// Use proper typing in controllers
const user = await User.findById(id) as IUser;
```

### Development Server Issues

#### Problem: Port conflicts (EADDRINUSE)
```bash
# Check what's using the ports
Get-NetTCPConnection -LocalPort 3002,5175

# Kill processes if needed
taskkill /PID <process_id> /F

# Or use different ports in package.json scripts
"dev:client": "vite --port 5176"
"dev:server": "nodemon src/server/index.ts --port 3003"
```

#### Problem: Frontend can't reach backend API
```typescript
// Check vite.config.ts proxy configuration
export default defineConfig({
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
});

// Verify backend CORS settings
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5175',
  credentials: true
}));
```

### Database Connection Issues

#### Problem: MongoDB connection fails
```typescript
// Check connection string format
const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/database';

// Add connection options
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
```

#### Problem: Mongoose schema validation errors
```typescript
// Ensure schema matches interface
const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['admin', 'researcher', 'participant'],
    default: 'participant'
  }
});
```

### Authentication Issues

#### Problem: JWT token validation fails
```typescript
// Check token format and secret
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

// Ensure consistent token extraction
const token = req.headers.authorization?.split(' ')[1];
if (!token) {
  return res.status(401).json({ success: false, error: 'No token provided' });
}
```

#### Problem: Refresh token not working
```typescript
// Check cookie configuration
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Verify cookie parsing middleware
app.use(cookieParser());
```

### Build and Deployment Issues

#### Problem: Vite build fails
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Check for missing dependencies
npm run build:client 2>&1 | grep "Cannot resolve"

# Verify Tailwind CSS configuration
# tailwind.config.js should include all content paths
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

#### Problem: TypeScript build fails
```bash
# Check tsconfig files
npx tsc --showConfig

# Build server with verbose output
npx tsc -p tsconfig.server.json --verbose

# Common fixes
# 1. Update import statements to use .js extensions for output
# 2. Check type definitions for third-party packages
# 3. Ensure all files are included in tsconfig include array
```

### Runtime Errors

#### Problem: "Cannot read property of undefined"
```typescript
// Use optional chaining and nullish coalescing
const userName = user?.firstName ?? 'Unknown';
const config = process.env.CONFIG ?? defaultConfig;

// Add proper type guards
if (user && user.role === 'admin') {
  // Safe to access admin properties
}
```

#### Problem: API requests failing with CORS errors
```typescript
// Backend: Ensure CORS allows credentials
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Frontend: Include credentials in requests
const response = await fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

### Performance Issues

#### Problem: Slow development server
```bash
# Reduce file watching
# In vite.config.ts
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  }
});

# Increase Node.js memory limit
"dev:server": "node --max-old-space-size=4096 ./node_modules/.bin/nodemon"
```

#### Problem: Large bundle size
```typescript
// Use dynamic imports for code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Check bundle analyzer
npm install --save-dev vite-bundle-analyzer
# Add to vite.config.ts for analysis
```

## 🔧 Debugging Commands

### Quick Health Checks
```bash
# Backend health
curl http://localhost:3002/api/health

# Frontend accessibility
curl http://localhost:5175

# Database connection test
node -e "require('mongoose').connect('your-mongodb-uri').then(() => console.log('DB OK'))"

# TypeScript compilation
npx tsc --noEmit

# Build test
npm run build
```

### Log Analysis
```typescript
// Add debug logging
console.log('🔍 Debug point:', { variable, request: req.body });

// Use proper error logging
try {
  // risky operation
} catch (error) {
  console.error('❌ Error in operation:', error);
  // Handle gracefully
}
```

### Environment Validation
```bash
# Check environment variables
echo $NODE_ENV
echo $MONGODB_URI
echo $JWT_SECRET

# Verify package versions
npm list --depth=0
```

## 🆘 Emergency Fixes

### Complete Reset
```bash
# Nuclear option - reset everything
rm -rf node_modules
rm package-lock.json
npm install
npm run build
npm run dev
```

### Port Reset
```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Reset ports in package.json
"dev:client": "vite --port 5176"
"dev:server": "nodemon src/server/index.ts --port 3003"
```

### Database Reset
```typescript
// Clear collections (development only)
await User.deleteMany({});
await Study.deleteMany({});

// Recreate indexes
await User.createIndexes();
await Study.createIndexes();
```

## 📋 Prevention Checklist

Before making changes:
- [ ] Run `npx tsc --noEmit` to check TypeScript
- [ ] Test API endpoints with curl/Postman
- [ ] Verify environment variables are set
- [ ] Check that both servers start without errors
- [ ] Validate database connection
- [ ] Test authentication flow
- [ ] Ensure build process works
