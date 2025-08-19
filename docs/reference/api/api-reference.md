# 🔗 ResearchHub API Reference

## Overview

The ResearchHub API provides comprehensive access to all platform functionality through RESTful endpoints. This reference covers authentication, study management, participant interactions, and data analytics.

## Base URL

```
Production: https://researchhub-saas.vercel.app/api
Development: http://localhost:3003/api
```

## Authentication

### Authentication Methods

**JWT Token Authentication**
```http
Authorization: Bearer <jwt_token>
```

**API Key Authentication** (For integrations)
```http
X-API-Key: <your_api_key>
```

### Auth Endpoints

#### Login
```http
POST /auth?action=login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "researcher"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 3600
    }
  }
}
```

#### Register
```http
POST /auth?action=register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "researcher",
  "profile": {
    "name": "John Doe",
    "organization": "Acme Corp"
  }
}
```

#### Refresh Token
```http
POST /auth?action=refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token_string"
}
```

## Study Management

### Studies API

#### Get All Studies
```http
GET /research-consolidated?action=get-studies
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (draft, published, completed)
- `search` (optional): Search in title and description

**Response:**
```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "study_uuid",
        "title": "User Experience Study",
        "description": "Research about mobile app usability",
        "status": "published",
        "created_at": "2025-08-19T10:00:00Z",
        "blocks_count": 5,
        "responses_count": 42,
        "estimated_duration": 300
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

#### Create Study
```http
POST /research-consolidated?action=create-study
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Study Title",
  "description": "Study description",
  "study_type": "unmoderated",
  "estimated_duration": 300,
  "settings": {
    "allow_anonymous": true,
    "require_consent": true,
    "randomize_blocks": false
  },
  "blocks": [
    {
      "type": "welcome",
      "order": 1,
      "title": "Welcome",
      "description": "Welcome to our study",
      "settings": {
        "show_progress": true,
        "allow_skip": false
      }
    }
  ]
}
```

#### Get Study Details
```http
GET /research-consolidated?action=get-study&study_id={study_id}
Authorization: Bearer <token>
```

#### Update Study
```http
PUT /research-consolidated?action=update-study
Authorization: Bearer <token>
Content-Type: application/json

{
  "study_id": "study_uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "blocks": [...]
}
```

#### Delete Study
```http
DELETE /research-consolidated?action=delete-study&study_id={study_id}
Authorization: Bearer <token>
```

### Study Blocks API

#### Get Block Types
```http
GET /research-consolidated?action=get-block-types
```

**Response:**
```json
{
  "success": true,
  "data": {
    "block_types": [
      {
        "type": "welcome",
        "name": "Welcome Screen",
        "description": "Introduction and study overview",
        "settings_schema": {
          "show_progress": { "type": "boolean", "default": true },
          "allow_skip": { "type": "boolean", "default": false }
        }
      },
      {
        "type": "open_question",
        "name": "Open Question",
        "description": "Free-text response collection",
        "settings_schema": {
          "max_length": { "type": "number", "default": 500 },
          "required": { "type": "boolean", "default": true }
        }
      }
    ]
  }
}
```

#### Add Block to Study
```http
POST /research-consolidated?action=add-block
Authorization: Bearer <token>
Content-Type: application/json

{
  "study_id": "study_uuid",
  "block": {
    "type": "opinion_scale",
    "order": 2,
    "title": "Rate your experience",
    "description": "How would you rate the overall experience?",
    "settings": {
      "scale_min": 1,
      "scale_max": 10,
      "scale_labels": {
        "1": "Very Poor",
        "10": "Excellent"
      },
      "required": true
    }
  }
}
```

#### Update Block
```http
PUT /research-consolidated?action=update-block
Authorization: Bearer <token>
Content-Type: application/json

{
  "study_id": "study_uuid",
  "block_id": "block_uuid",
  "title": "Updated title",
  "settings": {
    "required": false
  }
}
```

#### Delete Block
```http
DELETE /research-consolidated?action=delete-block&study_id={study_id}&block_id={block_id}
Authorization: Bearer <token>
```

## Participant Management

### Participants API

#### Get Study Participants
```http
GET /research-consolidated?action=get-participants&study_id={study_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": "participant_uuid",
        "status": "completed",
        "started_at": "2025-08-19T10:00:00Z",
        "completed_at": "2025-08-19T10:05:32Z",
        "duration": 332,
        "user_agent": "Mozilla/5.0...",
        "ip_address": "192.168.1.1",
        "responses_count": 5
      }
    ]
  }
}
```

#### Get Participant Responses
```http
GET /research-consolidated?action=get-responses&study_id={study_id}&participant_id={participant_id}
Authorization: Bearer <token>
```

## Study Sessions (Participant Side)

### Session Management

#### Start Study Session
```http
POST /study-sessions?action=start-session
Content-Type: application/json

{
  "study_id": "study_uuid",
  "participant_data": {
    "anonymous": true,
    "consent_given": true,
    "metadata": {
      "user_agent": "Mozilla/5.0...",
      "screen_resolution": "1920x1080",
      "timezone": "America/New_York"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session_uuid",
    "study": {
      "id": "study_uuid",
      "title": "Study Title",
      "description": "Study description",
      "estimated_duration": 300
    },
    "current_block": {
      "id": "block_uuid",
      "type": "welcome",
      "order": 1,
      "title": "Welcome",
      "description": "Welcome message",
      "settings": {}
    }
  }
}
```

#### Submit Block Response
```http
POST /study-sessions?action=submit-response
Content-Type: application/json

{
  "session_id": "session_uuid",
  "block_id": "block_uuid",
  "response_data": {
    "answer": "This is my response to the question",
    "duration": 45,
    "interactions": [
      {
        "type": "focus",
        "timestamp": "2025-08-19T10:01:00Z"
      },
      {
        "type": "input",
        "timestamp": "2025-08-19T10:01:15Z",
        "value": "partial response"
      }
    ]
  }
}
```

#### Get Next Block
```http
GET /study-sessions?action=get-next-block&session_id={session_id}
```

#### Complete Study Session
```http
POST /study-sessions?action=complete-session
Content-Type: application/json

{
  "session_id": "session_uuid",
  "completion_data": {
    "total_duration": 332,
    "feedback": "Great study experience",
    "rating": 5
  }
}
```

## Templates

### Template Management

#### Get All Templates
```http
GET /templates-consolidated?action=get-templates
```

#### Get Template Details
```http
GET /templates-consolidated?action=get-template&template_id={template_id}
```

#### Create Study from Template
```http
POST /templates-consolidated?action=create-from-template
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_id": "template_uuid",
  "study_title": "My New Study",
  "customizations": {
    "estimated_duration": 420,
    "block_modifications": [
      {
        "block_order": 1,
        "title": "Custom Welcome Title"
      }
    ]
  }
}
```

## Analytics & Reporting

### Analytics API

#### Get Study Analytics
```http
GET /research-consolidated?action=get-analytics&study_id={study_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_responses": 150,
      "completion_rate": 0.85,
      "average_duration": 298,
      "bounce_rate": 0.15
    },
    "demographics": {
      "device_types": {
        "mobile": 65,
        "desktop": 80,
        "tablet": 5
      },
      "browsers": {
        "chrome": 90,
        "safari": 35,
        "firefox": 20,
        "edge": 5
      }
    },
    "block_analytics": [
      {
        "block_id": "block_uuid",
        "block_type": "open_question",
        "order": 1,
        "completion_rate": 0.92,
        "average_time": 45,
        "skip_rate": 0.08
      }
    ]
  }
}
```

#### Export Study Data
```http
GET /research-consolidated?action=export-data&study_id={study_id}&format={format}
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: csv, json, xlsx
- `include_raw`: Include raw response data
- `date_range`: Filter by date range

## User Profile Management

### Profile API

#### Get User Profile
```http
GET /user-profile-consolidated?action=get-profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /user-profile-consolidated?action=update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "organization": "Acme Corp",
  "bio": "UX Researcher with 5 years experience",
  "website": "https://johndoe.com",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### Get Usage Statistics
```http
GET /user-profile-consolidated?action=get-usage-stats
Authorization: Bearer <token>
```

## Webhooks

### Webhook Configuration

#### Register Webhook
```http
POST /system-consolidated?action=register-webhook
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/researchhub",
  "events": ["study.completed", "response.submitted"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

#### Study Completed
```json
{
  "event": "study.completed",
  "timestamp": "2025-08-19T10:30:00Z",
  "data": {
    "study_id": "study_uuid",
    "participant_id": "participant_uuid",
    "total_duration": 298,
    "responses_count": 5
  }
}
```

#### Response Submitted
```json
{
  "event": "response.submitted",
  "timestamp": "2025-08-19T10:25:00Z",
  "data": {
    "study_id": "study_uuid",
    "participant_id": "participant_uuid",
    "block_id": "block_uuid",
    "response_data": {}
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_uuid",
    "timestamp": "2025-08-19T10:00:00Z"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid authentication |
| `AUTHORIZATION_FAILED` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limits

### Default Limits

- **Authenticated requests**: 1000 requests per hour
- **Anonymous requests**: 100 requests per hour
- **Study sessions**: 50 concurrent sessions per study
- **File uploads**: 10MB maximum file size

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1692441600
```

## SDKs and Client Libraries

### JavaScript/Node.js

```bash
npm install @researchhub/sdk
```

```javascript
import { ResearchHubClient } from '@researchhub/sdk';

const client = new ResearchHubClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://researchhub-saas.vercel.app/api'
});

// Create a study
const study = await client.studies.create({
  title: 'My Study',
  description: 'Study description',
  blocks: [...]
});

// Get responses
const responses = await client.studies.getResponses(study.id);
```

### Python

```bash
pip install researchhub-sdk
```

```python
from researchhub import ResearchHubClient

client = ResearchHubClient(
    api_key='your_api_key',
    base_url='https://researchhub-saas.vercel.app/api'
)

# Create a study
study = client.studies.create(
    title='My Study',
    description='Study description',
    blocks=[...]
)

# Get responses
responses = client.studies.get_responses(study.id)
```

## Testing

### Test Environment

```
Base URL: https://researchhub-saas-staging.vercel.app/api
```

### Test Accounts

```
Researcher: test-researcher@researchhub.com / TestPassword123
Participant: test-participant@researchhub.com / TestPassword123
Admin: test-admin@researchhub.com / TestPassword123
```

### API Testing Tools

**Postman Collection**: Available at `/docs/api/postman-collection.json`

**OpenAPI Specification**: Available at `/docs/api/openapi.yaml`

## Support

### Documentation
- **API Documentation**: This reference
- **Tutorials**: Step-by-step guides
- **How-to Guides**: Common use cases
- **Troubleshooting**: Common issues and solutions

### Contact
- **Support Email**: api-support@researchhub.com
- **Community Forum**: https://community.researchhub.com
- **GitHub Issues**: https://github.com/researchhub/api-issues
- **Status Page**: https://status.researchhub.com

---

**API Version**: v1.2.0  
**Last Updated**: August 19, 2025  
**Rate Limit**: 1000 requests/hour
