/**
 * Database Migration Script for Collaborative Features
 * Creates tables for real-time collaboration, approvals, comments, and activities
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCollaborationTables() {
  console.log('Creating collaboration tables...');

  const sql = `
    -- Collaboration Sessions Table
    CREATE TABLE IF NOT EXISTS collaboration_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      workspace_id UUID,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'away', 'inactive')),
      cursor_position JSONB,
      current_element TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, entity_type, entity_id)
    );

    -- User Presence Table
    CREATE TABLE IF NOT EXISTS user_presence (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
      last_seen TIMESTAMPTZ DEFAULT NOW(),
      current_element TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Collaboration Edits Table
    CREATE TABLE IF NOT EXISTS collaboration_edits (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      element_id TEXT NOT NULL,
      operation_data JSONB DEFAULT '{}',
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Approval Queue Table
    CREATE TABLE IF NOT EXISTS approval_queue (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      workspace_id UUID NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_title TEXT NOT NULL,
      submitted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
      reviewed_by UUID REFERENCES auth.users(id),
      reviewed_at TIMESTAMPTZ,
      comments TEXT,
      review_comments TEXT,
      metadata JSONB DEFAULT '{}',
      review_metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Approval History Table
    CREATE TABLE IF NOT EXISTS approval_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      approval_id UUID REFERENCES approval_queue(id) ON DELETE CASCADE,
      action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'changes_requested', 'resubmitted')),
      performed_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      performed_at TIMESTAMPTZ DEFAULT NOW(),
      comments TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Comments Table
    CREATE TABLE IF NOT EXISTS comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      workspace_id UUID,
      author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      mentions UUID[] DEFAULT '{}',
      is_resolved BOOLEAN DEFAULT FALSE,
      is_edited BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE,
      resolved_by UUID REFERENCES auth.users(id),
      resolved_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Comment Reactions Table
    CREATE TABLE IF NOT EXISTS comment_reactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      reaction_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(comment_id, user_id, reaction_type)
    );

    -- Collaboration Activity Table
    CREATE TABLE IF NOT EXISTS collaboration_activity (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      workspace_id UUID,
      metadata JSONB DEFAULT '{}',
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_entity ON collaboration_sessions(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_user ON collaboration_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_workspace ON collaboration_sessions(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_last_seen ON collaboration_sessions(last_seen);

    CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
    CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

    CREATE INDEX IF NOT EXISTS idx_collaboration_edits_entity ON collaboration_edits(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_edits_user ON collaboration_edits(user_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_edits_timestamp ON collaboration_edits(timestamp);

    CREATE INDEX IF NOT EXISTS idx_approval_queue_workspace ON approval_queue(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_approval_queue_status ON approval_queue(status);
    CREATE INDEX IF NOT EXISTS idx_approval_queue_priority ON approval_queue(priority);
    CREATE INDEX IF NOT EXISTS idx_approval_queue_submitted_by ON approval_queue(submitted_by);
    CREATE INDEX IF NOT EXISTS idx_approval_queue_entity ON approval_queue(entity_type, entity_id);

    CREATE INDEX IF NOT EXISTS idx_approval_history_approval ON approval_history(approval_id);
    CREATE INDEX IF NOT EXISTS idx_approval_history_performer ON approval_history(performed_by);
    CREATE INDEX IF NOT EXISTS idx_approval_history_performed_at ON approval_history(performed_at);

    CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_comments_workspace ON comments(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_comments_resolved ON comments(is_resolved);
    CREATE INDEX IF NOT EXISTS idx_comments_mentions ON comments USING GIN(mentions);

    CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
    CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id);

    CREATE INDEX IF NOT EXISTS idx_collaboration_activity_user ON collaboration_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_activity_entity ON collaboration_activity(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_activity_workspace ON collaboration_activity(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_collaboration_activity_timestamp ON collaboration_activity(timestamp);
    CREATE INDEX IF NOT EXISTS idx_collaboration_activity_type ON collaboration_activity(activity_type);

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

    -- Enable Row Level Security
    ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
    ALTER TABLE collaboration_edits ENABLE ROW LEVEL SECURITY;
    ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
    ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE collaboration_activity ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error('Error creating tables:', error);
      return false;
    }
    console.log('✅ Collaboration tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

async function createRLSPolicies() {
  console.log('Creating RLS policies...');

  const policies = `
    -- Collaboration Sessions Policies
    CREATE POLICY "Users can manage their own collaboration sessions"
      ON collaboration_sessions FOR ALL
      USING (user_id = auth.uid());

    CREATE POLICY "Users can view collaboration sessions in their workspaces"
      ON collaboration_sessions FOR SELECT
      USING (
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid()
        )
      );

    -- User Presence Policies
    CREATE POLICY "Users can manage their own presence"
      ON user_presence FOR ALL
      USING (user_id = auth.uid());

    CREATE POLICY "Users can view presence of workspace members"
      ON user_presence FOR SELECT
      USING (
        user_id IN (
          SELECT DISTINCT wm.user_id
          FROM workspace_members wm1
          JOIN workspace_members wm ON wm.workspace_id = wm1.workspace_id
          WHERE wm1.user_id = auth.uid()
        )
      );

    -- Collaboration Edits Policies
    CREATE POLICY "Users can create collaboration edits"
      ON collaboration_edits FOR INSERT
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can view edits in their accessible entities"
      ON collaboration_edits FOR SELECT
      USING (
        entity_type = 'study' AND entity_id IN (
          SELECT s.id::text
          FROM studies s
          JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
          WHERE wm.user_id = auth.uid()
        )
      );

    -- Approval Queue Policies
    CREATE POLICY "Users can submit items for approval in their workspaces"
      ON approval_queue FOR INSERT
      WITH CHECK (
        submitted_by = auth.uid() AND
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can view approval queue in their workspaces"
      ON approval_queue FOR SELECT
      USING (
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Workspace owners and editors can update approvals"
      ON approval_queue FOR UPDATE
      USING (
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid() 
          AND role IN ('owner', 'editor')
        )
      );

    -- Approval History Policies
    CREATE POLICY "Users can view approval history in their workspaces"
      ON approval_history FOR SELECT
      USING (
        approval_id IN (
          SELECT id 
          FROM approval_queue 
          WHERE workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid()
          )
        )
      );

    CREATE POLICY "Users can create approval history entries"
      ON approval_history FOR INSERT
      WITH CHECK (performed_by = auth.uid());

    -- Comments Policies
    CREATE POLICY "Users can create comments in their accessible entities"
      ON comments FOR INSERT
      WITH CHECK (
        author_id = auth.uid() AND
        (
          workspace_id IS NULL OR
          workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid()
          )
        )
      );

    CREATE POLICY "Users can view comments in their accessible entities"
      ON comments FOR SELECT
      USING (
        workspace_id IS NULL OR
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can update their own comments"
      ON comments FOR UPDATE
      USING (author_id = auth.uid());

    CREATE POLICY "Workspace owners and editors can manage comments"
      ON comments FOR UPDATE
      USING (
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid() 
          AND role IN ('owner', 'editor')
        )
      );

    -- Comment Reactions Policies
    CREATE POLICY "Users can manage their own reactions"
      ON comment_reactions FOR ALL
      USING (user_id = auth.uid());

    CREATE POLICY "Users can view reactions on accessible comments"
      ON comment_reactions FOR SELECT
      USING (
        comment_id IN (
          SELECT id 
          FROM comments 
          WHERE workspace_id IS NULL OR workspace_id IN (
            SELECT workspace_id 
            FROM workspace_members 
            WHERE user_id = auth.uid()
          )
        )
      );

    -- Collaboration Activity Policies
    CREATE POLICY "Users can create activity entries"
      ON collaboration_activity FOR INSERT
      WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can view activity in their workspaces"
      ON collaboration_activity FOR SELECT
      USING (
        workspace_id IS NULL OR
        workspace_id IN (
          SELECT workspace_id 
          FROM workspace_members 
          WHERE user_id = auth.uid()
        )
      );

    -- Notifications Policies
    CREATE POLICY "Users can manage their own notifications"
      ON notifications FOR ALL
      USING (user_id = auth.uid());
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { query: policies });
    if (error) {
      console.error('Error creating RLS policies:', error);
      return false;
    }
    console.log('✅ RLS policies created successfully');
    return true;
  } catch (error) {
    console.error('Error creating RLS policies:', error);
    return false;
  }
}

async function runMigration() {
  console.log('🚀 Starting collaboration features migration...');

  try {
    // Create the exec_sql function if it doesn't exist
    const { error: funcError } = await supabase.rpc('exec_sql', { 
      query: `
        CREATE OR REPLACE FUNCTION exec_sql(query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE query;
        END;
        $$;
      ` 
    });

    if (funcError) {
      console.log('Note: exec_sql function may already exist');
    }

    const tablesSuccess = await createCollaborationTables();
    if (!tablesSuccess) {
      console.error('❌ Failed to create tables');
      process.exit(1);
    }

    const policiesSuccess = await createRLSPolicies();
    if (!policiesSuccess) {
      console.error('❌ Failed to create RLS policies');
      process.exit(1);
    }

    console.log('✅ Collaboration features migration completed successfully!');
    console.log('📝 Tables created:');
    console.log('  - collaboration_sessions');
    console.log('  - user_presence');
    console.log('  - collaboration_edits');
    console.log('  - approval_queue');
    console.log('  - approval_history');
    console.log('  - comments');
    console.log('  - comment_reactions');
    console.log('  - collaboration_activity');
    console.log('  - notifications');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration, createCollaborationTables, createRLSPolicies };
