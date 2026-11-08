#!/usr/bin/env node
// Rolt de Worker-bundel (.uitrol/komnaardekerk.mjs) uit als preview op een eigen (sub)domein.
// Werkt vanuit een Claude Code-cloudsessie: de proxy zet de Cloudflare-sleutel in elk verzoek.
// Lokaal: CLOUDFLARE_API_TOKEN=<token> node scripts/uitrol-preview.mjs ...
//
//   node scripts/bundel.mjs
//   node scripts/uitrol-preview.mjs komnaardekerk.martijndenbesten.com [workernaam]
//
// Stappen: zone + account opzoeken → herstelpunt van een bestaande Worker → script uploaden
// (zonder static assets) → workers.dev uit → eigen domein koppelen → versie tonen.
// Account- en zone-ID's worden opgezocht, niet opgeslagen.

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [host, naam = 'komnaardekerk-preview'] = process.argv.slice(2);
if (!host) {
  console.error('Gebruik: node scripts/uitrol-preview.mjs <hostnaam> [workernaam]');
  process.exit(1);
}
const API = 'https://api.cloudflare.com/client/v4';
const token = process.env.CLOUDFLARE_API_TOKEN || 'proxy';

function cf(methode, pad, { json, form, ruw = false } = {}) {
  const args = ['-sS', '-X', methode, `${API}${pad}`, '-H', `Authorization: Bearer ${token}`];
  if (json) args.push('-H', 'Content-Type: application/json', '--data', JSON.stringify(json));
  for (const f of form || []) args.push('-F', f);
  const uit = execFileSync('curl', args, { maxBuffer: 64 * 1024 * 1024 }).toString();
  if (ruw) return uit;
  const d = JSON.parse(uit);
  if (!d.success) throw new Error(`${methode} ${pad.replace(/[0-9a-f]{32}/g, '…')}: ${JSON.stringify(d.errors)}`);
  return d.result;
}

const zoneNaam = host.split('.').slice(-2).join('.');
const [zone] = cf('GET', `/zones?name=${zoneNaam}`);
if (!zone) throw new Error(`zone ${zoneNaam} niet gevonden in dit account`);
const A = zone.account.id;
console.log(`zone ${zone.name} (${zone.status})`);

// Bestaat het domein al voor een andere Worker? Dan stoppen: nooit iets anders overschrijven.
const domeinen = cf('GET', `/accounts/${A}/workers/domains`);
const bestaand = domeinen.find((d) => d.hostname === host);
if (bestaand && bestaand.service !== naam) {
  throw new Error(`${host} hangt al aan Worker '${bestaand.service}'. Gestopt; niets gewijzigd.`);
}

// Herstelpunt: huidige versie van deze Worker bewaren (alleen als die bestaat).
const scripts = cf('GET', `/accounts/${A}/workers/scripts`);
if (scripts.some((s) => s.id === naam)) {
  const vorige = cf('GET', `/accounts/${A}/workers/scripts/${naam}/content/v2`, { ruw: true });
  await writeFile(path.join(ROOT, '.uitrol', 'vorige-versie.multipart'), vorige);
  console.log(`herstelpunt: .uitrol/vorige-versie.multipart (${(vorige.length / 1024).toFixed(0)} kB)`);
} else {
  console.log(`nieuwe Worker '${naam}'`);
}

const bundelPad = path.join(ROOT, '.uitrol', 'komnaardekerk.mjs');
await readFile(bundelPad); // bestaat
const metadata = {
  main_module: 'komnaardekerk.mjs',
  compatibility_date: '2026-11-01',
  bindings: [{ type: 'plain_text', name: 'CONTACT_AAN', text: 'nee' }]
};
const metaPad = path.join(ROOT, '.uitrol', 'metadata.json');
await writeFile(metaPad, JSON.stringify(metadata));
cf('PUT', `/accounts/${A}/workers/scripts/${naam}`, {
  form: [`metadata=<${metaPad};type=application/json`, `komnaardekerk.mjs=@${bundelPad};type=application/javascript+module;filename=komnaardekerk.mjs`]
});
console.log('✓ script geüpload');

cf('POST', `/accounts/${A}/workers/scripts/${naam}/subdomain`, { json: { enabled: false } });
console.log('✓ workers.dev-adres uit (alleen het eigen domein)');

if (!bestaand) {
  cf('PUT', `/accounts/${A}/workers/domains`, { json: { hostname: host, service: naam, zone_id: zone.id, environment: 'production' } });
  console.log(`✓ domein gekoppeld: https://${host}`);
} else {
  console.log(`✓ domein was al gekoppeld: https://${host}`);
}
console.log('Controleer: https://' + host + '/versie.json');
