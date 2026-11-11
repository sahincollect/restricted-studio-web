const fs = require('fs');
const d = require('../lib/catalog-data.json');
const counts = {};
d.forEach((i) => (counts[i.category] = (counts[i.category] || 0) + 1));
fs.writeFileSync('lib/catalog-stats.json', JSON.stringify({ total: d.length, counts }, null, 2) + '\n');
console.log('catalog-stats.json guncellendi:', d.length);
