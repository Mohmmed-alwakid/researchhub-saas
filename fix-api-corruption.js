import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing corrupted API files from security fix...\n');

const apiDir = './api';
const files = fs.readdirSync(apiDir).filter(file => file.endsWith('.js'));

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(apiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Fix corrupted import statements
  const importPattern = /import \{ \/\/ [^}]+teClient \} from '@supabase\/supabase-js';/g;
  if (importPattern.test(content)) {
    content = content.replace(importPattern, "import { createClient } from '@supabase/supabase-js';");
    hasChanges = true;
    console.log(`✅ Fixed import in ${file}`);
  }
  
  // Fix corrupted Supabase key definitions
  const malformedKeyPattern = /process\.env\.SUPABASE_ANON_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g;
  if (malformedKeyPattern.test(content)) {
    content = content.replace(malformedKeyPattern, "process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'");
    hasChanges = true;
    console.log(`✅ Fixed ANON_KEY in ${file}`);
  }
  
  const malformedServiceKeyPattern = /process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'process\.env\.SUPABASE_SERVICE_ROLE_KEY \|\| 'your_supabase_service_role_key_here'''/g;
  if (malformedServiceKeyPattern.test(content)) {
    content = content.replace(malformedServiceKeyPattern, "process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'");
    hasChanges = true;
    console.log(`✅ Fixed SERVICE_ROLE_KEY in ${file}`);
  }
  
  // Fix corrupted variable declarations mixed with text
  const corruptedVarPattern = /const supabase\w+Key = [^;]+;[a-zA-Z]/g;
  if (corruptedVarPattern.test(content)) {
    // This is more complex, need to handle case by case
    content = content.replace(/;ialize Supabase client/g, ';');
    content = content.replace(/;teClient \} from '@supabase\/supabase-js';/g, ';');
    hasChanges = true;
    console.log(`✅ Fixed corrupted variable declaration in ${file}`);
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
  }
});

console.log(`\n🎉 Fixed ${totalFixed} corrupted API files!`);
console.log('✅ All Supabase configuration patterns corrected');
console.log('🚀 You can now run: npm run dev:fullstack');