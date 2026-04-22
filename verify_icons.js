const fs = require('fs');
const path = require('path');
const lucide = require('lucide-react');

function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, ext, fileList);
    } else if (file.endsWith(ext)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const componentFiles = findFiles('./src', '.tsx');
let hasError = false;

componentFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importMatch = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*["']lucide-react["']/);
  if (importMatch) {
    const icons = importMatch[1].split(',').map(s => s.trim());
    icons.forEach(icon => {
      if (icon && !lucide[icon]) {
        console.error(`Error: Icon "${icon}" in ${file} is undefined in lucide-react.`);
        hasError = true;
      }
    });
  }
});

if (!hasError) console.log('All icons verified successfully!');
process.exit(hasError ? 1 : 0);
