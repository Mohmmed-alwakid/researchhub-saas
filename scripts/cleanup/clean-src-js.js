#!/usr/bin/env node

/**
 * 🧹 Source Directory Cleanup Script
 * Removes any accidentally compiled JavaScript files from TypeScript source
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findJsFilesInSrc(dir) {
  const jsFiles = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith('.js')) {
        // Check if there's a corresponding .ts file
        const tsFile = fullPath.replace('.js', '.ts');
        if (fs.existsSync(tsFile)) {
          jsFiles.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return jsFiles;
}

const srcDir = path.join(__dirname, '..', '..', 'src');
const jsFiles = findJsFilesInSrc(srcDir);

if (jsFiles.length > 0) {
  console.log('🧹 Found TypeScript compilation artifacts in source directory:');
  jsFiles.forEach(file => {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  });
  
  console.log('\n🗑️  Removing compilation artifacts...');
  jsFiles.forEach(file => {
    fs.unlinkSync(file);
    console.log(`  ✅ Removed: ${path.relative(process.cwd(), file)}`);
  });
  
  console.log('\n✅ Source directory cleaned!');
  console.log('💡 Consider checking your TypeScript configuration to prevent this.');
} else {
  console.log('✅ No JavaScript compilation artifacts found in source directory.');
}
