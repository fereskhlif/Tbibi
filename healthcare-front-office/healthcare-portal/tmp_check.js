const fs = require('fs');
const html = fs.readFileSync('c:/Users/yassi/Spring_Projects/Tbibi/healthcare-front-office/healthcare-portal/src/app/modules/forum/pages/forum-home/forum-home.component.html', 'utf8');

const lines = html.split('\n');
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // count <div... and </div>
  const opens = (line.match(/<div(\s|>)/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  
  const oldDepth = depth;
  depth += opens - closes;
  
  if (opens || closes) {
    console.log(`L${i + 1}: +${opens} -${closes} | Depth: ${oldDepth} -> ${depth} | ${line.trim()}`);
  }
  
  if (depth < 0) {
    console.log('UNEXPECTED DIV CLOSE AT LINE ' + (i + 1));
    break;
  }
}
