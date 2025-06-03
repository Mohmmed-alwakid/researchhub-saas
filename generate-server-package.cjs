#!/usr/bin/env node

/**
 * Generate dist/server/package.json for Railway deployment
 * This ensures proper JSON formatting across all environments
 */

const fs = require('fs');
const path = require('path');

// Create the dist/server directory if it doesn't exist
const distServerDir = path.join(__dirname, 'dist', 'server');
if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
  console.log('📁 Created dist/server directory');
}

// Create proper package.json with CommonJS module type
const packageJsonContent = {
  "type": "commonjs"
};

const packageJsonPath = path.join(distServerDir, 'package.json');

try {
  // Generate properly formatted JSON with consistent formatting
  const jsonString = JSON.stringify(packageJsonContent, null, 2);
  
  // Write the file
  fs.writeFileSync(packageJsonPath, jsonString + '\n', 'utf8');
  
  console.log('✅ Generated dist/server/package.json successfully');
  console.log('📄 Content:', jsonString);
  
  // Validate by reading it back
  const readBack = fs.readFileSync(packageJsonPath, 'utf8');
  const parsed = JSON.parse(readBack);
  
  if (parsed.type === 'commonjs') {
    console.log('✅ JSON validation successful');
  } else {
    throw new Error('JSON validation failed - type property incorrect');
  }
  
} catch (error) {
  console.error('❌ Failed to generate dist/server/package.json:', error);
  console.error('📁 Target directory:', distServerDir);
  console.error('📄 Target file:', packageJsonPath);
  process.exit(1);
}
