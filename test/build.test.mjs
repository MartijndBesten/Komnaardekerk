// Controleert dat de publicatiepoort echt weigert (geen te soepele poort).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function kopie() {
  const dir = mkdtempSync(path.join(tmpdir(), 'kndk-'));
  for (const d of ['content', 'src', 'scripts', 'dist', 'merk']) cpSync(path.join(ROOT, d), path.join(dir, d), { recursive: true });
  return dir;
}
function bouw(dir, ...args) {
  return spawnSync(process.execPath, [path.join(dir, 'scripts/build.mjs'), ...args], { encoding: 'utf8' });
}

test('dist/ is actueel', () => {
  const r = bouw(ROOT, '--check');
  assert.equal(r.status, 0, r.stderr);
});

test('publicatiepoort weigert de conceptversie met alle open punten', () => {
  const r = bouw(ROOT, '--check', '--productie');
  assert.equal(r.status, 1);
  for (const m of ['modus', 'deelnemende kerk', 'Bijbeltekst', 'geloofsbasis', 'verwerkingsverantwoordelijke', 'contactadres']) {
    assert.ok(r.stderr.includes(m), `melding over ${m} ontbreekt:\n${r.stderr}`);
  }
});

test('mutaties worden gevangen', () => {
  const gevallen = [
    ['ongeldige tijd', 'content/kerken.json', (s) => s.replace('"09:30"', '"9.30 uur"'), 'uu:mm'],
    ['dubbel id', 'content/kerken.json', (s) => s.replace('"id": "pleinkerk"', '"id": "sionkerk"'), 'dubbel id'],
    ['onbekend kenmerk', 'content/kerken.json', (s) => s.replace('"online"', '"orgel"'), 'onbekend kenmerk'],
    ['partner zonder deelname', 'content/kerken.json', (s) => s.replace('"verband": "Hersteld Hervormde Kerk"', '"verband": "Hersteld Hervormde Kerk, partner"'), "'partner' zonder deelname"],
    ['contactpersoon zonder toestemming', 'content/kerken.json', (s) => s.replace('"contactpersonen": []', '"contactpersonen": [{"rol": "gastheer"}]'), 'contactpersoon zonder toestemming'],
    ['verboden tekst', 'content/vragen.json', (s) => s.replace('Ja. Kerkdiensten', 'TODO Kerkdiensten'), 'verboden inhoud'],
    ['ontbrekende afbeelding', 'content/fotos.json', (s) => s.replace('"/foto/rk-houten.webp"', '"/foto/bestaat-niet.webp"'), 'ontbrekende afbeelding'],
    ['gewijzigd Denckh-logo', 'src/static/merk/denckh/denckh-logo-signature-light.svg', (s) => s + '<!-- -->', 'niet byte-identiek'],
    ['dode link', 'src/pages/home.mjs', (s) => s.replace('/activiteiten/', '/bestaat-niet/'), 'dode link'],
    ['dood anker', 'src/lib/onderdelen.mjs', (s) => s.replace('href="/samen-naar-de-kerk/">Een eerste bezoek', 'href="/samen-naar-de-kerk/#weg">Een eerste bezoek'), 'dood anker'],
    ['inline style', 'src/pages/ontdek.mjs', (s) => s.replace('<section class="verhaal"', '<section style="color:red" class="verhaal"'), 'inline style'],
    ['externe bron', 'src/lib/layout.mjs', (s) => s.replace('<link rel="stylesheet"', '<script src="https://cdn.invalid/x.js"></script><link rel="stylesheet"'), 'externe bron'],
    ['verouderde dist', 'src/static/css/site.css', (s) => s + '\n/* wijziging */\n', 'verouderd in dist/']
  ];

  for (const [naam, bestand, wijzig, verwacht] of gevallen) {
    const dir = kopie();
    try {
      const p = path.join(dir, bestand);
      const oud = readFileSync(p, 'utf8');
      const nieuw = wijzig(oud);
      assert.notEqual(nieuw, oud, `mutatie '${naam}' veranderde niets`);
      writeFileSync(p, nieuw);
      const r = bouw(dir, '--check');
      assert.equal(r.status, 1, `mutatie '${naam}' niet gevangen`);
      assert.ok(r.stderr.includes(verwacht), `mutatie '${naam}': verwacht '${verwacht}' in\n${r.stderr}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test('productieversie toont alleen deelnemende kerken met toestemming, zonder ontwerppagina', () => {
  const dir = kopie();
  try {
    const sitePad = path.join(dir, 'content/site.json');
    const site = JSON.parse(readFileSync(sitePad, 'utf8'));
    site.modus = 'productie';
    writeFileSync(sitePad, JSON.stringify(site));
    const kPad = path.join(dir, 'content/kerken.json');
    const k = JSON.parse(readFileSync(kPad, 'utf8'));
    const gekozen = k.kerken.find((x) => x.id === 'de-lichtboog');
    gekozen.deelname = { status: 'deelnemer', toestemmingPublicatie: true };
    writeFileSync(kPad, JSON.stringify(k));
    const r = bouw(dir);
    assert.equal(r.status, 0, r.stderr);
    const kerken = readFileSync(path.join(dir, 'dist/kerken/index.html'), 'utf8');
    assert.ok(kerken.includes('De Lichtboog'));
    const namen = [...kerken.matchAll(/class="kerk-naam">([^<]+)</g)].map((m) => m[1]);
    assert.deepEqual(namen, ['De Lichtboog'], `kerkkaarten in productie: ${namen}`);
    assert.ok(!kerken.includes('Nog niet benaderd'), 'kandidaatlabel in productie');
    assert.ok(!existsSync(path.join(dir, 'dist/ontwerp/index.html')), 'ontwerppagina in productie');
    const headers = readFileSync(path.join(dir, 'dist/_headers'), 'utf8');
    assert.ok(!/^\/\*\n  X-Robots-Tag: noindex/m.test(headers), 'productie staat volledig op noindex');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
