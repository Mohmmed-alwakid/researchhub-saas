# Enterprise Collaboration - Developer Documentation

**ResearchHub Enterprise Features Technical Reference**  
**Last Updated**: June 29, 2025

## 🏗️ Architecture Overview

The Enterprise Team Collaboration system is built using a modular architecture with secure API endpoints, comprehensive database schema, and role-based access control.

### Core Components

```
📁 Database Schema
├── organizations (organization management)
├── organization_members (membership with roles)
├── teams (team organization)
├── team_members (team membership)
├── study_collaborators (study access control)
├── collaboration_activity (audit logging)
└── workflow_automation (automation rules)

📁 API Endpoints
├── /api/organizations.js (organization CRUD)
├── /api/collaboration/studies.js (collaborative studies)
├── /api/collaboration/studies/[studyId]/collaborators.js
├── /api/collaboration/studies/[studyId]/comments.js
├── /api/collaboration/studies/[studyId]/activity.js
└── /api/collaboration/studies/[studyId]/comments/[commentId]/resolve.js

📁 Frontend Components
├── /src/client/pages/organization/OrganizationDashboard.tsx
├── /src/client/pages/collaboration/StudyCollaborationCenter.tsx
└── Enhanced UI components (Label, Textarea, CardTitle)
```

## 🗄️ Database Schema

### Organizations Table

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    plan_type organization_plan_type NOT NULL DEFAULT 'starter',
    member_limit INTEGER DEFAULT 5,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan types: 'starter', 'professional', 'enterprise'
CREATE TYPE organization_plan_type AS ENUM ('starter', 'professional', 'enterprise');
```

### Organization Members

```sql
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role organization_member_role NOT NULL DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Member roles: 'admin', 'member', 'viewer'
CREATE TYPE organization_member_role AS ENUM ('admin', 'member', 'viewer');
```

### Study Collaborators

```sql
CREATE TABLE study_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role collaboration_role NOT NULL DEFAULT 'viewer',
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(study_id, user_id)
);

-- Collaboration roles: 'owner', 'editor', 'reviewer', 'viewer'
CREATE TYPE collaboration_role AS ENUM ('owner', 'editor', 'reviewer', 'viewer');
```

## 🔌 API Reference

### Organization Management

#### GET /api/organizations
**Description**: List organizations for authenticated user

**Response**:
```json
{
  "success": true,
  "organizations": [
    {
      "id": "uuid",
      "name": "Organization Name",
      "slug": "org-slug",
      "plan_type": "professional",
      "member_count": 15,
      "member_limit": 25,
      "role": "admin"
    }
  ]
}
```

#### POST /api/organizations
**Description**: Create new organization

**Body**:
```json
{
  "name": "New Organization",
  "description": "Organization description",
  "plan_type": "professional"
}
```

**Response**:
```json
{
  "success": true,
  "organization": {
    "id": "uuid",
    "name": "New Organization",
    "slug": "new-organization",
    "plan_type": "professional"
  }
}
```

### Study Collaboration

#### GET /api/collaboration/studies
**Description**: List collaborative studies for user

**Query Parameters**:
- `organization_id` (optional): Filter by organization
- `role` (optional): Filter by collaboration role

**Response**:
```json
{
  "success": true,
  "studies": [
    {
      "id": "uuid",
      "title": "Study Title",
      "role": "editor",
      "permissions": ["edit", "comment"],
      "collaborator_count": 5,
      "last_activity": "2025-06-29T10:30:00Z"
    }
  ]
}
```

#### POST /api/collaboration/studies/[studyId]/collaborators
**Description**: Add collaborator to study

**Body**:
```json
{
  "user_id": "uuid",
  "role": "editor",
  "permissions": ["edit", "comment", "share"]
}
```

#### GET /api/collaboration/studies/[studyId]/activity
**Description**: Get study activity feed

**Response**:
```json
{
  "success": true,
  "activities": [
    {
      "id": "uuid",
      "type": "collaborator_added",
      "user_id": "uuid",
      "user_name": "John Doe",
      "details": {
        "collaborator_name": "Jane Smith",
        "role": "editor"
      },
      "created_at": "2025-06-29T10:30:00Z"
    }
  ]
}
```

## 🔐 Security Implementation

### Row-Level Security (RLS)

#### Organizations Access
```sql
-- Organizations: Users can only see organizations they're members of
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );
```

#### Study Collaborators Access
```sql
-- Study Collaborators: Users can only manage collaborators for studies they own or have share permission
CREATE POLICY "Users can manage collaborators for studies they have share permission" ON study_collaborators
    FOR ALL USING (
        study_id IN (
            SELECT id FROM studies WHERE created_by = auth.uid()
        ) OR (
            user_id = auth.uid() AND 'share' = ANY(permissions)
        )
    );
```

### Authentication Flow

```typescript
// API authentication pattern
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid authentication' });
    }

    // Continue with authenticated logic...
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

## 🎨 Frontend Integration

### Organization Dashboard Component

```tsx
// OrganizationDashboard.tsx - Main organization management interface
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export const OrganizationDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await fetch('/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component implementation...
};
```

### Study Collaboration Center

```tsx
// StudyCollaborationCenter.tsx - Study collaboration management
export const StudyCollaborationCenter = ({ studyId }: { studyId: string }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);

  // Tab-based interface for managing different aspects of collaboration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'collaborators', label: 'Collaborators', icon: Users },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  // Component implementation...
};
```

## 🧪 Testing

### API Testing

```javascript
// Test organization creation
const testOrganizationCreation = async () => {
  const response = await fetch('/api/organizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify({
      name: 'Test Organization',
      description: 'Test description',
      plan_type: 'professional'
    })
  });

  const data = await response.json();
  console.assert(data.success === true, 'Organization creation failed');
};
```

### Database Testing

```sql
-- Test RLS policies
SELECT * FROM organizations; -- Should only return user's organizations
SELECT * FROM study_collaborators WHERE study_id = 'test-study-id'; -- Should respect permissions
```

## 🚀 Deployment Notes

### Environment Variables
```bash
# Required for enterprise features
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Database Migrations
```bash
# Apply enterprise collaboration schema
psql -f database/migrations/enterprise_collaboration_schema.sql
```

### Vercel Configuration
```json
{
  "functions": {
    "api/organizations.js": {
      "maxDuration": 10
    },
    "api/collaboration/**/*.js": {
      "maxDuration": 15
    }
  }
}
```

## 📈 Performance Considerations

### Database Indexing
```sql
-- Critical indexes for performance
CREATE INDEX idx_organization_members_org_user ON organization_members(organization_id, user_id);
CREATE INDEX idx_study_collaborators_study ON study_collaborators(study_id);
CREATE INDEX idx_collaboration_activity_study_time ON collaboration_activity(study_id, created_at DESC);
```

### API Optimization
- Use database connection pooling
- Implement request caching for organization data
- Paginate activity feeds and large result sets
- Use RLS policies to filter data at database level

### Frontend Performance
- Lazy load collaboration features
- Implement virtual scrolling for large activity feeds
- Cache organization membership data locally
- Use React Query for efficient data fetching

## 🔄 Future Enhancements

### Planned Features
1. **Advanced Workflow Automation**
   - Custom approval chains
   - Automated task assignment
   - Integration with external tools

2. **Enhanced Analytics**
   - Team productivity metrics
   - Collaboration patterns analysis
   - Study performance by team

3. **Advanced Permissions**
   - Fine-grained block-level permissions
   - Time-based access control
   - Conditional permissions based on study status

### API Versioning Strategy
- Use `/api/v2/` prefix for breaking changes
- Maintain backward compatibility for at least 6 months
- Provide migration guides for API consumers

---

## 📞 Developer Support

### Resources
- **API Documentation**: `/docs/api-reference.md`
- **Database Schema**: `/database/migrations/`
- **Component Storybook**: Available in development mode
- **TypeScript Definitions**: Included in all API responses

### Getting Help
- **Internal Slack**: #researchhub-dev channel
- **Code Reviews**: Required for all collaboration feature changes
- **Architecture Decisions**: Document in `/docs/architecture/`
