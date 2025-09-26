import fs from 'fs';

console.log('🔧 FINAL SUPABASE CORRUPTION FIX\n');

const corruptedFiles = [
  'api/planEnforcementMiddleware.js',
  'api/research-consolidated.js', 
  'api/setup.js',
  'api/system-consolidated.js'
];

corruptedFiles.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all malformed patterns
  content = content.replace(
    /process\.env\.SUPABASE_ANON_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g,
    "process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'"
  );
  
  content = content.replace(
    /process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g,
    "process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'"
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n🎉 ALL SUPABASE CORRUPTION FIXED!');
console.log('🚀 Ready to test: npm run dev:fullstack');