# ResearchHub - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
ResearchHub is a comprehensive SaaS platform for user testing research, enabling researchers to conduct studies, gather feedback, and analyze user behavior through screen recording, heatmaps, and analytics.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + MongoDB + Mongoose
- **Authentication**: JWT tokens + refresh tokens
- **Payments**: Stripe integration
- **Real-time**: Socket.io for live features
- **Cloud**: AWS deployment (EC2, S3, CloudFront)

## Code Conventions
- Use TypeScript everywhere with strict mode
- Follow React functional components with hooks
- Use proper error handling with try-catch blocks
- Implement proper input validation with Zod schemas
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow clean architecture principles

## Key Features to Implement
1. **Study Builder**: Drag-and-drop interface for creating research studies
2. **Screen Recording**: WebRTC-based recording with cloud storage
3. **Participant Management**: Recruitment, screening, and compensation
4. **Analytics Dashboard**: Heatmaps, session replays, insights
5. **Payment System**: Stripe integration for subscriptions and payouts

## File Organization
- `/src/client` - Frontend React components and pages
- `/src/server` - Backend Express.js API and services
- `/src/shared` - Shared types and utilities
- `/src/database` - MongoDB models and schemas
- `/tests` - Unit and integration tests

## Security Considerations
- Always validate inputs on both client and server
- Use parameterized queries to prevent injection
- Implement rate limiting for API endpoints
- Sanitize user-generated content
- Use HTTPS everywhere and secure headers
