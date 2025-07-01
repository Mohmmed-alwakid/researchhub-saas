-- Enterprise Team Collaboration Database Schema
-- ResearchHub Enterprise Features & AI Integration Sprint - Week 3
-- Created: June 29, 2025

-- =====================================================
-- ORGANIZATION MANAGEMENT SCHEMA
-- =====================================================

-- Organizations table for enterprise team structures
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry TEXT,
    organization_size TEXT CHECK (organization_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Subscription and billing
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise', 'custom')),
    max_members INTEGER DEFAULT 5,
    max_studies INTEGER DEFAULT 10,
    max_participants INTEGER DEFAULT 100,
    
    -- Organization settings
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    
    -- Status and metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT organizations_name_unique UNIQUE (name)
);

-- Organization members table for team management
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role and permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'researcher', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    
    -- Member details
    title TEXT,
    department TEXT,
    team TEXT,
    
    -- Status and dates
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT org_member_unique UNIQUE (organization_id, user_id)
);

-- Team structures within organizations
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Team details
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    
    -- Team settings
    settings JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT team_name_org_unique UNIQUE (organization_id, name)
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role within team
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    
    -- Dates
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT team_member_unique UNIQUE (team_id, user_id)
);

-- =====================================================
-- STUDY COLLABORATION SCHEMA
-- =====================================================

-- Study collaborators for multi-researcher studies
CREATE TABLE IF NOT EXISTS study_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Collaboration role and permissions
    role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('owner', 'editor', 'reviewer', 'viewer')),
    permissions JSONB DEFAULT '{}',
    
    -- Collaboration details
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'removed')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT study_collaborator_unique UNIQUE (study_id, user_id)
);

-- Study activity log for collaboration tracking
CREATE TABLE IF NOT EXISTS study_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity details
    action TEXT NOT NULL,
    target_type TEXT, -- 'study', 'block', 'participant', 'settings'
    target_id TEXT,
    
    -- Activity data
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX study_activity_study_idx (study_id, created_at DESC),
    INDEX study_activity_user_idx (user_id, created_at DESC)
);

-- =====================================================
-- WORKFLOW AUTOMATION SCHEMA
-- =====================================================

-- Workflow templates for automation
CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'study_approval',
    
    -- Workflow definition
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow instances for tracking execution
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Instance details
    triggered_by UUID NOT NULL REFERENCES auth.users(id),
    trigger_data JSONB DEFAULT '{}',
    
    -- Execution state
    current_step INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    result JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow step executions
CREATE TABLE IF NOT EXISTS workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    
    -- Step details
    step_index INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    step_config JSONB DEFAULT '{}',
    
    -- Execution details
    assigned_to UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
    result JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMISSIONS AND ACCESS CONTROL
-- =====================================================

-- Resource permissions for granular access control
CREATE TABLE IF NOT EXISTS resource_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Resource details
    resource_type TEXT NOT NULL, -- 'study', 'template', 'participant', 'analytics'
    resource_id UUID NOT NULL,
    
    -- Permission details
    principal_type TEXT NOT NULL CHECK (principal_type IN ('user', 'team', 'role')),
    principal_id UUID NOT NULL,
    
    -- Permissions
    permissions TEXT[] NOT NULL DEFAULT '{}',
    
    -- Inheritance and delegation
    inherited_from UUID REFERENCES resource_permissions(id),
    can_delegate BOOLEAN DEFAULT false,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT resource_permission_unique UNIQUE (resource_type, resource_id, principal_type, principal_id)
);

-- =====================================================
-- AUDIT AND COMPLIANCE
-- =====================================================

-- Audit log for compliance and security
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Actor details
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    
    -- Action details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    change_summary TEXT,
    
    -- Context
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    
    -- Risk assessment
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_tags TEXT[] DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_tier);

-- Organization members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_org_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_parent ON teams(parent_team_id);

-- Team members
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Study collaborators
CREATE INDEX IF NOT EXISTS idx_study_collaborators_study_id ON study_collaborators(study_id);
CREATE INDEX IF NOT EXISTS idx_study_collaborators_user_id ON study_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_study_collaborators_status ON study_collaborators(status);

-- Workflow instances
CREATE INDEX IF NOT EXISTS idx_workflow_instances_org_id ON workflow_instances(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_study_id ON workflow_instances(study_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);

-- Resource permissions
CREATE INDEX IF NOT EXISTS idx_resource_permissions_org_id ON resource_permissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_resource ON resource_permissions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_permissions_principal ON resource_permissions(principal_type, principal_id);

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_org_id ON audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Organization owners can update" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Organization members: Users can see members of their organizations
CREATE POLICY "Users can view org members" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members om 
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Org admins can manage members" ON organization_members
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Teams: Users can see teams in their organizations
CREATE POLICY "Users can view org teams" ON teams
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Study collaborators: Users can see collaborators on studies they have access to
CREATE POLICY "Users can view study collaborators" ON study_collaborators
    FOR SELECT USING (
        study_id IN (
            SELECT id FROM studies WHERE created_by = auth.uid()
            UNION
            SELECT study_id FROM study_collaborators WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Study activity log: Users can see activity on studies they have access to
CREATE POLICY "Users can view study activity" ON study_activity_log
    FOR SELECT USING (
        study_id IN (
            SELECT id FROM studies WHERE created_by = auth.uid()
            UNION
            SELECT study_id FROM study_collaborators WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Workflow templates: Users can see templates in their organizations
CREATE POLICY "Users can view org workflow templates" ON workflow_templates
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Audit log: Users can see audit logs for their organizations (with role restrictions)
CREATE POLICY "Org admins can view audit logs" ON audit_log
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER organization_members_updated_at 
    BEFORE UPDATE ON organization_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER teams_updated_at 
    BEFORE UPDATE ON teams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER study_collaborators_updated_at 
    BEFORE UPDATE ON study_collaborators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workflow_templates_updated_at 
    BEFORE UPDATE ON workflow_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workflow_instances_updated_at 
    BEFORE UPDATE ON workflow_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workflow_step_executions_updated_at 
    BEFORE UPDATE ON workflow_step_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resource_permissions_updated_at 
    BEFORE UPDATE ON resource_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =====================================================

-- Insert default organization categories
INSERT INTO organizations (id, name, display_name, description, organization_size, subscription_tier, max_members, max_studies, max_participants) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'researchhub-demo', 'ResearchHub Demo Organization', 'Demo organization for testing enterprise features', 'medium', 'enterprise', 100, 1000, 10000),
    ('550e8400-e29b-41d4-a716-446655440001', 'acme-research', 'ACME Research Institute', 'Leading research organization', 'large', 'professional', 50, 500, 5000)
ON CONFLICT (name) DO NOTHING;

-- Insert workflow template examples
INSERT INTO workflow_templates (id, organization_id, name, description, category, trigger_conditions, steps) VALUES
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Study Approval Workflow', 'Standard approval process for new studies', 'study_approval',
     '{"study_created": true, "participant_count": ">100"}',
     '[
        {"type": "approval", "name": "Manager Review", "assignee_role": "manager", "timeout_hours": 48},
        {"type": "approval", "name": "Ethics Review", "assignee_role": "admin", "timeout_hours": 72},
        {"type": "notification", "name": "Approval Complete", "recipients": ["creator", "managers"]}
     ]'::jsonb),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'Data Export Workflow', 'Approval process for data exports', 'data_export',
     '{"export_requested": true, "data_sensitivity": "high"}',
     '[
        {"type": "approval", "name": "Security Review", "assignee_role": "admin", "timeout_hours": 24},
        {"type": "action", "name": "Generate Export", "action": "create_export"},
        {"type": "notification", "name": "Export Ready", "recipients": ["requestor"]}
     ]'::jsonb)
ON CONFLICT DO NOTHING;
