# ResearchHub - Application Flow Documentation

**Version:** 2.0  
**Date:** June 15, 2025  
**Status:** Production Ready  

---

## 🎯 Overview

This document outlines the complete user journeys and application flows for the ResearchHub platform, including all user roles and their interactions.

---

## 👥 User Roles & Permissions

### Role Hierarchy
```
Admin
├── Full platform access
├── User management
├── System administration
└── Analytics access

Researcher
├── Study management
├── Participant review
├── Session monitoring
└── Data analysis

Participant
├── Study discovery
├── Application submission
├── Study participation
└── Profile management
```

---

## 🔄 Core Application Flows

### 1. User Onboarding Flow

#### New User Registration
```mermaid
graph TD
    A[Landing Page] --> B[Click Register]
    B --> C[Registration Form]
    C --> D{Form Valid?}
    D -->|No| C
    D -->|Yes| E[Submit Registration]
    E --> F[Email Verification]
    F --> G[Role Selection]
    G --> H[Profile Setup]
    H --> I[Welcome Dashboard]
```

**Steps:**
1. **Landing Page** - User visits ResearchHub homepage
2. **Registration Form** - Fill out basic information
3. **Email Verification** - Confirm email address
4. **Role Selection** - Choose Researcher or Participant
5. **Profile Setup** - Complete profile information
6. **Dashboard Access** - First login to appropriate dashboard

#### Login Flow
```mermaid
graph TD
    A[Login Page] --> B[Enter Credentials]
    B --> C{Valid Credentials?}
    C -->|No| D[Show Error]
    D --> B
    C -->|Yes| E[Generate JWT Token]
    E --> F{User Role?}
    F -->|Researcher| G[Researcher Dashboard]
    F -->|Participant| H[Participant Dashboard]
    F -->|Admin| I[Admin Dashboard]
```

---

### 2. Researcher Workflow

#### Study Creation Flow
```mermaid
graph TD
    A[Dashboard] --> B[Create New Study]
    B --> C[Study Builder]
    C --> D[Basic Information]
    D --> E[Study Configuration]
    E --> F[Participant Requirements]
    F --> G[Preview Study]
    G --> H{Ready to Publish?}
    H -->|No| C
    H -->|Yes| I[Publish Study]
    I --> J[Study Live]
```

**Detailed Steps:**
1. **Dashboard Access** - Researcher logs into dashboard
2. **Study Creation** - Click "Create New Study" button
3. **Basic Information** - Enter study title, description, objectives
4. **Configuration** - Set study parameters, duration, requirements
5. **Requirements** - Define participant criteria and prerequisites
6. **Preview** - Review study before publishing
7. **Publication** - Make study available to participants

#### Participant Management Flow
```mermaid
graph TD
    A[Study Dashboard] --> B[View Applications]
    B --> C[Review Application]
    C --> D{Approve Application?}
    D -->|Yes| E[Send Approval]
    D -->|No| F[Send Rejection]
    E --> G[Participant Notified]
    F --> H[Participant Notified]
    G --> I[Schedule Session]
    H --> J[Application Closed]
```

---

### 3. Participant Workflow

#### Study Discovery Flow
```mermaid
graph TD
    A[Dashboard] --> B[Browse Studies]
    B --> C[Filter/Search]
    C --> D[View Study Details]
    D --> E{Interested?}
    E -->|No| B
    E -->|Yes| F[Check Requirements]
    F --> G{Eligible?}
    G -->|No| H[Show Requirements]
    G -->|Yes| I[Apply to Study]
    I --> J[Application Submitted]
    J --> K[Await Response]
```

#### Application Process
```mermaid
graph TD
    A[Study Details] --> B[Click Apply]
    B --> C[Application Form]
    C --> D[Personal Information]
    D --> E[Screening Questions]
    E --> F[Consent Forms]
    F --> G[Review Application]
    G --> H[Submit Application]
    H --> I[Confirmation Email]
    I --> J[Pending Review]
```

---

### 4. Study Session Flow

#### Session Initiation
```mermaid
graph TD
    A[Approved Participant] --> B[Session Notification]
    B --> C[Join Session Link]
    C --> D[Pre-Session Check]
    D --> E{System Ready?}
    E -->|No| F[Troubleshoot]
    F --> D
    E -->|Yes| G[Start Session]
    G --> H[Session Active]
    H --> I[Complete Tasks]
    I --> J[End Session]
    J --> K[Session Data Saved]
```

#### Session Monitoring (Researcher View)
```mermaid
graph TD
    A[Research Dashboard] --> B[Active Sessions]
    B --> C[Monitor Progress]
    C --> D[Real-time Stats]
    D --> E{Intervention Needed?}
    E -->|Yes| F[Send Message]
    E -->|No| G[Continue Monitoring]
    F --> G
    G --> H[Session Complete]
    H --> I[Review Data]
```

---

### 5. Admin Workflow

#### User Management Flow
```mermaid
graph TD
    A[Admin Dashboard] --> B[User Management]
    B --> C[View All Users]
    C --> D{Action Needed?}
    D -->|Edit User| E[Edit Profile]
    D -->|Delete User| F[Confirm Delete]
    D -->|Role Change| G[Update Role]
    D -->|View Details| H[User Details]
    E --> I[Save Changes]
    F --> J[User Removed]
    G --> K[Role Updated]
    H --> L[Back to List]
```

#### System Administration Flow
```mermaid
graph TD
    A[Admin Dashboard] --> B[System Overview]
    B --> C[Monitor Health]
    C --> D{Issues Detected?}
    D -->|Yes| E[Investigate]
    D -->|No| F[Regular Monitoring]
    E --> G[Take Action]
    G --> H[Log Resolution]
    F --> C
    H --> C
```

---

## 🔐 Authentication & Security Flows

### JWT Token Management
```mermaid
graph TD
    A[Login Request] --> B[Validate Credentials]
    B --> C{Valid?}
    C -->|No| D[Return Error]
    C -->|Yes| E[Generate Access Token]
    E --> F[Generate Refresh Token]
    F --> G[Store Refresh Token]
    G --> H[Return Tokens]
    H --> I[Set HTTP-Only Cookie]
    I --> J[User Authenticated]
```

### Token Refresh Flow
```mermaid
graph TD
    A[API Request] --> B{Token Valid?}
    B -->|Yes| C[Process Request]
    B -->|No| D{Token Expired?}
    D -->|Yes| E[Check Refresh Token]
    D -->|No| F[Return 401]
    E --> G{Refresh Valid?}
    G -->|Yes| H[Generate New Tokens]
    G -->|No| I[Redirect to Login]
    H --> J[Retry Original Request]
```

---

## 📱 User Interface Flows

### Navigation Flow
```mermaid
graph TD
    A[Login] --> B{User Role?}
    B -->|Researcher| C[Researcher Nav]
    B -->|Participant| D[Participant Nav]
    B -->|Admin| E[Admin Nav]
    
    C --> C1[Dashboard]
    C --> C2[Studies]
    C --> C3[Applications]
    C --> C4[Analytics]
    C --> C5[Settings]
    
    D --> D1[Dashboard]
    D --> D2[Browse Studies]
    D --> D3[My Applications]
    D --> D4[Profile]
    
    E --> E1[Dashboard]
    E --> E2[User Management]
    E --> E3[System Health]
    E --> E4[Analytics]
    E --> E5[Settings]
```

### Page Transition Flow
```mermaid
graph TD
    A[Current Page] --> B[User Action]
    B --> C{Route Protected?}
    C -->|No| D[Load Page]
    C -->|Yes| E{User Authenticated?}
    E -->|No| F[Redirect to Login]
    E -->|Yes| G{Role Authorized?}
    G -->|No| H[Access Denied]
    G -->|Yes| I[Load Page]
    F --> J[After Login Redirect]
```

---

## 🔄 Data Flow Architecture

### Study Data Flow
```mermaid
graph TD
    A[Study Creation] --> B[Database Storage]
    B --> C[Publish to Participants]
    C --> D[Application Received]
    D --> E[Update Study Stats]
    E --> F[Researcher Review]
    F --> G[Application Decision]
    G --> H[Update Participant Status]
    H --> I[Session Scheduling]
    I --> J[Session Data Collection]
    J --> K[Analytics Processing]
```

### User Data Flow
```mermaid
graph TD
    A[User Registration] --> B[Profile Creation]
    B --> C[Role Assignment]
    C --> D[Permission Setup]
    D --> E[Dashboard Access]
    E --> F[Activity Tracking]
    F --> G[Analytics Collection]
    G --> H[Admin Visibility]
```

---

## 🚨 Error Handling Flows

### API Error Flow
```mermaid
graph TD
    A[API Request] --> B{Request Valid?}
    B -->|No| C[Validation Error]
    B -->|Yes| D[Process Request]
    D --> E{Success?}
    E -->|No| F[Server Error]
    E -->|Yes| G[Return Data]
    C --> H[Display Error Message]
    F --> I[Log Error]
    I --> J[Display Generic Message]
```

### Form Validation Flow
```mermaid
graph TD
    A[Form Input] --> B[Client Validation]
    B --> C{Valid?}
    C -->|No| D[Show Field Error]
    C -->|Yes| E[Submit Form]
    E --> F[Server Validation]
    F --> G{Valid?}
    G -->|No| H[Return Errors]
    G -->|Yes| I[Process Data]
    H --> J[Display Server Errors]
```

---

## 📊 Analytics & Tracking Flows

### User Behavior Tracking
```mermaid
graph TD
    A[User Action] --> B[Event Capture]
    B --> C[Data Validation]
    C --> D[Store Event]
    D --> E[Real-time Dashboard]
    E --> F[Batch Processing]
    F --> G[Generate Reports]
    G --> H[Admin Analytics]
```

### Study Analytics Flow
```mermaid
graph TD
    A[Session Start] --> B[Track Interactions]
    B --> C[Capture Metrics]
    C --> D[Store Session Data]
    D --> E[Session End]
    E --> F[Process Analytics]
    F --> G[Generate Insights]
    G --> H[Researcher Dashboard]
```

---

## 🔧 Technical Integration Flows

### Database Operations
```mermaid
graph TD
    A[API Request] --> B[Controller]
    B --> C[Validation Middleware]
    C --> D[Service Layer]
    D --> E[Database Model]
    E --> F[MongoDB Operation]
    F --> G[Return Data]
    G --> H[Format Response]
    H --> I[Send to Client]
```

### File Upload Flow
```mermaid
graph TD
    A[File Select] --> B[Client Validation]
    B --> C{Valid File?}
    C -->|No| D[Show Error]
    C -->|Yes| E[Upload to Server]
    E --> F[Server Validation]
    F --> G{Valid?}
    G -->|No| H[Return Error]
    G -->|Yes| I[Process File]
    I --> J[Store Metadata]
    J --> K[Return Success]
```

---

## 📋 Flow Validation Checklist

### User Experience Validation
- [ ] All flows complete successfully end-to-end
- [ ] Error states handled gracefully
- [ ] Loading states provide feedback
- [ ] Success states confirm actions
- [ ] Navigation is intuitive and consistent

### Technical Validation
- [ ] All API endpoints respond correctly
- [ ] Database operations complete successfully
- [ ] Authentication flows secure and functional
- [ ] Authorization properly restricts access
- [ ] Error logging captures important events

### Security Validation
- [ ] Sensitive data properly protected
- [ ] User input validated on client and server
- [ ] Role-based access enforced
- [ ] Session management secure
- [ ] Audit trail maintained for important actions

---

## 📞 Contact & Updates

**Document Owner:** ResearchHub Development Team  
**Last Updated:** June 15, 2025  
**Next Review:** September 15, 2025  

---

*This flow documentation is updated regularly to reflect current application behavior and new feature implementations.*
