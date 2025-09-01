#!/usr/bin/env node

/**
 * Simple Database Migration Application Script
 * Purpose: Apply comprehensive usage tracking migration using Supabase client
 * Date: September 1, 2025
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://cgobqlfqvmhvbjwagzca.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb2JxbGZxdm1odmJqd2FnemNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk5MjkzOCwiZXhwIjoyMDQ5NTY4OTM4fQ.lzNLcBWm8Vd8Z94IhCeaSmOdFa9l3YI2c6Jp_Xj1PuY';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTablesManually() {
    console.log('🚀 Creating database tables manually...\n');

    const tables = [
        {
            name: 'user_usage_stats',
            sql: `
                CREATE TABLE IF NOT EXISTS user_usage_stats (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
                    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
                    studies_created_this_period INTEGER DEFAULT 0,
                    studies_total INTEGER DEFAULT 0,
                    max_studies_allowed INTEGER DEFAULT 3,
                    participants_this_period INTEGER DEFAULT 0,
                    participants_total INTEGER DEFAULT 0,
                    max_participants_per_study INTEGER DEFAULT 10,
                    recording_minutes_this_period INTEGER DEFAULT 0,
                    recording_minutes_total INTEGER DEFAULT 0,
                    max_recording_minutes INTEGER DEFAULT 60,
                    advanced_analytics_enabled BOOLEAN DEFAULT FALSE,
                    data_export_enabled BOOLEAN DEFAULT FALSE,
                    team_collaboration_enabled BOOLEAN DEFAULT FALSE,
                    priority_support_enabled BOOLEAN DEFAULT FALSE,
                    custom_branding_enabled BOOLEAN DEFAULT FALSE,
                    api_access_enabled BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(user_id)
                );
            `
        },
        {
            name: 'plan_limits',
            sql: `
                CREATE TABLE IF NOT EXISTS plan_limits (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    plan_id VARCHAR(20) NOT NULL UNIQUE,
                    plan_name VARCHAR(50) NOT NULL,
                    max_studies_per_month INTEGER NOT NULL,
                    max_participants_per_study INTEGER NOT NULL,
                    max_recording_minutes INTEGER NOT NULL,
                    advanced_analytics BOOLEAN DEFAULT FALSE,
                    data_export BOOLEAN DEFAULT FALSE,
                    team_collaboration BOOLEAN DEFAULT FALSE,
                    priority_support BOOLEAN DEFAULT FALSE,
                    custom_branding BOOLEAN DEFAULT FALSE,
                    api_access BOOLEAN DEFAULT FALSE,
                    sso_integration BOOLEAN DEFAULT FALSE,
                    monthly_price DECIMAL(10,2) DEFAULT 0,
                    currency VARCHAR(3) DEFAULT 'USD',
                    is_active BOOLEAN DEFAULT TRUE,
                    display_order INTEGER DEFAULT 0,
                    description TEXT,
                    features_list JSONB DEFAULT '[]',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        },
        {
            name: 'user_subscriptions',
            sql: `
                CREATE TABLE IF NOT EXISTS user_subscriptions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    plan_id VARCHAR(20) NOT NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'active',
                    paypal_subscription_id VARCHAR(100) UNIQUE,
                    paypal_plan_id VARCHAR(100),
                    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
                    next_billing_date TIMESTAMP WITH TIME ZONE,
                    amount DECIMAL(10,2) DEFAULT 0,
                    currency VARCHAR(3) DEFAULT 'USD',
                    auto_renew BOOLEAN DEFAULT TRUE,
                    cancelled_at TIMESTAMP WITH TIME ZONE,
                    expires_at TIMESTAMP WITH TIME ZONE,
                    trial_ends_at TIMESTAMP WITH TIME ZONE,
                    payment_method VARCHAR(50) DEFAULT 'paypal',
                    created_by UUID REFERENCES users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        },
        {
            name: 'usage_events',
            sql: `
                CREATE TABLE IF NOT EXISTS usage_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    event_type VARCHAR(50) NOT NULL,
                    event_category VARCHAR(30) NOT NULL,
                    event_data JSONB DEFAULT '{}',
                    study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
                    organization_id UUID,
                    session_id VARCHAR(100),
                    ip_address INET,
                    user_agent TEXT,
                    duration_seconds INTEGER,
                    bytes_processed BIGINT,
                    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        },
        {
            name: 'notifications',
            sql: `
                CREATE TABLE IF NOT EXISTS notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(30) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    is_important BOOLEAN DEFAULT FALSE,
                    auto_dismiss_at TIMESTAMP WITH TIME ZONE,
                    action_url TEXT,
                    action_label VARCHAR(50),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    read_at TIMESTAMP WITH TIME ZONE,
                    dismissed_at TIMESTAMP WITH TIME ZONE
                );
            `
        },
        {
            name: 'system_alerts',
            sql: `
                CREATE TABLE IF NOT EXISTS system_alerts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    alert_type VARCHAR(50) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT NOT NULL,
                    affected_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    related_resource_type VARCHAR(50),
                    related_resource_id UUID,
                    status VARCHAR(20) DEFAULT 'open',
                    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    alert_data JSONB DEFAULT '{}',
                    resolution_notes TEXT,
                    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    acknowledged_at TIMESTAMP WITH TIME ZONE,
                    resolved_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        }
    ];

    // Create tables one by one
    for (const table of tables) {
        try {
            console.log(`🔄 Creating table: ${table.name}`);
            
            // We'll create tables by inserting test data and let Supabase auto-create
            // This is a workaround since direct SQL execution is limited
            
            const { error } = await supabase
                .from(table.name)
                .select('id')
                .limit(1);

            if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log(`⚠️  Table ${table.name} doesn't exist. Manual creation needed.`);
            } else {
                console.log(`✅ Table ${table.name} already exists or accessible`);
            }

        } catch (error) {
            console.log(`❌ Error checking table ${table.name}:`, error.message);
        }
    }

    // Insert plan limits data
    console.log('\n🔄 Inserting plan limits...');
    
    const planLimits = [
        {
            plan_id: 'free',
            plan_name: 'Free Plan',
            max_studies_per_month: 3,
            max_participants_per_study: 10,
            max_recording_minutes: 60,
            monthly_price: 0,
            features_list: ['3 studies per month', '10 participants per study', '60 minutes recording', 'Basic analytics']
        },
        {
            plan_id: 'basic',
            plan_name: 'Basic Plan',
            max_studies_per_month: 15,
            max_participants_per_study: 50,
            max_recording_minutes: 300,
            monthly_price: 29,
            advanced_analytics: true,
            data_export: true,
            features_list: ['15 studies per month', '50 participants per study', '300 minutes recording', 'Advanced analytics', 'Data export']
        },
        {
            plan_id: 'pro',
            plan_name: 'Pro Plan',
            max_studies_per_month: -1,
            max_participants_per_study: 200,
            max_recording_minutes: -1,
            monthly_price: 79,
            advanced_analytics: true,
            data_export: true,
            team_collaboration: true,
            priority_support: true,
            custom_branding: true,
            features_list: ['Unlimited studies', '200 participants per study', 'Unlimited recording', 'Team collaboration', 'Priority support', 'Custom branding']
        },
        {
            plan_id: 'enterprise',
            plan_name: 'Enterprise Plan',
            max_studies_per_month: -1,
            max_participants_per_study: -1,
            max_recording_minutes: -1,
            monthly_price: 199,
            advanced_analytics: true,
            data_export: true,
            team_collaboration: true,
            priority_support: true,
            custom_branding: true,
            api_access: true,
            sso_integration: true,
            features_list: ['Everything in Pro', 'Unlimited participants', 'SSO integration', 'API access', 'Dedicated support']
        }
    ];

    try {
        const { error } = await supabase
            .from('plan_limits')
            .upsert(planLimits, { onConflict: 'plan_id' });

        if (error) {
            console.log('⚠️  Could not insert plan limits (table may not exist):', error.message);
        } else {
            console.log('✅ Plan limits inserted successfully');
        }
    } catch (error) {
        console.log('⚠️  Plan limits insertion failed:', error.message);
    }

    console.log('\n🎯 Migration Summary:');
    console.log('⚠️  Some tables may need manual creation in Supabase dashboard');
    console.log('📋 Plan data ready for insertion once tables exist');
    console.log('🚀 Ready for manual table creation in Supabase SQL editor');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and execute the SQL from comprehensive_usage_tracking_migration.sql');
    console.log('4. Verify tables are created');
    console.log('5. Run this script again to populate data');
}

// Execute migration
createTablesManually().catch(console.error);
