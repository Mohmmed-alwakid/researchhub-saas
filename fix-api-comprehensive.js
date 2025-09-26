import fs from 'fs';
import path from 'path';

console.log('🔧 COMPREHENSIVE API CORRUPTION FIX - Phase 2\n');

const filesToFix = [
  'api/auth-consolidated.js',
  'api/templates-consolidated.js', 
  'api/research-consolidated.js',
  'api/payments-consolidated-full.js',
  'api/user-profile-consolidated.js',
  'api/system-consolidated.js',
  'api/setup.js',
  'api/planEnforcementMiddleware.js'
];

let totalFixed = 0;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let changeCount = 0;

  // Fix 1: Malformed ANON_KEY
  const pattern1 = /process\.env\.SUPABASE_ANON_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, "process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'");
    changeCount++;
  }

  // Fix 2: Malformed SERVICE_ROLE_KEY  
  const pattern2 = /process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, "process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'");
    changeCount++;
  }

  // Fix 3: Remove duplicate variable declarations
  const lines = content.split('\n');
  const cleanedLines = [];
  const seenVariables = new Set();
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Skip duplicate Supabase variable declarations
    if (trimmed.startsWith('const supabaseUrl =') || 
        trimmed.startsWith('const supabaseKey =') || 
        trimmed.startsWith('const supabaseServiceKey =')) {
      if (seenVariables.has(trimmed)) {
        changeCount++;
        continue; // Skip duplicate
      }
      seenVariables.add(trimmed);
    }
    
    cleanedLines.push(line);
  }
  
  const cleanedContent = cleanedLines.join('\n');
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, cleanedContent);
    totalFixed++;
    console.log(`✅ Fixed ${changeCount} issues in ${path.basename(filePath)}`);
  }
});

console.log(`\n🎉 Phase 2 Complete: Fixed ${totalFixed} files!`);
console.log('🚀 Ready to test: npm run dev:fullstack');