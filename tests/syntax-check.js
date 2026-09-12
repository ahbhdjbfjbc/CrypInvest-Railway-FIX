const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const jsFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith('.js')) jsFiles.push(full);
  }
}
walk(root);
for (const file of jsFiles) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

for (const file of fs.readdirSync(path.join(root, 'public')).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, 'public', file), 'utf8');
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (duplicates.length) throw new Error(`${file}: duplicate HTML ids: ${duplicates.join(', ')}`);
}

JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
console.log(`Syntax/static checks passed: ${jsFiles.length} JS files.`);
