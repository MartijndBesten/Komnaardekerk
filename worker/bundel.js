// Worker die de hele site uit één script serveert (bestanden ingebed bij het bundelen),
// zonder Cloudflare static assets. Reden: vanuit een Claude Code-cloudsessie faalt het
// uploaden van static assets (bouwsteen B99). Gebruikt voor de preview op
// komnaardekerk.martijndenbesten.com. Gebouwd met scripts/bundel.mjs.

import { BESTANDEN, HEADERS, VERSIE } from '../.uitrol/bestanden.mjs';
import { headersVoor } from './headers.js';
import { verwerk } from './verwerk.js';

const TYPES = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  woff2: 'font/woff2',
  xml: 'application/xml; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  webmanifest: 'application/manifest+json',
  json: 'application/json; charset=utf-8'
};

function bytes(b64) {
  const bin = atob(b64);
  const uit = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) uit[i] = bin.charCodeAt(i);
  return uit;
}

// bestand: pad van het bestand in dist/; urlPad: het gevraagde pad (daarop werken de _headers-regels).
function serveer(bestandPad, host, status = 200, urlPad = bestandPad) {
  const sleutel = bestandPad.replace(/^\//, '');
  const bestand = BESTANDEN[sleutel];
  const headers = new Headers();
  for (const [k, v] of headersVoor(HEADERS, host, urlPad)) headers.append(k, v);
  const ext = sleutel.split('.').pop();
  headers.set('Content-Type', TYPES[ext] || 'application/octet-stream');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', ext === 'html' ? 'no-cache, no-transform' : 'public, max-age=3600');
  const body = bestand.b ? bytes(bestand.b) : bestand.t;
  return new Response(body, { status, headers });
}

export async function behandel(request, env = {}) {
  const url = new URL(request.url);
  if (url.pathname === '/api/contact') {
    const maakMail =
      env.__maakMail ||
      (async (van, aan, raw) => {
        const { EmailMessage } = await import('cloudflare:email');
        return new EmailMessage(van, aan, raw);
      });
    return verwerk(request, env, { maakMail: (...a) => maakMail(...a) });
  }
  if (url.pathname === '/versie.json') {
    return new Response(JSON.stringify(VERSIE), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
    });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Methode niet toegestaan', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  let pad;
  try {
    pad = decodeURIComponent(url.pathname);
  } catch {
    return serveer('/404.html', url.host, 404);
  }
  if (pad.includes('..') || pad === '/_headers') return serveer('/404.html', url.host, 404);
  if (pad.endsWith('/')) {
    if (BESTANDEN[`${pad.slice(1)}index.html`]) return serveer(`${pad}index.html`, url.host, 200, pad);
  } else if (BESTANDEN[pad.slice(1)]) {
    return serveer(pad, url.host);
  } else if (BESTANDEN[`${pad.slice(1)}/index.html`]) {
    return new Response(null, { status: 307, headers: { Location: `${pad}/${url.search}` } });
  }
  return serveer('/404.html', url.host, 404);
}

export default {
  fetch: (request, env) => behandel(request, env)
};
