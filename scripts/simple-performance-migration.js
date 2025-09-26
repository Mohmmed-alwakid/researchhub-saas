// Simple Performance Migration Applier
// Week 4 Day 1 - Database Performance Optimization

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (using local environment)
const supabaseUrl = 'https://lhjrukktnlwqclkxgzuk.supabase.co';
const supabaseServiceKey = ''PLACEHOLDER_SUPABASE_SERVICE_ROLE_KEY'';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPerformanceIndexes() {
  console.log('🚀 Applying Performance Optimization Indexes...');
  console.log('================================================');

  const indexes = [
    {
      name: 'Organization Members User Lookup',
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_user_lookup 
            ON organization_members(user_id, organization_id, role);`
    },
    {
      name: 'Study Collaborators Performance',
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_collaborators_performance 
            ON study_collaborators(study_id, user_id, role);`
    },
    {
      name: 'Collaboration Activity Timeline',
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_activity_timeline 
            ON collaboration_activity(study_id, created_at DESC, activity_type);`
    },
    {
      name: 'Studies Organization Lookup',
      sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_studies_organization_lookup 
            ON studies(organization_id, status, created_at DESC);`
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const index of indexes) {
    try {
      console.log(`📋 Creating index: ${index.name}...`);
      
      const { data, error } = await supabase.rpc('execute_sql', {
        query: index.sql
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⏭️  Index already exists, skipping`);
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Index created successfully`);
        successCount++;
      }
    } catch (error) {
      console.error(`   ❌ Failed to create index: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n📊 SUMMARY');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All performance indexes applied successfully!');
    await testQueryPerformance();
  }
}

async function testQueryPerformance() {
  console.log('\n⚡ Testing Query Performance...');
  
  const tests = [
    {
      name: 'Organization Member Count',
      query: 'SELECT COUNT(*) FROM organization_members;'
    },
    {
      name: 'Study Collaborators Count',
      query: 'SELECT COUNT(*) FROM study_collaborators;'
    },
    {
      name: 'Recent Activity',
      query: 'SELECT COUNT(*) FROM collaboration_activity WHERE created_at >= NOW() - INTERVAL \'7 days\';'
    }
  ];

  for (const test of tests) {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.rpc('execute_sql', {
        query: test.query
      });
      
      const executionTime = Date.now() - startTime;
      
      if (error) throw error;
      
      console.log(`✅ ${test.name}: ${executionTime}ms (${data?.[0]?.count || 0} rows)`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}

// Run the migration
applyPerformanceIndexes().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
