import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valideer, bouwMail } from '../worker/contact.js';
import { verwerk } from '../worker/verwerk.js';

const NU = 1_800_000_000_000;
const GOED = { soort: 'samen', voornaam: 'Test', email: 'test@test.invalid', telefoon: '', kerk: '', bericht: 'Liefst na 18 uur', toestemming: 'ja', website: '', t: String(NU - 20_000) };
const IDS = ['voorbeeld-a', 'voorbeeld-b'];

test('geldig verzoek wordt geaccepteerd', () => {
  const r = valideer(GOED, { nu: NU, kerkIds: IDS });
  assert.equal(r.ok, true);
  assert.equal(r.gegevens.voornaam, 'Test');
});

test('honeypot en te snel invullen = stille bot-weigering', () => {
  assert.equal(valideer({ ...GOED, website: 'spam' }, { nu: NU }).bot, true);
  assert.equal(valideer({ ...GOED, t: String(NU - 500) }, { nu: NU }).bot, true);
  assert.equal(valideer({ ...GOED, t: 'abc' }, { nu: NU }).bot, true);
});

test('zonder JavaScript (leeg tijdveld) is geen bot', () => {
  const r = valideer({ ...GOED, t: '' }, { nu: NU, kerkIds: IDS });
  assert.equal(r.ok, true);
});

test('verplichte velden en toestemming', () => {
  const r = valideer({ ...GOED, voornaam: '', email: '', telefoon: '', toestemming: '' }, { nu: NU });
  assert.equal(r.ok, false);
  assert.ok(r.fouten.voornaam && r.fouten.bereik && r.fouten.toestemming);
});

test('ongeldige e-mail, telefoon, soort en kerk worden geweigerd', () => {
  assert.ok(valideer({ ...GOED, email: 'geen-mail' }, { nu: NU }).fouten.bereik);
  assert.ok(valideer({ ...GOED, email: '', telefoon: '12' }, { nu: NU }).fouten.bereik);
  assert.ok(valideer({ ...GOED, soort: 'iets' }, { nu: NU }).fouten.soort);
  assert.ok(valideer({ ...GOED, kerk: 'verzonnen' }, { nu: NU, kerkIds: IDS }).fouten.kerk);
});

test('mailheaders zijn niet te injecteren en bericht wordt begrensd', () => {
  const r = valideer({ ...GOED, voornaam: 'Eva\r\nBcc: x@y.z', bericht: 'a'.repeat(5000) }, { nu: NU, kerkIds: IDS });
  assert.equal(r.ok, true);
  assert.ok(!/[\r\n]/.test(r.gegevens.voornaam));
  assert.equal(r.gegevens.bericht.length, 600);
  const raw = bouwMail({ gegevens: r.gegevens, van: 'formulier@komnaardekerk.nl', aan: 'coordinator@test.invalid', id: 'x' });
  const kop = raw.split('\r\n\r\n')[0];
  assert.ok(!/^Bcc:/im.test(kop), 'geen extra header');
  assert.match(kop, /^Subject: =\?UTF-8\?B\?/m);
  assert.match(kop, /^Reply-To: <test@test\.invalid>$/m);
  const body = Buffer.from(raw.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8');
  assert.match(body, /Voornaam:\s+Eva Bcc: x@y\.z/);
  assert.match(body, /uitdrukkelijk toestemming/);
});

function verzoek(body, headers = {}) {
  return new Request('https://komnaardekerk.nl/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', Origin: 'https://komnaardekerk.nl', ...headers },
    body: new URLSearchParams(body)
  });
}
const maakMail = (van, aan, raw) => ({ van, aan, raw });
function env(extra = {}) {
  const verzonden = [];
  return { verzonden, CONTACT_AAN: 'ja', MAIL_VAN: 'formulier@komnaardekerk.nl', MAIL_AAN: 'coordinator@test.invalid', MAIL: { send: async (m) => verzonden.push(m) }, ...extra };
}

test('worker: fail-closed als het formulier niet aan staat', async () => {
  for (const e of [{ CONTACT_AAN: 'nee' }, { ...env(), MAIL: undefined }, { ...env(), MAIL_AAN: '' }]) {
    const r = await verwerk(verzoek(GOED), e, { maakMail, nu: NU });
    assert.equal(r.status, 503);
  }
});

test('worker: geldig verzoek verstuurt precies één mail', async () => {
  const e = env();
  const r = await verwerk(verzoek(GOED), e, { maakMail, nu: NU });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  assert.equal(e.verzonden.length, 1);
  assert.equal(e.verzonden[0].aan, 'coordinator@test.invalid');
});

test('worker: bot krijgt "ok" maar er gaat niets weg', async () => {
  const e = env();
  const r = await verwerk(verzoek({ ...GOED, website: 'http://spam' }), e, { maakMail, nu: NU });
  assert.equal(r.status, 200);
  assert.equal(e.verzonden.length, 0);
});

test('worker: vreemde origin, verkeerd type, GET en ongeldige invoer', async () => {
  const e = env();
  assert.equal((await verwerk(verzoek(GOED, { Origin: 'https://kwaad.invalid' }), e, { maakMail, nu: NU })).status, 403);
  const json = new Request('https://komnaardekerk.nl/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: '{}' });
  assert.equal((await verwerk(json, e, { maakMail, nu: NU })).status, 400);
  assert.equal((await verwerk(new Request('https://komnaardekerk.nl/api/contact'), e, { maakMail, nu: NU })).status, 405);
  const r = await verwerk(verzoek({ ...GOED, voornaam: '' }), e, { maakMail, nu: NU });
  assert.equal(r.status, 422);
  assert.equal(e.verzonden.length, 0);
});

test('worker: zonder JavaScript volgt een redirect naar een gewone pagina', async () => {
  const e = env();
  const r = await verwerk(verzoek({ ...GOED, t: '' }, { Accept: 'text/html' }), e, { maakMail, nu: NU });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('Location'), '/even-praten/bedankt/');
  const fout = await verwerk(verzoek({ ...GOED, t: '', email: 'x' }, { Accept: 'text/html' }), e, { maakMail, nu: NU });
  assert.equal(fout.headers.get('Location'), '/even-praten/niet-gelukt/');
});

test('worker: misbruikrem en mislukte verzending', async () => {
  const e = env({ RATE_LIMIT: { limit: async () => ({ success: false }) } });
  assert.equal((await verwerk(verzoek(GOED), e, { maakMail, nu: NU })).status, 429);
  const stuk = env({ MAIL: { send: async () => { throw new Error('x'); } } });
  const orig = console.error;
  console.error = () => {};
  try {
    assert.equal((await verwerk(verzoek(GOED), stuk, { maakMail, nu: NU })).status, 502);
  } finally {
    console.error = orig;
  }
});
