#!/usr/bin/env node
// Bundelt dist/ + de contact-Worker tot één Worker-script: .uitrol/komnaardekerk.mjs
// (geen static-assets-upload nodig; zie worker/bundel.js en bouwsteen B99).
//
//   node scripts/bundel.mjs
//
// Vereist: dist/ actueel (wordt gecontroleerd) en esbuild via npx (npm-register).

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leesHeaders } from '../worker/headers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const UIT = path.join(ROOT, '.uitrol');
const TEKST = new Set(['html', 'css', 'js', 'svg', 'xml', 'txt', 'webmanifest', 'json']);

execFileSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs'), '--check'], { stdio: 'inherit' });

async function lijst(dir, basis = dir) {
  const uit = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) uit.push(...(await lijst(p, basis)));
    else uit.push(path.relative(basis, p).split(path.sep).join('/'));
  }
  return uit.sort();
}

const bestanden = {};
for (const rel of await lijst(DIST)) {
  if (rel === '_headers') continue;
  const buf = await readFile(path.join(DIST, rel));
  bestanden[rel] = TEKST.has(rel.split('.').pop()) ? { t: buf.toString('utf8') } : { b: buf.toString('base64') };
}
const headers = leesHeaders(await readFile(path.join(DIST, '_headers'), 'utf8'));

let commit = 'onbekend';
let schoon = false;
try {
  commit = execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: ROOT }).toString().trim();
  schoon = execFileSync('git', ['status', '--porcelain', '--', '.'], { cwd: ROOT }).toString().trim() === '';
} catch {}
const versie = { commit, schoon, gebouwd: new Date().toISOString() };

await mkdir(UIT, { recursive: true });
await writeFile(
  path.join(UIT, 'bestanden.mjs'),
  `export const BESTANDEN = ${JSON.stringify(bestanden)};\nexport const HEADERS = ${JSON.stringify(headers)};\nexport const VERSIE = ${JSON.stringify(versie)};\n`
);

execFileSync(
  'npx',
  ['--yes', 'esbuild@0.24.2', path.join(ROOT, 'worker/bundel.js'), '--bundle', '--format=esm', '--platform=neutral', '--external:cloudflare:email', '--minify-syntax', `--outfile=${path.join(UIT, 'komnaardekerk.mjs')}`, '--log-level=warning'],
  { stdio: 'inherit', cwd: ROOT }
);
const grootte = (await readFile(path.join(UIT, 'komnaardekerk.mjs'))).length;
console.log(`✓ bundel: .uitrol/komnaardekerk.mjs (${(grootte / 1024).toFixed(0)} kB, ${Object.keys(bestanden).length} bestanden, commit ${commit}${schoon ? '' : ' + lokale wijzigingen'})`);
