#!/usr/bin/env node
// Lokale testserver die Cloudflare Workers static assets nabootst:
// _headers toepassen, nette URL's met afsluitende '/', 404-pagina en /api/contact
// via dezelfde verwerk()-logica als de Worker (met een nep-mailbinding die niets verstuurt).
//
//   node scripts/serve.mjs [poort]          (standaard 8787)
//   CONTACT_AAN=ja node scripts/serve.mjs   formulier 'aan' testen (mail wordt alleen in het geheugen bewaard)

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verwerk } from '../worker/verwerk.js';
import { leesHeaders, past } from '../worker/headers.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

export const verzonden = [];

async function headerRegels() {
  return leesHeaders(await readFile(path.join(DIST, '_headers'), 'utf8'));
}

function mailEnv(contactAan) {
  return contactAan
    ? { CONTACT_AAN: 'ja', MAIL_VAN: 'formulier@komnaardekerk.nl', MAIL_AAN: 'coordinator@test.invalid', MAIL: { send: async (m) => verzonden.push(m) }, __maakMail: (van, aan, raw) => ({ van, aan, raw }) }
    : { CONTACT_AAN: 'nee' };
}

async function naarRequest(req, url) {
  const delen = [];
  for await (const d of req) delen.push(d);
  return new Request(url, {
    method: req.method,
    headers: Object.fromEntries(Object.entries(req.headers).filter(([, v]) => typeof v === 'string')),
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(delen)
  });
}

// bundel: een geladen Worker-module (.uitrol/komnaardekerk.mjs). Dan gaat elk verzoek
// door precies de code die wordt uitgerold.
export function maakServer({ contactAan = process.env.CONTACT_AAN === 'ja', bundel = null } = {}) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (bundel) {
        const r = await bundel.default.fetch(await naarRequest(req, url), mailEnv(contactAan));
        res.writeHead(r.status, Object.fromEntries(r.headers));
        res.end(req.method === 'HEAD' ? undefined : Buffer.from(await r.arrayBuffer()));
        return;
      }
      const regels = await headerRegels();
      const zetHeaders = (pad) => {
        for (const r of regels) if (past(r.patroon, url.host, pad)) for (const [k, v] of r.headers) res.setHeader(k, v);
      };

      if (url.pathname === '/api/contact') {
        const request = await naarRequest(req, url);
        const r = await verwerk(request, mailEnv(contactAan), { maakMail: (van, aan, raw) => ({ van, aan, raw }) });
        res.writeHead(r.status, Object.fromEntries(r.headers));
        res.end(Buffer.from(await r.arrayBuffer()));
        return;
      }

      let pad = decodeURIComponent(url.pathname);
      if (pad.includes('..')) throw new Error('pad');
      let bestand = path.join(DIST, pad);
      let st = await stat(bestand).catch(() => null);
      if (st?.isDirectory()) {
        if (!pad.endsWith('/')) {
          res.writeHead(307, { Location: pad + '/' + url.search });
          return res.end();
        }
        bestand = path.join(bestand, 'index.html');
        st = await stat(bestand).catch(() => null);
      }
      if (!st && !pad.endsWith('/') && !path.extname(pad)) {
        const metSlash = await stat(path.join(DIST, pad, 'index.html')).catch(() => null);
        if (metSlash) {
          res.writeHead(307, { Location: pad + '/' + url.search });
          return res.end();
        }
      }
      if (!st || path.basename(bestand) === '_headers') {
        zetHeaders(pad);
        res.writeHead(404, { 'Content-Type': TYPES['.html'] });
        return res.end(await readFile(path.join(DIST, '404.html')));
      }
      zetHeaders(pad);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(bestand)] || 'application/octet-stream' });
      res.end(await readFile(bestand));
    } catch (e) {
      res.writeHead(500);
      res.end('fout');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const poort = Number(process.argv[2] || 8787);
  maakServer().listen(poort, () => console.log(`komnaardekerk.nl lokaal op http://localhost:${poort}`));
}
