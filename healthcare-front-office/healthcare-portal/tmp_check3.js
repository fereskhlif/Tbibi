const fs = require('fs');
const html = fs.readFileSync('c:/Users/yassi/Spring_Projects/Tbibi/healthcare-front-office/healthcare-portal/src/app/modules/forum/pages/forum-home/forum-home.component.html', 'utf8');

['div','span','button','p','h1','h3','lucide-icon','ng-container'].forEach(tag => {
  const opens = (html.match(new RegExp('<'+tag+'(\\\\s|>)', 'g')) || []).length;
  const closes = (html.match(new RegExp('</'+tag+'>', 'g')) || []).length;
  console.log(tag, opens, closes);
});
