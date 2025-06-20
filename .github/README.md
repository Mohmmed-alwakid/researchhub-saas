# GitHub Copilot Instructions for ResearchHub

## ⚠️ Project Status: UNDER DEVELOPMENT - NOT PRODUCTION READY
**Last Updated**: December 28, 2024  
**Status**: 🚧 Early Development Stage - Major Features Missing  

This directory contains comprehensive Copilot instruction files to guide AI-assisted development for the ResearchHub project.

## 📁 Instruction Files Overview

### Core Instructions
- **`copilot-instructions.md`** - Main project overview, tech stack, and coding conventions ⭐ **PRIMARY FILE**
- **`copilot-development-guide.md`** - Development workflow, architecture patterns, and common code examples
- **`copilot-api-reference.md`** - Current API endpoint documentation (limited implementation)
- **`copilot-troubleshooting.md`** - Common issues, debugging commands, and emergency fixes
- **`copilot-testing-deployment.md`** - Testing strategies and local development setup

## 🎯 How to Use These Instructions

### For GitHub Copilot
GitHub Copilot automatically reads the main `copilot-instructions.md` file when making suggestions. The additional files provide detailed context for specific development scenarios.

### For Copilot Chat
Reference specific instruction files in your chat queries:

```bash
@copilot What's the authentication flow according to the API reference?
@copilot How do I troubleshoot TypeScript errors based on the troubleshooting guide?
@copilot Show me the current project status and limitations.
```

### For VS Code Extensions
These instructions work with various AI coding assistants and provide comprehensive context about:

- Project structure and conventions
- Current API endpoints (limited implementation)
- Common development patterns
- Troubleshooting procedures
- Local development workflows

## 🔄 Maintenance

These instruction files should be updated when:

- ✅ New features are added to the project
- ✅ API endpoints change or are added
- ✅ Development workflow changes
- ✅ New troubleshooting scenarios are discovered
- ✅ Project status evolves

**Last Updated**: December 28, 2024  
**Project Status**: Under Development - Many Features Incomplete

## 📋 Quick Reference

### Project Essentials

- **Frontend**: <http://localhost:5175> (React + TypeScript + Vite)
- **Backend**: <http://localhost:3003> (Express.js + real Supabase DB)
- **Health Check**: <http://localhost:3003/api/health>
- **Build Command**: `npm run build` (0 TypeScript errors)
- **Dev Command**: `npm run dev:fullstack` (recommended for local development)

### Key Documentation

- `PROJECT_MEMORY_BANK.md` - Complete project history
- `QUICK_REFERENCE.md` - Essential commands and URLs
- `PROJECT_STATUS_REALITY_CHECK.md` - Honest current project status
- `FEATURE_GAP_ANALYSIS.md` - Missing and incomplete features
- `REALISTIC_DEVELOPMENT_ROADMAP.md` - Future development plans

## � Current Status
The ResearchHub project is **under active development** with:

- ✅ Basic authentication system working
- ✅ Local development environment functional
- ✅ Study creation and management (basic functionality)
- 🚧 Screen recording implementation in progress
- ❌ Session replay not yet implemented
- ❌ Advanced analytics not yet implemented
- ❌ Payment integration not yet implemented

**Note**: Many features shown in the UI are mockups or incomplete implementations. See `FEATURE_GAP_ANALYSIS.md` for detailed status.
