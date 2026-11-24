#!/usr/bin/env node
// Draws the cover of every puzzle listed in covers.json into <puzzle>/media/cover.webp (1600 × 900).
// Needs Google Chrome (or Chromium) for the drawing and ImageMagick (`magick`) for WebP.
// Fonts: Trinity Mode and Jost from the Trinity Community checkout next to this repo (COVER_FONTS changes the folder).
//
//   node tools/covers/build.js            all covers
//   node tools/covers/build.js refactor   only puzzles whose path contains "refactor"
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '..', '..');
const fonts = process.env.COVER_FONTS || path.resolve(repo, '..', 'trinity-community', 'web', 'fonts');
const chrome = process.env.CHROME || ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser'].find(b => {
  try { execFileSync('which', [b], { stdio: 'ignore' }); return true; } catch { return false; }
});
if (!chrome) { console.error('Chrome or Chromium not found (set CHROME).'); process.exit(1); }

// the dark theme of Trinity (trinity-community web/theme.json) and the colour of each library category (lib/catalog.js)
const theme = { bg: '#121110', text: '#f3f0e8', 'text-2': '#b7b1a6', 'text-3': '#928c81', bad: '#ff6b70', good: '#4cc38a' };
const wire = { accent: '#1ed760', lead: '#a892f0', 'wire-1': '#6ea2ff', 'wire-2': '#4cc38a', 'wire-3': '#a892f0', 'wire-4': '#ff6b70', 'wire-5': '#e5b84a' };
const categories = {
  tests: { name: 'Testing', c: 'wire-3', c2: 'wire-1', motif: 'grid' },
  release: { name: 'Release', c: 'wire-1', c2: 'wire-3', motif: 'ascent' },
  review: { name: 'Code review', c: 'accent', c2: 'wire-1', motif: 'diff' },
  docs: { name: 'Documentation', c: 'wire-5', c2: 'wire-4', motif: 'pages' },
  security: { name: 'Security', c: 'wire-4', c2: 'wire-5', motif: 'rings' },
  pipeline: { name: 'Pipeline', c: 'wire-1', c2: 'wire-2', motif: 'lanes' },
  tasks: { name: 'Tasks', c: 'wire-3', c2: 'wire-5', motif: 'board' },
  start: { name: 'Getting started', c: 'lead', c2: 'accent', motif: 'triangle' },
};
const kinds = { skills: 'Skill', rules: 'Rules', conventions: 'Convention', agents: 'Agent', prompts: 'Prompt', guides: 'Guide' };

const data = url => 'data:font/woff2;base64,' + fs.readFileSync(path.join(fonts, url)).toString('base64');
const template = fs.readFileSync(path.join(__dirname, 'cover.html'), 'utf8')
  .replace('__TRINITY__', data('trinitymode.woff2'))
  .replace('__JOST__', data('jost-latin.woff2'));

// --sample <folder>: one cover per category with made-up words, to look at the motifs without any puzzle
const sample = process.argv[2] === '--sample' ? path.resolve(process.argv[3] || 'cover-samples') : '';
const list = sample
  ? Object.keys(categories).map(k => ({ path: k, title: `Sample ${categories[k].name.toLowerCase()} puzzle`, tagline: 'One line that says what the person gets from it.', share: { kind: 'skills', name: 'sample-' + k, category: k } }))
  : JSON.parse(fs.readFileSync(path.join(__dirname, 'covers.json'), 'utf8'));
const only = sample ? '' : process.argv[2] || '';
const work = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'covers-'));
let made = 0;
for (const p of list) {
  if (only && !p.path.includes(only)) continue;
  const share = p.share || JSON.parse(fs.readFileSync(path.join(repo, p.path, 'trinity-share.json'), 'utf8'));
  const top = String(share.category || '').split('/')[0];
  const cat = categories[top] || categories.start;
  const cover = {
    name: share.name,
    title: p.title,
    tagline: p.tagline,
    label: `${kinds[share.kind] || share.kind} · ${cat.name}`,
    motif: p.motif || cat.motif,
    colors: { ...theme, c: wire[cat.c], c2: wire[cat.c2] },
  };
  const html = path.join(work, share.name + '.html');
  const png = path.join(work, share.name + '.png');
  fs.writeFileSync(html, template.replace('__COVER__', JSON.stringify(cover)));
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1600,1100', '--virtual-time-budget=4000', `--user-data-dir=${path.join(work, 'profile')}`,
    `--screenshot=${png}`, 'file://' + html], { stdio: 'ignore' });
  const dir = sample || path.join(repo, p.path, 'media');
  const file = path.join(dir, sample ? share.name + '.webp' : 'cover.webp');
  fs.mkdirSync(dir, { recursive: true });
  // headless Chrome counts its own window frame into the height: draw taller, keep the top 1600 × 900
  execFileSync('magick', [png, '-crop', '1600x900+0+0', '+repage', '-strip', '-quality', '86', file]);
  made++;
  console.log(path.relative(process.cwd(), file));
}
fs.rmSync(work, { recursive: true, force: true });
console.log(`${made} covers`);
