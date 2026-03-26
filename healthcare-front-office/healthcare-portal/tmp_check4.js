const fs = require('fs');
const html = fs.readFileSync('c:/Users/yassi/Spring_Projects/Tbibi/healthcare-front-office/healthcare-portal/src/app/modules/forum/pages/forum-home/forum-home.component.html', 'utf8');

const TAGS = ['div', 'span', 'button', 'p', 'h1', 'h3', 'lucide-icon', 'ng-container'];

for (const t of TAGS) {
  const oRegex = new RegExp('<' + t + '(?: |\n|>|\\*|\\[)', 'g');
  const cRegex = new RegExp('</' + t + '>', 'g');
  const os = (html.match(oRegex)||[]).length;
  const cs = (html.match(cRegex)||[]).length;
  console.log(t, os, cs);
  if (os !== cs) {
     console.log('MISMATCH:', t, os, cs);
  }
}
