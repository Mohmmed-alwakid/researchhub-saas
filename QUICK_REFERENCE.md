# ResearchHub - Quick Reference

> **Status**: 🚀 **PRODUCTION READY** - 100% Deployment Confidence

## Quick Commands

```bash
# Development
npm run dev          # Start both frontend and backend
npm run dev:client   # Frontend only (port 5173)
npm run dev:server   # Backend only (port 5000)

# Production Build
npm run build        # Build both frontend and backend
npm run start        # Start production server

# Docker Deployment
docker-compose up --build -d

# Health Check
curl http://localhost:5000/api/health
```

## Key URLs
- **Frontend**: http://localhost:5175 (Updated June 1, 2025)
- **Backend**: http://localhost:3002 (Updated May 31, 2025)
- **Health**: http://localhost:3002/api/health
- **Database**: MongoDB (configured in .env)

## Recent Updates (June 1, 2025)
- ✅ **Authentication Fix**: Login now properly redirects based on user roles
- ✅ **Component Consolidation**: Removed duplicate pages, kept enhanced versions
- ✅ **Architecture Guide**: Created COMPONENT_STRUCTURE_GUIDE.md to prevent future duplication
- ✅ **Single Source of Truth**: One primary version of each page component

## Deploy to Cloud
- **Railway**: `railway up`
- **Heroku**: `git push heroku main`
- **DigitalOcean**: Use App Platform
- **Docker**: Use provided docker-compose.yml

## Documentation
All detailed documentation moved to `/docs` folder and stored in memory.
Use the assistant to recall any specific deployment or technical details.

---
**Generated**: May 30, 2025 | **Status**: Ready for Production 🎉
