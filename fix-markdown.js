import fs from 'fs';

// Read the USER_MANAGEMENT_CONSOLIDATION_COMPLETE.md file
let content = fs.readFileSync('USER_MANAGEMENT_CONSOLIDATION_COMPLETE.md', 'utf8');

// Fix various markdown issues
// 1. Fix trailing spaces (MD009)
content = content.replace(/[ ]+$/gm, '');

// 2. Fix lists that need blank lines around them (MD032)
// Split into lines for processing
let lines = content.split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const prevLine = lines[i - 1];
  const nextLine = lines[i + 1];
  
  // If current line starts a list and previous line is not empty, add blank line before
  if (line.match(/^- /) && prevLine && prevLine.trim() !== '' && !prevLine.match(/^- /)) {
    newLines.push('');
  }
  
  // Add current line
  newLines.push(line);
  
  // If current line ends a list and next line is not empty and not a list item, add blank line after
  if (line.match(/^- /) && nextLine && nextLine.trim() !== '' && !nextLine.match(/^- /)) {
    newLines.push('');
  }
  
  // Fix headings that need blank lines below (MD022)
  if (line.startsWith('### ') && nextLine && nextLine.trim() !== '' && !nextLine.startsWith('```')) {
    newLines.push('');
  }
  
  // Fix code blocks that need blank lines around them (MD031)
  if (line === '```typescript' && prevLine && prevLine.trim() !== '' && !prevLine.startsWith('### ')) {
    // Remove the line we just added and add it with a blank line before
    newLines.pop();
    newLines.push('');
    newLines.push(line);
  }
}

// Join lines back
const fixedContent = newLines.join('\n');

// Write the file back
fs.writeFileSync('USER_MANAGEMENT_CONSOLIDATION_COMPLETE.md', fixedContent, 'utf8');

console.log('Fixed all markdown formatting issues in USER_MANAGEMENT_CONSOLIDATION_COMPLETE.md');
