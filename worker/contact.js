// Pure logica voor het contactverzoek: valideren en een platte-tekstmail opbouwen.
// Geen opslag, geen logging van inhoud. Getest met node --test (test/contact.test.mjs).

export const SOORTEN = {
  samen: 'Wil graag samen naar een kerk',
  gesprek: 'Wil graag een keer praten',
  vraag: 'Heeft een vraag'
};

const MAX = { voornaam: 60, email: 120, telefoon: 20, bericht: 600, kerk: 60 };

function schoon(v, max) {
  // Geen regeleinden of stuurtekens in velden die in mailheaders of onderwerpen kunnen komen.
  return String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function valideer(invoer, { nu = Date.now(), kerkIds = [] } = {}) {
  const fouten = {};
  // Honeypot en minimale invultijd: stille weigering (bot), geen hint aan de afzender.
  if (schoon(invoer.website, 200)) return { ok: false, bot: true, fouten };
  // Het tijdveld wordt door JavaScript gevuld. Zonder JavaScript is het leeg: dan niet
  // als bot behandelen (honeypot en misbruikrem per IP blijven werken).
  if (invoer.t) {
    const t = Number(invoer.t);
    if (!Number.isFinite(t) || nu - t < 3000 || nu - t > 1000 * 60 * 60 * 24) return { ok: false, bot: true, fouten };
  }

  const soort = schoon(invoer.soort, 20);
  const voornaam = schoon(invoer.voornaam, MAX.voornaam).replace(/[\r\n]+/g, ' ');
  const email = schoon(invoer.email, MAX.email).replace(/[\r\n]+/g, '');
  const telefoon = schoon(invoer.telefoon, MAX.telefoon).replace(/[\r\n]+/g, '');
  const kerk = schoon(invoer.kerk, MAX.kerk);
  const bericht = schoon(String(invoer.bericht ?? '').replace(/\r\n?/g, '\n'), MAX.bericht);

  if (!SOORTEN[soort]) fouten.soort = 'Kies waar we je mee kunnen helpen.';
  if (!voornaam) fouten.voornaam = 'Vul je voornaam in.';
  if (!email && !telefoon) fouten.bereik = 'Vul een e-mailadres of telefoonnummer in.';
  if (email && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(email)) fouten.bereik = 'Controleer je e-mailadres.';
  if (telefoon && !/^\+?[0-9][0-9 ()-]{7,18}$/.test(telefoon)) fouten.bereik = 'Controleer je telefoonnummer.';
  if (kerk && !kerkIds.includes(kerk)) fouten.kerk = 'Onbekende kerk.';
  if (invoer.toestemming !== 'ja') fouten.toestemming = 'Toestemming is nodig om contact met je op te nemen.';

  if (Object.keys(fouten).length) return { ok: false, bot: false, fouten };
  return { ok: true, gegevens: { soort, voornaam, email, telefoon, kerk, bericht } };
}

function b64(tekst) {
  const bytes = new TextEncoder().encode(tekst);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function regels76(s) {
  return s.replace(/.{1,76}/g, '$&\r\n').trimEnd();
}

export function bouwMail({ gegevens, van, aan, kerkNaam = null, datum = new Date(), id = 'onbekend' }) {
  const onderwerp = `Kom naar de kerk: ${SOORTEN[gegevens.soort].toLowerCase()} (${gegevens.voornaam})`;
  const tekst = [
    'Nieuw contactverzoek via komnaardekerk.nl',
    '',
    `Wat:        ${SOORTEN[gegevens.soort]}`,
    `Voornaam:   ${gegevens.voornaam}`,
    `E-mail:     ${gegevens.email || '-'}`,
    `Telefoon:   ${gegevens.telefoon || '-'}`,
    `Kerk:       ${kerkNaam || 'maakt niet uit'}`,
    '',
    'Bericht:',
    gegevens.bericht || '-',
    '',
    '--',
    'De afzender heeft uitdrukkelijk toestemming gegeven om deze gegevens te gebruiken',
    'om contact op te nemen. Geef dit verzoek alleen door aan wie het opvolgt en',
    'verwijder het na afhandeling (zie de privacyverklaring).'
  ].join('\r\n');
  const headers = [
    `From: Kom naar de kerk <${van}>`,
    `To: <${aan}>`,
    gegevens.email ? `Reply-To: <${gegevens.email}>` : null,
    `Subject: =?UTF-8?B?${b64(onderwerp)}?=`,
    `Date: ${datum.toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${id}@komnaardekerk.nl>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64'
  ].filter(Boolean);
  return `${headers.join('\r\n')}\r\n\r\n${regels76(b64(tekst))}\r\n`;
}
