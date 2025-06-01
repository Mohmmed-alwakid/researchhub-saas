# ResearchHub - API Reference for Copilot

## 🚀 Base Configuration

### Server Setup
```typescript
// Server runs on: http://localhost:3002
// Health check: GET /api/health
// CORS enabled for: http://localhost:5175
```

## 🔐 Authentication Endpoints

### POST /api/auth/register
```typescript
// Request
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "password123",
  "company": "Acme Corp",
  "role": "researcher" // or "admin"
}

// Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_access_token"
  }
}
```

### POST /api/auth/login
```typescript
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response  
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_access_token"
  }
}
```

### POST /api/auth/refresh
```typescript
// Requires httpOnly refresh token cookie
// Response
{
  "success": true,
  "data": {
    "token": "new_jwt_access_token"
  }
}
```

### POST /api/auth/logout
```typescript
// Clears refresh token cookie
// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 👥 User Management Endpoints

### GET /api/users/profile
```typescript
// Requires: Bearer token
// Response
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "researcher",
    "company": "Acme Corp"
  }
}
```

### PUT /api/users/profile
```typescript
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "company": "New Company"
}

// Response
{
  "success": true,
  "data": { /* updated user object */ }
}
```

## 📊 Study Management Endpoints

### GET /api/studies
```typescript
// Requires: Bearer token
// Query params: ?page=1&limit=10&status=active
// Response
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "study_id",
        "title": "Usability Test",
        "description": "Testing new UI",
        "type": "usability",
        "status": "active",
        "participantCount": 15,
        "createdAt": "2025-06-01T00:00:00Z",
        "createdBy": "user_id"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### POST /api/studies
```typescript
// Request
{
  "title": "New Study",
  "description": "Study description",
  "type": "usability", // or "survey", "interview"
  "settings": {
    "recordScreen": true,
    "recordAudio": false,
    "duration": 30,
    "tasks": [
      {
        "id": "task_1",
        "title": "Complete checkout",
        "description": "Add item to cart and checkout",
        "type": "task"
      }
    ]
  }
}

// Response
{
  "success": true,
  "data": { /* created study object */ }
}
```

### GET /api/studies/:id
```typescript
// Response
{
  "success": true,
  "data": {
    "id": "study_id",
    "title": "Study Title",
    "description": "Study description",
    "type": "usability",
    "status": "active",
    "settings": { /* study settings */ },
    "participants": [ /* participant list */ ],
    "sessions": [ /* session data */ ],
    "analytics": { /* analytics summary */ }
  }
}
```

### PUT /api/studies/:id
```typescript
// Request (partial update)
{
  "title": "Updated Title",
  "status": "paused"
}

// Response
{
  "success": true,
  "data": { /* updated study object */ }
}
```

### DELETE /api/studies/:id
```typescript
// Response
{
  "success": true,
  "message": "Study deleted successfully"
}
```

## 🎥 Session/Recording Endpoints

### POST /api/sessions
```typescript
// Request
{
  "studyId": "study_id",
  "participantData": {
    "name": "Participant Name",
    "email": "participant@example.com",
    "demographics": { /* optional demographics */ }
  }
}

// Response
{
  "success": true,
  "data": {
    "sessionId": "session_id",
    "studyData": { /* study configuration */ },
    "participantId": "participant_id"
  }
}
```

### POST /api/sessions/:id/start
```typescript
// Start recording session
// Response
{
  "success": true,
  "data": {
    "sessionId": "session_id",
    "recordingUrl": "recording_endpoint",
    "startTime": "2025-06-01T10:00:00Z"
  }
}
```

### POST /api/sessions/:id/complete
```typescript
// Request
{
  "duration": 1800, // seconds
  "completedTasks": ["task_1", "task_2"],
  "feedback": {
    "rating": 4,
    "comments": "Easy to use"
  }
}

// Response
{
  "success": true,
  "message": "Session completed successfully"
}
```

## 📈 Analytics Endpoints

### GET /api/analytics/studies/:id
```typescript
// Response
{
  "success": true,
  "data": {
    "overview": {
      "totalSessions": 50,
      "completionRate": 85,
      "averageDuration": 1200,
      "satisfactionScore": 4.2
    },
    "taskAnalytics": [
      {
        "taskId": "task_1",
        "completionRate": 90,
        "averageTime": 180,
        "errorRate": 5
      }
    ],
    "heatmapData": [ /* click/scroll heatmap data */ ],
    "sessionReplays": [ /* session replay URLs */ ]
  }
}
```

### GET /api/analytics/dashboard
```typescript
// Requires: Bearer token
// Response
{
  "success": true,
  "data": {
    "totalStudies": 12,
    "activeStudies": 8,
    "totalParticipants": 1250,
    "recentSessions": [ /* recent session summaries */ ],
    "performanceMetrics": { /* key metrics */ }
  }
}
```

## 🔧 System Endpoints

### GET /api/health
```typescript
// Public endpoint
// Response
{
  "success": true,
  "message": "ResearchHub API is running",
  "timestamp": "2025-06-01T10:00:00Z",
  "environment": "development"
}
```

### GET /api/system/status
```typescript
// Requires: Admin role
// Response
{
  "success": true,
  "data": {
    "database": "connected",
    "redis": "connected",
    "storage": "healthy",
    "version": "1.0.0",
    "uptime": 86400
  }
}
```

## 📄 File Upload Endpoints

### POST /api/upload
```typescript
// Multipart form data
// Field: "file" (max 10MB)
// Response
{
  "success": true,
  "data": {
    "fileId": "file_id",
    "fileName": "original_name.pdf",
    "fileUrl": "https://storage.url/file_id",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  }
}
```

## 🚨 Error Response Format

```typescript
// Standard error response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE", // optional
  "details": { /* additional error details */ } // optional
}
```

## 🔑 Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **422**: Unprocessable Entity (validation failed)
- **500**: Internal Server Error

## 🛡️ Authentication Headers

```typescript
// All protected endpoints require:
Authorization: Bearer <jwt_access_token>

// Content-Type for JSON requests:
Content-Type: application/json

// For file uploads:
Content-Type: multipart/form-data
```
