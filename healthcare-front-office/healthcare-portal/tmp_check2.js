const fs = require('fs');
const html = fs.readFileSync('c:/Users/yassi/Spring_Projects/Tbibi/healthcare-front-office/healthcare-portal/src/app/modules/forum/pages/forum-home/forum-home.component.html', 'utf8');

const openSpans = (html.match(/<span/g) || []).length;
const closeSpans = (html.match(/<\/span>/g) || []).length;

console.log('Spans:', openSpans, closeSpans);
