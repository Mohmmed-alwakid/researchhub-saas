# Complete Participant Workflow Guide - ResearchHub

## Overview
This document explains the complete participant workflow in ResearchHub, from study launch to results analysis.

## Study Lifecycle & Actions

### 1. Draft Studies
**Status**: `draft`
**Available Actions**:
- ✅ **Start Testing** - Publishes the study and makes it available to participants
- ✅ **Edit Study** - Modify study configuration
- ✅ **Delete Study** - Remove draft study

### 2. Active Studies  
**Status**: `active`
**Available Actions**:
- 🔵 **Applications** - Manage participant applications (approve/reject)
- 🟣 **Results** - View live results and analytics
- ⏸️ **Pause Study** - Temporarily stop accepting new participants
- ✏️ **Edit Study** - Limited editing capabilities

### 3. Paused Studies
**Status**: `paused` 
**Available Actions**:
- 🔵 **Applications** - Manage existing applications
- 🟣 **Results** - View current results
- ▶️ **Resume Study** - Reactivate the study
- ✏️ **Edit Study** - Modify study settings

### 4. Completed Studies
**Status**: `completed`
**Available Actions**:
- 🟣 **View Results** - Final results and analytics only
- 📊 **Export Data** - Download study data

## Complete Participant Workflow

### Phase 1: Study Launch
1. **Researcher creates study** using StudyCreationWizard
2. **Study starts in `draft` status**
3. **Researcher clicks "Start Testing"** → Study becomes `active`
4. **Study is now discoverable** by participants

### Phase 2: Participant Discovery & Application
1. **Participants browse available studies** at `/app/study-discovery`
2. **Participants view study details** including:
   - Study description and objectives
   - Estimated duration
   - Compensation details
   - Requirements
3. **Participants apply to participate** → Creates application record
4. **Application goes to researcher** for review

### Phase 3: Application Management
**Route**: `/app/studies/:id/applications`

**Researcher Actions**:
- ✅ **Approve applications** - Accept participants into the study
- ❌ **Reject applications** - Decline participants with optional reason
- 👀 **Review participant profiles** - Check qualifications
- 📧 **Send messages** - Communicate with applicants

**Application Statuses**:
- `pending` - Waiting for researcher review
- `approved` - Participant accepted, can start study
- `rejected` - Participant declined
- `withdrawn` - Participant cancelled application

### Phase 4: Study Participation
1. **Approved participants receive notification**
2. **Participants access study session** at `/app/studies/:id/session`
3. **Participants complete study blocks** sequentially:
   - Welcome Screen
   - Questions/Tasks
   - Surveys/Feedback
   - Thank You screen
4. **Responses are recorded** in real-time
5. **Session data is stored** for analysis

### Phase 5: Results & Analytics
**Route**: `/app/studies/:id/results`

**Available Analytics**:
- 📊 **Response Summary** - Overview of all participant responses
- 🧑‍🤝‍🧑 **Participant List** - Individual participant data
- 📈 **Block Analysis** - Performance by study block
- ⏱️ **Time Analytics** - Duration and completion rates
- 📄 **Export Options** - CSV, JSON, PDF reports

**Real-time Updates**:
- New responses appear immediately
- Progress tracking updates live
- Completion statistics refresh automatically

## Key Features

### Participant Management
- **Application Review System** - Approve/reject with reasons
- **Participant Communication** - Built-in messaging
- **Profile Verification** - Check participant qualifications
- **Automatic Notifications** - Email updates for status changes

### Results Dashboard
- **Live Analytics** - Real-time response tracking
- **Block-by-Block Analysis** - Detailed breakdowns
- **Participant Journey** - Individual completion paths
- **Export Capabilities** - Multiple format options

### Study Controls
- **Pause/Resume** - Control participant flow
- **Capacity Management** - Set participant limits
- **Status Tracking** - Monitor study progress
- **Data Security** - RLS and encryption

## API Endpoints

### Study Management
- `GET /api/studies` - List researcher's studies
- `POST /api/studies` - Create new study
- `PUT /api/studies/:id` - Update study
- `DELETE /api/studies/:id` - Delete study

### Application Management  
- `GET /api/studies/:id/applications` - List applications
- `PUT /api/applications/:id` - Update application status
- `POST /api/applications/:id/message` - Send message

### Results & Analytics
- `GET /api/studies/:id/results` - Get study results
- `GET /api/studies/:id/analytics` - Get analytics data
- `GET /api/studies/:id/export` - Export study data

### Participant Experience
- `GET /api/study-discovery` - Browse available studies
- `POST /api/studies/:id/apply` - Apply to participate
- `GET /api/studies/:id/session` - Access study session
- `POST /api/studies/:id/responses` - Submit responses

## Database Schema

### Core Tables
- `studies` - Study configurations and metadata
- `study_applications` - Participant applications
- `study_sessions` - Individual participant sessions
- `study_responses` - Response data by block
- `study_analytics` - Aggregated analytics data

### Relationships
- Studies → Applications (1:many)
- Applications → Sessions (1:1)
- Sessions → Responses (1:many)
- Studies → Analytics (1:1)

## Security & Privacy

### Row Level Security (RLS)
- **Researchers** can only access their own studies
- **Participants** can only see their own applications/sessions
- **Admins** have full access with audit trails

### Data Protection
- **Encrypted responses** - All participant data encrypted
- **GDPR Compliance** - Data export and deletion rights
- **Anonymization** - Optional participant anonymity
- **Secure Storage** - Supabase enterprise security

## Next Steps for Implementation

### Immediate Priorities
1. ✅ **Study Launch Fixed** - Authentication and API integration complete
2. ✅ **Dashboard Integration** - Direct navigation to StudyCreationWizard
3. 🔄 **Studies Page Actions** - Context-appropriate buttons by status

### Future Enhancements
1. **Participant Recruitment** - Automated participant matching
2. **Advanced Analytics** - ML-powered insights
3. **Template Marketplace** - Community study templates
4. **Integration APIs** - Slack, Figma, Notion connectors
5. **Mobile App** - Participant mobile experience

## Conclusion

The ResearchHub platform now provides a complete, professional-grade participant workflow from study creation to results analysis. The enhanced StudyCreationWizard, improved dashboard navigation, and status-appropriate actions create a seamless research experience for both researchers and participants.

**Last Updated**: June 28, 2025
**Status**: ✅ Core workflow complete and functional
