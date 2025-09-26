import { createClient } from '@supabase/supabase-js';
import { join } from 'path';

import { readFileSync } from 'fs';

/**
 * PHASE 1: DATABASE MIGRATION API ENDPOINT
 * Safely applies the platform foundation migration via API
 * Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
 */
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (action) {
      case 'backup':
        return await createBackup(supabase, res);
      case 'migrate':
        return await runMigration(supabase, res);
      case 'validate':
        return await validateMigration(supabase, res);
      case 'report':
        return await generateReport(supabase, res);
      case 'full':
        return await runFullMigration(supabase, res);
      default:
        return res.status(400).json({ error: 'Invalid action. Use: backup, migrate, validate, report, or full' });
    }
  } catch (error) {
    console.error('Migration API error:', error);
    return res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
}

async function createBackup(supabase, res) {
  try {
    // Get current data counts
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: studyCount } = await supabase.from('studies').select('*', { count: 'exact', head: true });
    
    const backup = {
      timestamp: new Date().toISOString(),
      userCount: userCount || 0,
      studyCount: studyCount || 0,
      migration: '001_platform_foundation'
    };
    
    return res.status(200).json({ 
      success: true, 
      message: 'Backup information collected',
      backup 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Backup failed', 
      details: error.message 
    });
  }
}

async function runMigration(supabase, res) {
  const migrationSteps = [];
  
  try {
    // Step 1: Create enums
    migrationSteps.push('Creating enums...');
    await executeSQL(supabase, `
      DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('admin', 'researcher', 'participant');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await executeSQL(supabase, `
      DO $$ BEGIN
          CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await executeSQL(supabase, `
      DO $$ BEGIN
          CREATE TYPE organization_type AS ENUM ('individual', 'team', 'enterprise');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await executeSQL(supabase, `
      DO $$ BEGIN
          CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 2: Enhance users table
    migrationSteps.push('Enhancing users table...');
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
    `);
    await executeSQL(supabase, `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE;
    `);

    // Step 3: Create user_profiles table
    migrationSteps.push('Creating user_profiles table...');
    await executeSQL(supabase, `
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
    `);

    // Step 4: Create organizations table
    migrationSteps.push('Creating organizations table...');
    await executeSQL(supabase, `
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
    `);

    // Step 5: Create organization_memberships table
    migrationSteps.push('Creating organization_memberships table...');
    await executeSQL(supabase, `
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
    `);

    // Step 6: Create audit_logs table
    migrationSteps.push('Creating audit_logs table...');
    await executeSQL(supabase, `
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
    `);

    // Step 7: Create system_settings table
    migrationSteps.push('Creating system_settings table...');
    await executeSQL(supabase, `
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
    `);

    // Step 8: Insert default system settings
    migrationSteps.push('Inserting default system settings...');
    await executeSQL(supabase, `
      INSERT INTO system_settings (key, value, description, category, is_public) VALUES
        ('app_name', '"ResearchHub"', 'Application name', 'branding', true),
        ('app_version', '"1.0.0"', 'Application version', 'system', true),
        ('maintenance_mode', 'false', 'Maintenance mode flag', 'system', false),
        ('max_study_blocks', '50', 'Maximum blocks per study', 'limits', false)
      ON CONFLICT (key) DO NOTHING;
    `);

    migrationSteps.push('Migration completed successfully!');

    return res.status(200).json({ 
      success: true, 
      message: 'Database migration completed successfully',
      steps: migrationSteps
    });

  } catch (error) {
    migrationSteps.push(`Error: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      details: error.message,
      completedSteps: migrationSteps
    });
  }
}

async function executeSQL(supabase, sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    // Some errors are expected (like "already exists")
    if (!error.message.includes('already exists') && 
        !error.message.includes('duplicate')) {
      throw error;
    }
  }
  return data;
}

async function validateMigration(supabase, res) {
  try {
    const validationResults = [];
    
    // Check if new tables exist
    const tables = ['user_profiles', 'organizations', 'organization_memberships', 'audit_logs', 'system_settings'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1);
        validationResults.push({ 
          table, 
          status: 'exists', 
          accessible: !error 
        });
      } catch (error) {
        validationResults.push({ 
          table, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    // Check system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('*');

    validationResults.push({
      table: 'system_settings',
      status: 'data_check',
      count: settings?.length || 0,
      hasDefaults: settings?.some(s => s.key === 'app_name')
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Migration validation completed',
      results: validationResults
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Validation failed', 
      details: error.message 
    });
  }
}

async function generateReport(supabase, res) {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      migration: '001_platform_foundation',
      tables: []
    };

    // Get table counts
    const tables = ['users', 'user_profiles', 'organizations', 'organization_memberships', 'studies', 'audit_logs', 'system_settings'];
    
    for (const table of tables) {
      try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        report.tables.push({ table, count: count || 0 });
      } catch (error) {
        report.tables.push({ table, count: 'Error', error: error.message });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Migration report generated',
      report
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Report generation failed', 
      details: error.message 
    });
  }
}

async function runFullMigration(supabase, res) {
  try {
    // Run backup
    await createBackup(supabase, { status: () => ({ json: () => {} }) });
    
    // Run migration
    const migrationResult = await runMigration(supabase, { status: () => ({ json: (data) => data }) });
    
    if (!migrationResult.success) {
      throw new Error('Migration failed');
    }

    // Run validation
    const validationResult = await validateMigration(supabase, { status: () => ({ json: (data) => data }) });
    
    // Generate report
    const reportResult = await generateReport(supabase, { status: () => ({ json: (data) => data }) });

    return res.status(200).json({ 
      success: true, 
      message: 'Full migration completed successfully',
      migration: migrationResult,
      validation: validationResult,
      report: reportResult
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Full migration failed', 
      details: error.message 
    });
  }
}
