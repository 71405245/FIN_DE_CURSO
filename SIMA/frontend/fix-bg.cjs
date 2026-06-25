const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content.replace(/background:\s*['"](?:#ffffff|white|#f8fafc|#f1f5f9)['"]/gi, "background: 'var(--surface)'");
      newContent = newContent.replace(/backgroundColor:\s*['"](?:#ffffff|white|#f8fafc|#f1f5f9)['"]/gi, "backgroundColor: 'var(--surface)'");
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated', fullPath);
      }
    }
  }
}
processDir('./src');
