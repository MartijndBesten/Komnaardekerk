import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { leesHeaders, headersVoor } from '../worker/headers.js';

const regels = leesHeaders(readFileSync(new URL('../dist/_headers', import.meta.url), 'utf8'));
const naam = (lijst, k) => lijst.filter(([n]) => n === k).map(([, v]) => v);

test('CSP en beveiligingsheaders op elke pagina', () => {
  const h = headersVoor(regels, 'komnaardekerk.martijndenbesten.com', '/kerken/');
  assert.match(naam(h, 'Content-Security-Policy')[0], /script-src 'self'/);
  assert.equal(naam(h, 'X-Frame-Options')[0], 'DENY');
});

test('workers.dev en conceptmodus krijgen noindex; lettertypen lang in cache', () => {
  assert.ok(naam(headersVoor(regels, 'komnaardekerk.zaal.workers.dev', '/'), 'X-Robots-Tag').includes('noindex'));
  assert.ok(naam(headersVoor(regels, 'komnaardekerk.martijndenbesten.com', '/'), 'X-Robots-Tag').includes('noindex'), 'concept moet noindex zijn');
  assert.match(naam(headersVoor(regels, 'x', '/fonts/a.woff2'), 'Cache-Control')[0], /immutable/);
});
