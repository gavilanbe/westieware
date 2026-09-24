// Top-level names declared in more than one source file (they would clash in
// the single concatenated <script>).  node tools/dupes.js
const fs = require('fs'), path = require('path');
const files = ['src'].flatMap(function walk(d) { return fs.readdirSync(d).flatMap(f => { const p = path.join(d, f); return fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; }); });
const seen = {};
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) (seen[m[1]] = seen[m[1]] || []).push(f);
  for (const m of src.matchAll(/^(?:const|let|var)\s+\{([^}]+)\}/gm)) for (const n of m[1].split(',')) { const k = n.trim().split(':').pop().trim(); if (k) (seen[k] = seen[k] || []).push(f); }
}
let bad = 0;
for (const [k, v] of Object.entries(seen)) if (v.length > 1) { bad++; console.log(k.padEnd(24), v.join('  ')); }
console.log(bad ? bad + ' nombres repetidos' : 'sin nombres repetidos');
process.exit(bad ? 1 : 0);
