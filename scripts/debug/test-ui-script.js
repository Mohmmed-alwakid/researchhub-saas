#!/usr/bin/env node

/**
 * Simplified UI Test Script
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('Testing UI script...');

// Configuration
const SRC_DIR = './src';
const REPORTS_DIR = './ui-improvement-reports';

console.log('SRC_DIR:', SRC_DIR);
console.log('REPORTS_DIR:', REPORTS_DIR);

// Create reports directory if it doesn't exist
if (!fs.existsSync(REPORTS_DIR)) {
  console.log('Creating reports directory...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Test glob pattern
console.log('Testing glob pattern...');
try {
  const files = glob.sync(`${SRC_DIR}/**/*.{ts,tsx}`, { 
    ignore: ['**/*.d.ts', '**/node_modules/**'] 
  });
  console.log(`Found ${files.length} files`);
  console.log('First 5 files:', files.slice(0, 5));
} catch (error) {
  console.error('Glob error:', error);
}

console.log('Script completed');
