import { valideer, bouwMail } from './contact.js';
import kerkenData from '../content/kerken.json' with { type: 'json' };

const BEVEILIGING = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Robots-Tag': 'noindex'
};

function antwoord(request, status, body, redirect) {
  const wilJson = (request.headers.get('Accept') || '').includes('application/json');
  if (wilJson) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...BEVEILIGING, 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
  // Zonder JavaScript: terug naar een gewone pagina.
  return new Response(null, { status: 303, headers: { ...BEVEILIGING, Location: redirect } });
}

export async function verwerk(request, env, { maakMail, nu = Date.now() } = {}) {
  const url = new URL(request.url);
  const mislukt = '/samen-naar-de-kerk/niet-gelukt/';
  if (request.method !== 'POST') {
    return new Response('Methode niet toegestaan', { status: 405, headers: { ...BEVEILIGING, Allow: 'POST' } });
  }
  // Fail-closed: zonder expliciete inschakeling en mailconfiguratie gaat er niets weg.
  if (env.CONTACT_AAN !== 'ja' || !env.MAIL || !env.MAIL_VAN || !env.MAIL_AAN) {
    return antwoord(request, 503, { ok: false, melding: 'Het contactformulier is nog niet actief.' }, mislukt);
  }
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) {
    return antwoord(request, 403, { ok: false, melding: 'Niet toegestaan.' }, mislukt);
  }
  const lengte = Number(request.headers.get('Content-Length') || 0);
  if (lengte > 8192) return antwoord(request, 413, { ok: false, melding: 'Bericht te lang.' }, mislukt);

  if (env.RATE_LIMIT) {
    const ip = request.headers.get('CF-Connecting-IP') || 'onbekend';
    const { success } = await env.RATE_LIMIT.limit({ key: ip });
    if (!success) return antwoord(request, 429, { ok: false, melding: 'Even te veel verzoeken. Probeer het later nog eens.' }, mislukt);
  }

  let invoer;
  try {
    const type = request.headers.get('Content-Type') || '';
    if (!type.includes('application/x-www-form-urlencoded') && !type.includes('multipart/form-data')) throw new Error('type');
    const fd = await request.formData();
    invoer = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  } catch {
    return antwoord(request, 400, { ok: false, melding: 'Onbekend formaat.' }, mislukt);
  }

  const kerken = kerkenData.kerken;
  const uitslag = valideer(invoer, { nu, kerkIds: kerken.map((k) => k.id) });
  if (uitslag.bot) {
    // Doe alsof het gelukt is; verstuur niets.
    return antwoord(request, 200, { ok: true }, '/samen-naar-de-kerk/bedankt/');
  }
  if (!uitslag.ok) {
    return antwoord(request, 422, { ok: false, melding: Object.values(uitslag.fouten)[0], fouten: uitslag.fouten }, mislukt);
  }

  const kerk = kerken.find((k) => k.id === uitslag.gegevens.kerk);
  const id = crypto.randomUUID();
  const raw = bouwMail({ gegevens: uitslag.gegevens, van: env.MAIL_VAN, aan: env.MAIL_AAN, kerkNaam: kerk?.naam, id });
  try {
    await env.MAIL.send(await maakMail(env.MAIL_VAN, env.MAIL_AAN, raw));
  } catch {
    // Geen inhoud loggen: alleen dat het misging.
    console.error('contact: verzenden mislukt', id);
    return antwoord(request, 502, { ok: false, melding: 'Versturen is niet gelukt. Probeer het later nog eens.' }, mislukt);
  }
  return antwoord(request, 200, { ok: true }, '/samen-naar-de-kerk/bedankt/');
}
