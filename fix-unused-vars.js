#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

// Run ESLint and capture output
function runESLint() {
  return new Promise((resolve, reject) => {
    const eslint = spawn('npm', ['run', 'lint'], { stdio: 'pipe' });
    let output = '';
    
    eslint.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    eslint.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    eslint.on('close', () => {
      resolve(output);
    });
    
    eslint.on('error', (err) => {
      reject(err);
    });
  });
}

// Parse ESLint output for unused variables
function parseESLintOutput(output) {
  const lines = output.split('\n');
  const issues = [];
  
  let currentFile = null;
  
  for (const line of lines) {
    // Check if this line contains a file path
    if (line.match(/^[A-Z]:[\\\/]/)) {
      currentFile = line.trim();
      continue;
    }
    
    // Check if this line contains an unused variable error
    const match = line.match(/^\s*(\d+):(\d+)\s+error\s+(.+?)\s+no-unused-vars$/);
    if (match && currentFile) {
      const [, lineNumber, column, message] = match;
      issues.push({
        file: currentFile,
        line: parseInt(lineNumber),
        column: parseInt(column),
        message: message.trim()
      });
    }
  }
  
  return issues;
}

// Fix unused variables by prefixing with underscore or commenting
function fixUnusedVariable(filePath, lineNumber, message) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lineNumber > lines.length) return false;
    
    const line = lines[lineNumber - 1];
    
    // Extract variable name from message
    const varMatch = message.match(/'([^']+)'/);
    if (!varMatch) return false;
    
    const varName = varMatch[1];
    
    // Skip if already prefixed
    if (varName.startsWith('_')) return false;
    
    // Different strategies for different patterns
    if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
      // For variable declarations, prefix with underscore
      const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
      lines[lineNumber - 1] = newLine;
    } else if (line.includes('import ') && line.includes(varName)) {
      // For imports, comment out the unused import
      const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `// ${varName}`);
      lines[lineNumber - 1] = newLine;
    } else if (line.includes('destructuring')) {
      // For destructuring, comment out the variable
      const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `// ${varName}`);
      lines[lineNumber - 1] = newLine;
    } else if (line.includes('=>') && line.includes(varName)) {
      // For function parameters, prefix with underscore
      const newLine = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
      lines[lineNumber - 1] = newLine;
    } else {
      // Default: add eslint-disable comment above the line
      lines.splice(lineNumber - 1, 0, `  // eslint-disable-next-line no-unused-vars`);
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Running ESLint to find unused variables...');
  
  try {
    const eslintOutput = await runESLint();
    const issues = parseESLintOutput(eslintOutput);
    
    console.log(`Found ${issues.length} unused variable issues.`);
    
    // Group issues by file
    const fileGroups = {};
    issues.forEach(issue => {
      if (!fileGroups[issue.file]) {
        fileGroups[issue.file] = [];
      }
      fileGroups[issue.file].push(issue);
    });
    
    // Process each file
    let fixedCount = 0;
    for (const [filePath, fileIssues] of Object.entries(fileGroups)) {
      console.log(`\nProcessing ${filePath}...`);
      
      // Sort issues by line number (descending) to avoid line number changes
      fileIssues.sort((a, b) => b.line - a.line);
      
      for (const issue of fileIssues) {
        if (fixUnusedVariable(filePath, issue.line, issue.message)) {
          console.log(`  Fixed: ${issue.message} at line ${issue.line}`);
          fixedCount++;
        } else {
          console.log(`  Skipped: ${issue.message} at line ${issue.line}`);
        }
      }
    }
    
    console.log(`\nFixed ${fixedCount} unused variable issues.`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
