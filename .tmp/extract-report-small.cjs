const fs = require('node:fs');
const path = require('node:path');
const reportPath = path.join(process.cwd(), 'reports', '时停起手_邪神也得给我跪下_作者_六个葫芦-2026-05-10T06-00-17-338Z.json');
const r = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const payload = {
  novel: r.novel,
  metrics: r.metrics,
  chapterCount: r.chapters?.length,
  firstChapters: r.chapters?.slice(0, 30),
  promptKeys: Object.keys(r.chatgptPrompts || {})
};
console.log(JSON.stringify(payload, null, 2));
