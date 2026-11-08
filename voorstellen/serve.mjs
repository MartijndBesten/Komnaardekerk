#!/usr/bin/env node
// Minimale statische server voor het prototype: node voorstellen/serve.mjs [poort]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
export function start(poort = 8790) {
  const server = http.createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const bestand = path.join(DIST, path.normalize(p));
    if (!bestand.startsWith(DIST)) { res.writeHead(403).end(); return; }
    try {
      const data = await readFile(bestand);
      res.writeHead(200, { 'content-type': TYPES[path.extname(bestand)] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(data);
    } catch {
      if (!path.extname(p)) { res.writeHead(301, { location: p + '/' }).end(); return; }
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Niet gevonden');
    }
  });
  return new Promise((ok) => server.listen(poort, () => ok(server)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const poort = Number(process.argv[2] || 8790);
  await start(poort);
  console.log(`prototype op http://localhost:${poort}/`);
}
