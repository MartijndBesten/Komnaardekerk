#!/usr/bin/env node
// Statische server voor de ontwerpen: node ontwerpen/serve.mjs [poort]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' };

export function start(poort = 8794) {
  const server = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(DIST, path.normalize(p));
    if (!f.startsWith(DIST)) { res.writeHead(403).end(); return; }
    try {
      const d = await readFile(f);
      res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(d);
    } catch {
      if (!path.extname(p)) { res.writeHead(301, { location: p + '/' }).end(); return; }
      res.writeHead(404).end('Niet gevonden');
    }
  });
  return new Promise((ok) => server.listen(poort, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = Number(process.argv[2] || 8794);
  await start(n);
  console.log(`ontwerpen op http://localhost:${n}/`);
}
