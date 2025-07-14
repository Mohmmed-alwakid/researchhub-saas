-- PHASE 1: PLATFORM FOUNDATION - DATABASE MIGRATION
-- Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
-- Created: July 12, 2025
-- Status: IMPLEMENTATION READY

-- ==========================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ==========================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- STEP 2: CREATE ENUMS FOR TYPE SAFETY
-- ==========================================

-- User role enumeration (enhanced)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'researcher', 'participant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User status enumeration (enhanced)
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Organization types
DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM ('individual', 'team', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Membership roles
DO $$ BEGIN
    CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Study types (simplified to two core types)
DO $$ BEGIN
    CREATE TYPE study_type AS ENUM ('usability', 'interview');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Study status
DO $$ BEGIN
    CREATE TYPE study_status AS ENUM ('draft', 'published', 'active', 'paused', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Study creation method
DO $$ BEGIN
    CREATE TYPE creation_method AS ENUM ('wizard', 'template', 'duplicate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- STEP 3: ENHANCE EXISTING USERS TABLE
-- ==========================================

-- Add missing security fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_preferences JSONB DEFAULT '{}';

-- Add profile completion tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;

-- ==========================================
-- STEP 4: CREATE USER PROFILES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(200),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==========================================
-- STEP 5: CREATE ORGANIZATIONS SYSTEM
-- ==========================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type organization_type NOT NULL DEFAULT 'individual',
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(organization_id, user_id)
);

-- ==========================================
-- STEP 6: ENHANCE STUDIES TABLE
-- ==========================================

-- Add organization_id to existing studies table if it doesn't exist
ALTER TABLE studies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add missing study configuration fields
ALTER TABLE studies ADD COLUMN IF NOT EXISTS study_type study_type DEFAULT 'usability';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS creation_method creation_method DEFAULT 'wizard';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS usability_config JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS interview_config JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS collaboration_settings JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS analytics_config JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS auto_save_data JSONB DEFAULT '{}';
ALTER TABLE studies ADD COLUMN IF NOT EXISTS last_auto_save TIMESTAMP WITH TIME ZONE;
ALTER TABLE studies ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- ==========================================
-- STEP 7: CREATE STUDY BLOCKS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS study_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  
  -- Block identification
  block_type VARCHAR(50) NOT NULL,
  order_index INTEGER NOT NULL,
  
  -- Block configuration
  title VARCHAR(255),
  description TEXT,
  settings JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  
  -- Conditional logic
  conditions JSONB DEFAULT '{}',
  branching_logic JSONB DEFAULT '{}',
  
  -- Analytics
  analytics_config JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(study_id, order_index)
);

-- ==========================================
-- STEP 8: CREATE COLLABORATION TABLES
-- ==========================================

-- Study collaborators
CREATE TABLE IF NOT EXISTS study_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(study_id, user_id)
);

-- ==========================================
-- STEP 9: CREATE AUDIT AND SYSTEM TABLES
-- ==========================================

-- Audit logs for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings for platform configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 10: CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_id ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id ON organization_memberships(user_id);

-- Studies indexes
CREATE INDEX IF NOT EXISTS idx_studies_organization_id ON studies(organization_id);
CREATE INDEX IF NOT EXISTS idx_studies_created_by ON studies(created_by);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(status);
CREATE INDEX IF NOT EXISTS idx_studies_type ON studies(study_type);

-- Study blocks indexes
CREATE INDEX IF NOT EXISTS idx_study_blocks_study_id ON study_blocks(study_id);
CREATE INDEX IF NOT EXISTS idx_study_blocks_order ON study_blocks(study_id, order_index);

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_study_collaborators_study_id ON study_collaborators(study_id);
CREATE INDEX IF NOT EXISTS idx_study_collaborators_user_id ON study_collaborators(user_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- ==========================================
-- STEP 11: CREATE ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Organizations policies
CREATE POLICY "Users can view organizations they're members of" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization owners can update organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_memberships 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Organization memberships policies
CREATE POLICY "Users can view memberships they're part of" ON organization_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Study blocks policies
CREATE POLICY "Study collaborators can view blocks" ON study_blocks
  FOR SELECT USING (
    study_id IN (
      SELECT study_id FROM study_collaborators 
      WHERE user_id = auth.uid()
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System settings policies
CREATE POLICY "Public settings are viewable by all" ON system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- STEP 12: INSERT DEFAULT DATA
-- ==========================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
  ('app_name', '"ResearchHub"', 'Application name', 'branding', true),
  ('app_version', '"1.0.0"', 'Application version', 'system', true),
  ('maintenance_mode', 'false', 'Maintenance mode flag', 'system', false),
  ('max_study_blocks', '50', 'Maximum blocks per study', 'limits', false),
  ('max_participants_per_study', '1000', 'Maximum participants per study', 'limits', false),
  ('enable_collaboration', 'true', 'Enable collaboration features', 'features', false),
  ('enable_templates', 'true', 'Enable template system', 'features', false),
  ('enable_analytics', 'true', 'Enable analytics tracking', 'features', false)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================

-- Log completion
INSERT INTO audit_logs (action, resource_type, details) VALUES
  ('MIGRATION_COMPLETE', 'DATABASE', '{"migration": "001_platform_foundation", "timestamp": "' || NOW() || '"}');

COMMENT ON SCHEMA public IS 'Platform Foundation Migration Complete - Requirements Compliant Database Schema';
