const fs = require('node:fs');
const path = require('node:path');
const reportPath = path.join(process.cwd(), 'reports', '时停起手_邪神也得给我跪下_作者_六个葫芦-2026-05-10T06-00-17-338Z.json');
const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
function cut(s, n) { return String(s || '').slice(0, n); }
const payload = {
  novel: r.novel,
  metrics: r.metrics,
  chapterCount: r.chapters?.length,
  chapters: r.chapters?.slice(0, 30),
  promptKeys: Object.keys(r.chatgptPrompts || {}),
  prompts: Object.fromEntries(Object.entries(r.chatgptPrompts || {}).map(([k, v]) => [k, cut(v, 3500)]))
};
console.log(JSON.stringify(payload, null, 2));
