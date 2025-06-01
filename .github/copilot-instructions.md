# ResearchHub - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## 🎯 Project Status: PRODUCTION READY
**Last Updated**: June 1, 2025  
**Status**: ✅ 100% Deployment Ready - TypeScript Migration Complete  
**Build Status**: ✅ 0 TypeScript errors, all systems operational

## 📋 Project Overview
ResearchHub is a comprehensive SaaS platform for user testing research, enabling researchers to conduct studies, gather feedback, and analyze user behavior through screen recording, heatmaps, and analytics.

### Current Implementation Status
- ✅ **Authentication System**: JWT + refresh tokens fully implemented
- ✅ **Study Builder**: Drag-and-drop interface completed
- ✅ **Role-Based Access**: Admin/Researcher/Participant roles implemented
- ✅ **Screen Recording**: WebRTC-based recording infrastructure ready
- ✅ **Analytics Dashboard**: Charts and data visualization components
- ✅ **Payment Integration**: Stripe setup with subscription models
- ✅ **Real-time Features**: Socket.io for live study sessions

## 🛠️ Tech Stack (Verified Working)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + MongoDB + Mongoose
- **Authentication**: JWT tokens + refresh tokens
- **UI Components**: Custom component library with accessibility
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io for live features
- **Deployment**: Docker + Docker Compose ready

## 📁 File Organization (Updated)
- `/src/client` - React frontend components and pages
- `/src/server` - Express.js API and services
- `/src/shared` - Shared types and utilities between client/server
- `/src/database` - MongoDB models and schemas
- `/tests` - Unit and integration tests
- `/docs` - Comprehensive project documentation
- `/uploads` - File upload directory for studies

## 🔧 Development Environment
### Port Configuration (Updated May 31, 2025)
- **Frontend**: `http://localhost:5175` (Vite dev server)
- **Backend**: `http://localhost:3002` (Express API)
- **Health Check**: `http://localhost:3002/api/health`

### Essential Commands
```bash
# Development (both servers)
npm run dev

# Individual servers
npm run dev:client    # Frontend only
npm run dev:server    # Backend only

# Production build
npm run build         # Build both
npm run start         # Start production server

# TypeScript validation
npx tsc --noEmit      # Should return 0 errors

# Docker deployment
docker-compose up --build -d
```

## 💻 Code Conventions & Best Practices
### TypeScript Guidelines
- **Strict mode enabled**: All code must pass strict TypeScript checks
- **No implicit any**: Explicit typing required for all variables
- **Null safety**: Use optional chaining and nullish coalescing
- **Import organization**: Use absolute imports via `@/` for src directory

### React Component Patterns
```tsx
// Preferred: Functional components with TypeScript
interface ComponentProps {
  data: DataType;
  onUpdate: (data: DataType) => void;
}

export const Component = ({ data, onUpdate }: ComponentProps) => {
  // Implementation
};
```

### Error Handling
```typescript
// API responses - always use this pattern
try {
  const response = await apiCall();
  return { success: true, data: response };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly message' };
}
```

### Form Validation
- Use **Zod schemas** for all form validation
- Implement validation on both client and server
- Use React Hook Form for form management

## 🔐 Security Implementation
- **Input Validation**: Zod schemas on client + server
- **Authentication**: JWT with httpOnly refresh tokens
- **Authorization**: Role-based middleware implemented
- **CORS**: Configured for multiple origins
- **Rate Limiting**: Implemented on sensitive endpoints
- **SQL Injection**: Using Mongoose for parameterized queries

## 🚀 Deployment Configuration
### Environment Variables Required
```bash
# Core
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
JWT_REFRESH_SECRET=strong-refresh-key
CLIENT_URL=https://your-domain.com

# Optional (for full features)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Build Commands for Cloud Deployment
```json
{
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build --mode production",
  "build:server": "tsc -p tsconfig.server.json",
  "start": "node dist/server/server/index.js"
}
```

## 🧪 Testing Strategy
- **Health Check**: `/api/health` endpoint for monitoring
- **Authentication Flow**: Complete login/register/refresh cycle
- **Study Creation**: End-to-end study builder functionality
- **Build Verification**: Both client and server must build successfully

## 📚 Key Documentation References
- `PROJECT_MEMORY_BANK.md` - Complete project history and status
- `QUICK_REFERENCE.md` - Essential commands and URLs
- `docs/FINAL_DEPLOYMENT_STATUS.md` - Latest deployment information
- `docs/TYPESCRIPT_COMPLETION_REPORT.md` - TypeScript migration details

## ⚠️ Important Notes for Development
1. **Always run TypeScript check** before committing: `npx tsc --noEmit`
2. **Port conflicts**: Backend moved from 5000 to 3002 (May 31, 2025)
3. **Study creation flow**: Fully functional as of May 31, 2025
4. **Accessibility**: All forms have proper label associations
5. **Database**: MongoDB connection configured and tested

## 🎯 Current Development Focus
- **Immediate**: Ready for production deployment
- **Next Phase**: Advanced analytics features, enhanced UI/UX
- **Monitoring**: Health endpoints and error tracking ready
