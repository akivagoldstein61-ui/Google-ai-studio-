const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('kesher-skills-full.md', 'utf8');
const regex = /Source: \`(.+?)\`\n\n---\n([\s\S]+?)(?=\n---\n\n# |$)/g;

let match;
while ((match = regex.exec(content)) !== null) {
  let file_path = match[1];
  let file_content = '---\n' + match[2];
  
  // Create directories if they don't exist
  let dir = path.dirname(file_path);
  fs.mkdirSync(dir, { recursive: true });
  
  fs.writeFileSync(file_path, file_content);
  console.log(`Created ${file_path}`);
}
