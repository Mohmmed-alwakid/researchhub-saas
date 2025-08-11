#!/usr/bin/env node

/**
 * Console Log Suppression Script
 * Automatically wraps console.log statements with environment checks
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

class ConsoleLogSuppressor {
  async suppressLogsInFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      
      // Skip if already processed
      if (content.includes('VITE_DEBUG_MODE') && content.includes('console.log')) {
        return false;
      }
      
      // Replace standalone console.log statements
      content = content.replace(
        /(\s+)console\.log\(/g,
        '$1if (import.meta.env.VITE_DEBUG_MODE === \'true\') console.log('
      );
      
      writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  async suppressInProject() {
    console.log('🔇 Suppressing console.log statements...');
    
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx'
    ];
    
    let processedCount = 0;
    
    for (const pattern of patterns) {
      const files = await glob(pattern);
      
      for (const file of files) {
        if (file.includes('node_modules')) continue;
        
        const processed = await this.suppressLogsInFile(file);
        if (processed) {
          processedCount++;
          console.log(`✅ Processed: ${file}`);
        }
      }
    }
    
    console.log(`\n🎯 Processed ${processedCount} files`);
    console.log('Console logs are now environment-aware!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const suppressor = new ConsoleLogSuppressor();
  suppressor.suppressInProject().catch(console.error);
}

export default ConsoleLogSuppressor;
