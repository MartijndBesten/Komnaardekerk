#!/usr/bin/env node
// Controleert alle externe links in dist/ (kerkwebsites, bronnen, licenties).
//   node scripts/controleer-links.mjs
// Uitkomst per link: ok, fout (4xx/5xx) of 'niet bereikbaar vanaf hier' (netwerkbeleid/time-out).
// Gebruikt curl, zodat de proxy-instellingen van de omgeving gelden.
import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function html(dir) {
  const uit = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) uit.push(...(await html(p)));
    else if (p.endsWith('.html')) uit.push(p);
  }
  return uit;
}
const links = new Map();
for (const f of await html(path.join(ROOT, 'dist'))) {
  const t = await readFile(f, 'utf8');
  for (const m of t.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (!links.has(u)) links.set(u, new Set());
    links.get(u).add(path.relative(path.join(ROOT, 'dist'), f));
  }
}
const status = (u) =>
  new Promise((ok) =>
    execFile('curl', ['-s', '-o', '/dev/null', '-L', '--max-time', '20', '-A', 'Mozilla/5.0 (komnaardekerk-linkcontrole)', '-w', '%{http_code}', u], (e, out) => ok(out || '000'))
  );
const res = { ok: [], fout: [], onbereikbaar: [] };
for (const u of [...links.keys()].sort()) {
  if (/^https:\/\/(komnaardekerk\.nu|www\.openstreetmap\.org\/search)/.test(u)) continue; // eigen domein (nog niet live) en zoeklinks
  const s = await status(u);
  const regel = `${s} ${u}`;
  if (/^[23]/.test(s)) res.ok.push(regel);
  else if (s === '000' || s === '403' || s === '429') res.onbereikbaar.push(regel);
  else res.fout.push(`${regel}  (op ${[...links.get(u)].join(', ')})`);
}
console.log(`✓ ok: ${res.ok.length}`);
if (res.onbereikbaar.length) console.log(`? niet te controleren vanaf hier (netwerk/bot-blokkade): ${res.onbereikbaar.length}\n  ${res.onbereikbaar.join('\n  ')}`);
if (res.fout.length) {
  console.log(`✗ fout: ${res.fout.length}\n  ${res.fout.join('\n  ')}`);
  process.exit(1);
}
