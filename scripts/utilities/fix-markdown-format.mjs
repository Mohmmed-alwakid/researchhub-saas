#!/usr/bin/env node
/**
 * Markdown Formatter - Fix common markdown issues
 * Fixes formatting issues in markdown files
 */

import fs from 'fs/promises';
import path from 'path';

async function fixMarkdownFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    // Fix trailing spaces (MD009)
    const noTrailingSpaces = content.replace(/[ ]+$/gm, '');
    if (noTrailingSpaces !== content) {
      content = noTrailingSpaces;
      modified = true;
    }

    // Fix headings that need blank lines around them (MD022)
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = lines[i - 1];
      const nextLine = lines[i + 1];

      // Add current line
      newLines.push(line);

      // If current line is a heading and next line is not empty, add blank line
      if (line.match(/^#{1,6}\s/) && nextLine && nextLine.trim() !== '') {
        newLines.push('');
        modified = true;
      }

      // If next line is a heading and current line is not empty, add blank line
      if (nextLine && nextLine.match(/^#{1,6}\s/) && line.trim() !== '') {
        newLines.push('');
        modified = true;
      }

      // If current line starts a list and previous line is not empty, add blank line before
      if (line.match(/^[\s]*[-*+]\s/) && prevLine && prevLine.trim() !== '') {
        // Insert blank line before current line
        newLines.splice(-1, 0, '');
        modified = true;
      }

      // If current line ends a list and next line is not empty, add blank line after
      if (line.match(/^[\s]*[-*+]\s/) && nextLine && nextLine.trim() !== '' && !nextLine.match(/^[\s]*[-*+]\s/)) {
        newLines.push('');
        modified = true;
      }
    }

    if (modified) {
      const fixedContent = newLines.join('\n');
      await fs.writeFile(filePath, fixedContent);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`✨ Already clean: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting Markdown Formatting...\n');

  // Check if specific file provided as argument
  const specificFile = process.argv[2];
  
  const filesToFix = specificFile ? [specificFile] : [
    'docs/DOCUMENTATION_INDEX.md',
    'README.md',
    'docs/CHANGELOG.md',
    'docs/README.md'
  ];

  let totalFixed = 0;

  for (const file of filesToFix) {
    const fullPath = path.resolve(file);
    try {
      await fs.access(fullPath);
      const wasFixed = await fixMarkdownFile(fullPath);
      if (wasFixed) totalFixed++;
    } catch (error) {
      console.log(`⚠️ File not found: ${file}`);
    }
  }

  console.log(`\n📊 Total files fixed: ${totalFixed}`);
  console.log('✅ Markdown formatting complete!');
}

main();
