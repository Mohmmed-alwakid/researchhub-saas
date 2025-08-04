#!/usr/bin/env node
/**
 * Safe Component Removal
 * Removes identified unused components with backup
 */

import fs from 'fs/promises';
import path from 'path';

const UNUSED_COMPONENTS = [
  'src/client/components/admin/AdminDebugComponent.tsx',
  'src/client/components/admin/AdminOverview.tsx', 
  'src/client/components/admin/AdminSystem.tsx',
  'src/client/components/admin/AdminWithdrawalQueue.tsx',
  'src/client/components/admin/analytics/SystemAnalyticsDashboard.tsx'
];

async function safeComponentRemoval() {
  console.log('🧹 Safe Component Removal Starting...\n');
  
  const archiveDir = path.join(process.cwd(), 'archive', 'removed-components-' + new Date().toISOString().slice(0, 10));
  
  try {
    // Create archive directory
    await fs.mkdir(archiveDir, { recursive: true });
    console.log(`📦 Archive directory created: ${archiveDir}\n`);
    
    let removedCount = 0;
    
    for (const componentPath of UNUSED_COMPONENTS) {
      const fullPath = path.join(process.cwd(), componentPath);
      
      try {
        // Check if file exists
        await fs.access(fullPath);
        
        // Create archive path
        const archivePath = path.join(archiveDir, componentPath);
        const archiveDirectory = path.dirname(archivePath);
        await fs.mkdir(archiveDirectory, { recursive: true });
        
        // Copy to archive
        await fs.copyFile(fullPath, archivePath);
        
        // Remove original
        await fs.unlink(fullPath);
        
        removedCount++;
        console.log(`✅ Removed: ${path.basename(componentPath)}`);
        console.log(`   📁 ${componentPath}`);
        console.log(`   📦 Archived to: ${archivePath}\n`);
        
      } catch (error) {
        console.log(`⚠️  Could not remove ${path.basename(componentPath)}: ${error.message}\n`);
      }
    }
    
    // Create removal report
    const report = {
      timestamp: new Date().toISOString(),
      removedComponents: removedCount,
      totalTargeted: UNUSED_COMPONENTS.length,
      archiveLocation: archiveDir,
      components: UNUSED_COMPONENTS
    };
    
    await fs.writeFile(
      path.join(archiveDir, 'removal-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('🎉 COMPONENT CLEANUP COMPLETE!');
    console.log(`📊 Removed: ${removedCount}/${UNUSED_COMPONENTS.length} components`);
    console.log(`📁 Archive: ${archiveDir}`);
    console.log(`📋 Report: ${path.join(archiveDir, 'removal-report.json')}\n`);
    
    console.log('🚀 Next Steps:');
    console.log('   1. Test: npm run test:quick');
    console.log('   2. Build: npm run build');
    console.log('   3. Verify: npm run dev:fullstack');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run cleanup
safeComponentRemoval().catch(console.error);
