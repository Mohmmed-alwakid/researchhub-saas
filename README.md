# ResearchHub - User Research Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **🚧 DEVELOPMENT STATUS**: Early development stage - NOT production ready  
> **Last Updated**: June 20, 2025  
> **Build Status**: ✅ 0 TypeScript errors, Enhanced Study Builder Complete

## 🎯 Project Overview

ResearchHub is a modern SaaS platform for conducting user research studies, built with React, TypeScript, and Supabase. While the foundation is solid, many advanced features are still in development.

### ✅ Working Features (Production Ready)

- **Authentication System**: Complete JWT-based auth with role management
- **Study Builder**: Enhanced UI with task library, drag-and-drop, templates
- **Admin Dashboard**: User management, subscription handling
- **Database Integration**: Supabase with RLS security
- **Local Development**: Full-stack development environment
- **API Endpoints**: Core functionality with real database operations

### 🚧 In Development

- **Screen Recording**: UI implemented, backend integration pending
- **Analytics Dashboard**: Mock data, needs real analytics implementation
- **Session Replay**: Frontend ready, video processing needed
- **Payment Processing**: Stripe integration planned

### ❌ Not Yet Implemented

- Real-time collaboration features
- Advanced reporting and insights
- Mobile application
- Enterprise-grade scaling features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Mohmmed-alwakid/researchhub-saas.git
cd researchhub-saas

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start local development environment (RECOMMENDED)
npm run dev:fullstack
```

### Development URLs

- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3003
- **Database**: Connected to Supabase

### Test Accounts

```bash
# Admin
Email: abwanwr77+admin@gmail.com
Password: Testtest123

# Researcher  
Email: abwanwr77+Researcher@gmail.com
Password: Testtest123

# Participant
Email: abwanwr77+participant@gmail.com
Password: Testtest123
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Express.js style)
- **Database**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth (JWT + refresh tokens)
- **State Management**: Zustand + React Query
- **UI Components**: Custom accessibility-focused components
- **Deployment**: Vercel with GitHub integration

### Project Structure

```
src/
├── client/           # React frontend
│   ├── components/   # Reusable UI components
│   ├── pages/       # Route components
│   ├── services/    # API client services
│   └── utils/       # Utility functions
├── shared/          # Shared TypeScript types
└── types/           # Type definitions

api/                 # Vercel serverless functions
├── auth.js         # Authentication endpoints
├── studies.js      # Study management
├── admin.js        # Admin operations
└── health.js       # Health checks

docs/               # Comprehensive documentation
tests/              # Test files and interfaces
.github/            # GitHub workflows and templates
```

## 📖 Documentation

### Essential Guides

- **[Development Guide](.github/copilot-development-guide.md)** - Setup, patterns, and workflows
- **[API Reference](.github/copilot-api-reference.md)** - Current API endpoints
- **[Troubleshooting](.github/copilot-troubleshooting.md)** - Common issues and fixes
- **[Testing Guide](TESTING_RULES_MANDATORY.md)** - Testing procedures and accounts

### Project Documentation

- **[Project Status](PROJECT_STATUS_REALITY_CHECK.md)** - Current development status
- **[Feature Analysis](FEATURE_GAP_ANALYSIS.md)** - Detailed feature implementation
- **[Development Roadmap](REALISTIC_DEVELOPMENT_ROADMAP.md)** - Future development plans
- **[Study Builder Guide](STUDY_BUILDER_UX_ENHANCEMENT_COMPLETE.md)** - Enhanced study builder features

## 🛠️ Development

### Local Development (Recommended)

```bash
# Start complete local environment
npm run dev:fullstack
# This starts both frontend (5175) and backend (3003) with hot reload

# Individual components
npm run dev:client    # Frontend only
npm run dev:local     # Backend only
```

### Build and Deploy

```bash
# Type checking
npx tsc --noEmit

# Production build
npm run build

# Deploy to Vercel (automatic on push to main)
git push origin main
```

### Testing

```bash
# Integration tests
node final-integration-test.js

# Manual testing
# Open local-fullstack-test.html in browser
```

## 🔐 Security

- **Database**: Supabase Row Level Security (RLS) policies
- **Authentication**: JWT tokens with automatic refresh
- **API Security**: Token validation on protected endpoints
- **Input Validation**: Zod schemas on client and server
- **CORS**: Properly configured for multiple origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test locally with `npm run dev:fullstack`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Rules

- Always develop locally first with `npm run dev:fullstack`
- Use only the provided test accounts (no new account creation)
- Maintain TypeScript strict mode compliance
- Test all changes thoroughly before pushing

## 📊 Current Metrics

- **Build Status**: ✅ Passing (0 TypeScript errors)
- **Test Coverage**: Manual testing with provided accounts
- **Performance**: Local development optimized for speed
- **Security**: Supabase RLS + JWT authentication

## 🚀 Recent Achievements

**Study Builder UX Enhancement (June 2025)**

- ✅ Task Library Modal with templates and search
- ✅ Drag-and-drop task reordering
- ✅ Template preview system
- ✅ Real-time validation feedback
- ✅ Progress indicators
- ✅ Conditional recording options by study type
- ✅ Task editing modal (UI complete)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Comprehensive guides in `.github/` directory
- **Issues**: GitHub Issues for bug reports and feature requests
- **Development**: Local testing interfaces and debug tools included

---

**Note**: This project is actively being developed. Features and APIs may change. Always refer to the latest documentation and test thoroughly in the local development environment.