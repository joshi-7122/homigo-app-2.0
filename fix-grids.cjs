const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes("gridTemplateColumns: '1fr 1fr'")) {
    const newContent = content.replace(/gridTemplateColumns:\s*'1fr 1fr'/g, "gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'");
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
    changedCount++;
  }
});
console.log('Total files fixed:', changedCount);
