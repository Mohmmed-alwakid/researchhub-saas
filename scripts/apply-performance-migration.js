// Apply Week 4 Day 1 Performance Optimization Migration
// Date: June 29, 2025

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
);

/**
 * Apply performance optimization migration
 */
async function applyPerformanceOptimization() {
  console.log('🚀 Applying Week 4 Day 1 Performance Optimization Migration...');
  console.log('================================================================');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'week4_day1_performance_optimization.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let skipCount = 0;
    const errors = [];

    // Execute each statement individually for better error handling
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        // For CREATE INDEX CONCURRENTLY statements, we need special handling
        if (statement.includes('CREATE INDEX CONCURRENTLY')) {
          console.log('   📋 Creating index concurrently (this may take a moment)...');
        }

        const { data, error } = await supabase.rpc('execute_sql', {
          query: statement + ';'
        });

        if (error) {
          // Check if error is due to index already existing
          if (error.message.includes('already exists')) {
            console.log(`   ⏭️  Skipped: Object already exists`);
            skipCount++;
          } else {
            throw error;
          }
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }

      } catch (error) {
        console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
        errors.push({
          statement: i + 1,
          sql: statement.substring(0, 100) + '...',
          error: error.message
        });
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('syntax error') || error.message.includes('permission denied')) {
          console.error('💥 Critical error detected, stopping migration');
          break;
        }
      }
    }

    // Summary
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('====================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. Statement ${err.statement}: ${err.error}`);
        console.log(`   SQL: ${err.sql}`);
      });
    }

    // Verify critical indexes were created
    await verifyIndexes();

    if (errors.length === 0) {
      console.log('\n🎉 Performance optimization migration completed successfully!');
      return { success: true, successCount, skipCount, errors: [] };
    } else {
      console.log('\n⚠️  Migration completed with some errors. Review the errors above.');
      return { success: false, successCount, skipCount, errors };
    }

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    throw error;
  }
}

/**
 * Verify that critical performance indexes were created
 */
async function verifyIndexes() {
  console.log('\n🔍 Verifying critical indexes...');
  
  const criticalIndexes = [
    'idx_organization_members_user_lookup',
    'idx_study_collaborators_performance',
    'idx_collaboration_activity_timeline',
    'idx_studies_organization_lookup'
  ];

  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      query: `
        SELECT indexname, tablename, indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname = ANY($1);
      `,
      params: [criticalIndexes]
    });

    if (error) throw error;

    const foundIndexes = data?.map(idx => idx.indexname) || [];
    const missingIndexes = criticalIndexes.filter(idx => !foundIndexes.includes(idx));

    console.log(`   ✅ Found ${foundIndexes.length}/${criticalIndexes.length} critical indexes`);
    
    if (missingIndexes.length > 0) {
      console.log(`   ⚠️  Missing indexes: ${missingIndexes.join(', ')}`);
    }

    foundIndexes.forEach(idx => {
      console.log(`   📋 ${idx} - Created successfully`);
    });

  } catch (error) {
    console.error('   ❌ Error verifying indexes:', error.message);
  }
}

/**
 * Test performance improvements after migration
 */
async function testPerformanceImprovements() {
  console.log('\n⚡ Testing performance improvements...');
  
  const testQueries = [
    {
      name: 'Organization Member Lookup',
      query: `
        SELECT COUNT(*) 
        FROM organization_members om
        WHERE om.user_id = (SELECT id FROM auth.users LIMIT 1)
          AND om.role = 'admin';
      `
    },
    {
      name: 'Study Collaborators Query',
      query: `
        SELECT COUNT(*) 
        FROM study_collaborators sc
        JOIN studies s ON sc.study_id = s.id
        WHERE sc.role IN ('owner', 'editor')
        ORDER BY sc.added_at DESC
        LIMIT 10;
      `
    },
    {
      name: 'Collaboration Activity Feed',
      query: `
        SELECT COUNT(*) 
        FROM collaboration_activity ca
        WHERE ca.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY ca.created_at DESC
        LIMIT 20;
      `
    }
  ];

  for (const test of testQueries) {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.rpc('execute_sql', {
        query: test.query
      });
      
      const executionTime = Date.now() - startTime;
      
      if (error) throw error;
      
      console.log(`   ✅ ${test.name}: ${executionTime}ms`);
      
    } catch (error) {
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const result = await applyPerformanceOptimization();
    
    if (result.success) {
      await testPerformanceImprovements();
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Run performance analysis: npm run analyze-performance');
      console.log('2. Set up Redis caching (Day 2 task)');
      console.log('3. Implement API rate limiting (Day 3 task)');
      console.log('4. Monitor query performance in production');
    }
    
    return result;
  } catch (error) {
    console.error('💥 Failed to apply performance optimization:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  applyPerformanceOptimization,
  verifyIndexes,
  testPerformanceImprovements
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
