# ResearchHub - User Research Platform (In Development)

**Status**: 🚧 **Under Active Development** - Not Production Ready  
**Completion**: ~35% of planned features implemented  
**Timeline**: 6-9 months to production-ready release

## 📋 Project Overview

ResearchHub is a comprehensive user research platform currently in development. The platform aims to enable researchers to conduct user testing studies, gather feedback, and analyze user behavior through screen recording, heatmaps, and analytics.

> **Important**: This project is currently in mid-development. Many features shown in the UI are incomplete or use mock data. Please see the [Feature Status](#feature-status) section below for accurate implementation details.

## ✅ Currently Working Features

### 🔐 Authentication System
- ✅ User registration and login
- ✅ Email verification with Supabase Auth
- ✅ Role-based access (Admin, Researcher, Participant)
- ✅ Session management and token refresh

### 👥 User Management  
- ✅ Admin user management interface
- ✅ User profile creation and editing
- ✅ Role assignment and permissions

### 📚 Study Management
- ✅ Basic study creation and editing
- ✅ Study metadata management
- ✅ Task definition interface
- ⚠️ Limited to basic functionality

### 💳 Payment System (Partial)
- ✅ Manual payment flow for bank transfers
- ✅ Basic subscription plan management
- ❌ Stripe integration incomplete

## 🚧 In Development / Not Working

### 🎬 Screen Recording
**Status**: Interface Only - No Actual Recording
- UI components exist but don't capture screen
- No WebRTC implementation
- No video storage or playback

### 📊 Analytics & Reporting
**Status**: Mock Data Only
- Charts and dashboards display sample data
- No real user interaction tracking
- No actual heatmap generation

### 🔄 Session Management
**Status**: Not Implemented
- No real-time session monitoring
- No live participant tracking
- No session replay functionality

### 📈 Advanced Analytics
**Status**: Simulated Data
- Performance metrics are estimated
- No behavioral analysis algorithms
- Data export not functional

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Supabase** for database and authentication
- **Vercel Functions** for serverless API
- **PostgreSQL** with Row Level Security

### Development
- **Local Development**: Full-stack environment with hot reload
- **Git Workflow**: Feature branch development
- **Testing**: Local testing interfaces and tools

## 🚀 Development Environment

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/researchhub.git
cd researchhub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials

# Start development environment
npm run dev:fullstack
```

### Development URLs
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3003
- **Database**: Supabase hosted

### Available Scripts
```bash
npm run dev:fullstack    # Start complete local environment (recommended)
npm run dev:client       # Frontend only
npm run dev:local        # Backend API only
npm run build           # Build for production
npm run test            # Run tests (when implemented)
```

## 📁 Project Structure

```
src/
├── client/              # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── stores/         # State management
├── shared/             # Shared types and utilities
└── server/             # Development server

api/                    # Vercel serverless functions
docs/                   # Project documentation
tests/                  # Test files and interfaces
```

## 🧪 Testing

### Test Accounts
**Use only these pre-configured test accounts:**

```
Participant: abwanwr77+participant@gmail.com / Testtest123
Researcher:  abwanwr77+Researcher@gmail.com / Testtest123  
Admin:       abwanwr77+admin@gmail.com / Testtest123
```

### Local Testing
1. Start development environment: `npm run dev:fullstack`
2. Open http://localhost:5175
3. Login with test accounts
4. Use provided test interfaces for specific feature testing

## 📋 Current Development Status

### Completed (35%)
- ✅ User authentication and management
- ✅ Basic study creation workflow
- ✅ Admin interface foundations
- ✅ Database structure and API endpoints
- ✅ Local development environment

### In Progress (40%)
- 🔄 Screen recording implementation
- 🔄 Real analytics pipeline
- 🔄 Payment system completion
- 🔄 Session management features

### Planned (25%)
- 📅 Real-time monitoring
- 📅 Advanced behavioral analytics
- 📅 Performance optimization
- 📅 Production deployment

## 🎯 Development Roadmap

### Phase 1 (Next 3 months)
- Implement actual screen recording with WebRTC
- Build real analytics pipeline to replace mock data
- Complete Stripe payment integration
- Add user interaction tracking

### Phase 2 (Months 4-6)
- Real-time session monitoring
- Advanced analytics and heatmap generation
- Session replay functionality
- Performance optimization

### Phase 3 (Months 7-9)
- Security audit and compliance
- Load testing and scalability
- Production deployment
- Documentation completion

## 🤝 Contributing

This project is currently in active development. Please read the development status before contributing.

### Development Guidelines
1. Check feature status before working on components
2. Focus on completing core functionality
3. Replace mock data with real implementations
4. Follow TypeScript best practices
5. Test thoroughly in local environment

### Reporting Issues
- Check if feature is actually implemented (not just UI)
- Use local development environment for testing
- Provide detailed reproduction steps

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Development Questions**: Create an issue
- **Feature Requests**: Use the issues template
- **Bug Reports**: Ensure you're testing implemented features

---

**Note**: This README reflects the actual project status as of June 2025. Previous documentation may have overstated completion levels. Always refer to this README for accurate feature status.
