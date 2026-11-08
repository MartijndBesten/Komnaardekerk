// Controleert dat de publicatiepoort echt weigert (geen te soepele poort).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function kopie() {
  const dir = mkdtempSync(path.join(tmpdir(), 'kndk-'));
  for (const d of ['content', 'src', 'scripts', 'dist']) cpSync(path.join(ROOT, d), path.join(dir, d), { recursive: true });
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
  for (const m of ['modus', 'voorbeeldkerk', 'Bijbeltekst', "'voorbeeld'", 'verwerkingsverantwoordelijke', 'contactadres']) {
    assert.ok(r.stderr.includes(m), `melding over ${m} ontbreekt:\n${r.stderr}`);
  }
});

test('mutaties worden gevangen', () => {
  const gevallen = [
    ['ongeldige tijd', 'content/kerken.json', (s) => s.replace('"10:00"', '"10 uur"'), 'uu:mm'],
    ['dubbel id', 'content/kerken.json', (s) => s.replace('"voorbeeld-b"', '"voorbeeld-a"'), 'dubbel id'],
    ['onbekend kenmerk', 'content/kerken.json', (s) => s.replace('"orgel", "kinderen"', '"orgel", "kinders"'), 'onbekend kenmerk'],
    ['verboden tekst', 'content/vragen.json', (s) => s.replace('Ja. Kerkdiensten', 'TODO Kerkdiensten'), 'verboden inhoud'],
    ['dode link', 'src/pages/kerken.mjs', (s) => s.replace('/over/#meedoen', '/bestaat-niet/'), 'dode link'],
    ['dood anker', 'src/lib/onderdelen.mjs', (s) => s.replace('href="/even-praten/#samen"', 'href="/even-praten/#weg"'), 'dood anker'],
    ['inline style', 'src/pages/geloof.mjs', (s) => s.replace('<section class="geloof"', '<section style="color:red" class="geloof"'), 'inline style'],
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
