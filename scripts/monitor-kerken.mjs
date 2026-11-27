#!/usr/bin/env node
// Wekelijkse controle van Houtense kerkwebsites. Alleen openbare, officiële HTTPS-bronnen.
// Zonder --write: alleen rapport. --write wijzigt data in Git, maar deployt NOOIT.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { isIP } from 'node:net';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONT = path.join(ROOT, 'content');
const MON = path.join(ROOT, 'monitor');
const MAX_BYTES = 900_000;
const MAX_PAGES = 90;
const MAX_EVENTS = 30;
const KEYWORDS = /kerst|paas|pasen|pinkster|alpha|messy church|advent|nieuwjaar|oudjaar|bijbel|evangelie|geloof|zangdienst|gezinsdienst|jeugddienst|gebeds|missionair|belijdenis|open kerk|seminar|jongeren|jeugdavond|tiener|advent|kerstnacht|herdenk|stille week|passion/i;
const hash = (x) => createHash('sha256').update(x).digest('hex').slice(0, 20);
const veilig = (x, max = 130) => String(x || '').replace(/<[^>]*>/g, '').replace(/[<>{}\r\n\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const canon = (x) => veilig(x, 300).toLocaleLowerCase('nl-NL').replace(/[\s,.-]/g, '');
const json = async (p) => JSON.parse(await readFile(path.join(CONT, p), 'utf8'));
const soorten = (t) => (Array.isArray(t) ? t : [t]).map(String);

export function veiligeUrl(url, basis = undefined) {
  if (typeof url !== 'string' || !url.trim()) return null;
  try {
    const u = new URL(url, basis);
    if (u.protocol !== 'https:' || u.username || u.password || u.port || !u.hostname.includes('.') || isIP(u.hostname) ||
        /^(localhost|.*\.local|.*\.internal|127\.|0\.|10\.|192\.168\.|169\.254\.)/i.test(u.hostname)) return null;
    u.hash = '';
    return u.href;
  } catch { return null; }
}
export function magPubliceren(kerk) {
  return kerk?.deelname?.status === 'deelnemer' && kerk.deelname.toestemmingPublicatie === true;
}
export function officieel(url, kerk) {
  const veiligUrl = veiligeUrl(url);
  const thuis = veiligeUrl(kerk.website);
  if (!veiligUrl || !thuis) return false;
  return new URL(veiligUrl).hostname.toLowerCase() === new URL(thuis).hostname.toLowerCase();
}
export function gebeurtenissen(html) {
  const uit = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (!/\btype\s*=\s*["']application\/ld\+json["']/i.test(match[1])) continue;
    if (match[2].length > 200_000) continue;
    try {
      const root = JSON.parse(match[2]);
      const gezien = new Set();
      const bezoek = (obj, diepte = 0) => {
        if (!obj || typeof obj !== 'object' || diepte > 8 || gezien.has(obj)) return;
        gezien.add(obj);
        if (Array.isArray(obj)) { for (const el of obj.slice(0, 200)) bezoek(el, diepte + 1); return; }
        if (soorten(obj['@type']).some((t) => /(^|\/|#)Event$/i.test(t))) uit.push(obj);
        for (const [k, val] of Object.entries(obj)) {
          if (['@context', 'description', 'image', 'offers'].includes(k)) continue;
          if (typeof val === 'object') bezoek(val, diepte + 1);
        }
      };
      bezoek(root);
    } catch { /* kapotte JSON-LD wordt nooit automatisch gepubliceerd */ }
  }
  return uit.slice(0, MAX_EVENTS);
}
export function beoordeel(event, kerk, bron, nu = new Date()) {
  const naam = veilig(event.name, 110);
  const eventUrl = veiligeUrl(event.url || event['@id'], bron);
  const startTekst = typeof event.startDate === 'string' ? event.startDate : '';
  const start = new Date(startTekst);
  const locatie = event.location && !Array.isArray(event.location) ? event.location : {};
  const adres = locatie.address && typeof locatie.address === 'object' ? locatie.address : {};
  const eventAdres = canon(adres.streetAddress);
  const kerkAdres = canon(kerk.adres || '');
  const postcode = canon(kerk.postcode || '');
  const plaats = canon(kerk.plaats || '');
  const precies = Boolean(kerkAdres && postcode && plaats && eventAdres === kerkAdres &&
    canon(adres.postalCode) === postcode && canon(adres.addressLocality) === plaats);
  const redenen = [];
  const verifieerbareDag = /^\d{4}-\d\d-\d\d/.exec(startTekst)?.[0];
  const geldigDag = verifieerbareDag && new Date(verifieerbareDag + 'T00:00:00Z').toJSON()?.slice(0, 10) === verifieerbareDag;
  if (!officieel(bron, kerk) || !eventUrl || !officieel(eventUrl, kerk) ||
      new URL(eventUrl || 'https://ongeldig.invalid/').pathname === '/') redenen.push('geen officiële, afzonderlijke evenementlink');
  if (naam.length < 5 || !KEYWORDS.test(naam)) redenen.push('geen duidelijk missionair of bijzonder kerkelijk evenement');
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?(?:Z|[+-]\d\d:\d\d)$/.test(startTekst) ||
      !geldigDag || !Number.isFinite(start.getTime()) || start.getTime() <= nu.getTime() ||
      start.getTime() > nu.getTime() + 120 * 86400_000) redenen.push('datum/tijd niet bevestigd of buiten komende 120 dagen');
  const organisator = event.organizer;
  if (!organisator || (canon(organisator.name) !== canon(kerk.naam) && veiligeUrl(organisator.url) !== veiligeUrl(kerk.website))) redenen.push('organisator komt niet overeen met kerk');
  if (!precies) redenen.push('locatie niet exact gelijk aan bekend kerkadres');
  if (event.eventAttendanceMode && !/OfflineEventAttendanceMode$/.test(event.eventAttendanceMode)) redenen.push('geen fysieke bijeenkomst');
  const status = String(event.eventStatus || '');
  if (status && !/EventScheduled$|EventCancelled$/.test(status)) redenen.push('onduidelijke evenementstatus');
  const annulering = /EventCancelled$/.test(status);
  return {naam, url: eventUrl, start, annulering, redenen, akkoord: redenen.length === 0};
}
export function nieuweLinks(html, bron) {
  const links = [];
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = veilig(m[2], 100);
    const url = veiligeUrl(m[1], bron);
    if (!url || new URL(url).hostname !== new URL(bron).hostname || !KEYWORDS.test(label)) continue;
    if (!links.some((x) => x.url === url)) links.push({label, url});
  }
  return links.slice(0, 20);
}
export function bronnen(kerken, initiatieven) {
  const uit = new Map();
  const voegToe = (url, kerk, auto = true) => {
    const veiligAdres = veiligeUrl(url);
    if (!veiligAdres) return;
    const key = kerk.id + '|' + veiligAdres;
    if (uit.has(key)) return;
    uit.set(key, { url: veiligAdres, kerkId: kerk.id, auto: auto && officieel(veiligAdres, kerk) });
  };
  for (const kerk of kerken) {
    for (const feed of kerk.feeds || []) voegToe(feed, kerk, false);
    voegToe(kerk.website, kerk);
    if (kerk.rooster?.url) voegToe(kerk.rooster.url, kerk);
    for (const b of (kerk.bronnen || []).filter((x) => /agenda|activiteiten|nieuws|kerkdienst|rooster|evenement|missionair/i.test(x.url)).slice(0, 4)) voegToe(b.url, kerk);
  }
  for (const item of initiatieven) {
    const kerk = kerken.find((k) => (item.organisatoren || []).includes(k.id));
    if (kerk && item.actueel && item.bron) voegToe(item.bron, kerk); // officieel() sluit bronnen op een ander domein uit
  }
  return [...uit.values()].slice(0, MAX_PAGES);
}
async function ophalen(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal, redirect: 'manual',
      headers: {'User-Agent': 'KomNaarDeKerk-monitor/1.0 (+https://komnaardekerk.nu)', 'Accept': 'text/html, application/rss+xml, application/atom+xml, text/calendar, application/xml'}
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    if (!/html|xml|calendar|text\/plain|octet-stream/i.test(res.headers.get('content-type') || '')) throw new Error('onbekend bronformaat');
    if (Number(res.headers.get('content-length') || 0) > MAX_BYTES) throw new Error('pagina te groot');
    if (!res.body) throw new Error('lege response');
    const reader = res.body.getReader();
    let totaal = 0;
    const delen = [];
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        totaal += value.byteLength;
        if (totaal > MAX_BYTES) throw new Error('pagina te groot');
        delen.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); }
    const buf = new Uint8Array(totaal);
    let offset = 0;
    for (const deel of delen) { buf.set(deel, offset); offset += deel.length; }
    const tekst = new TextDecoder().decode(buf);
    if (/checking your browser|<title>even geduld|cf-chl-/i.test(tekst)) throw new Error('bron vraagt om browsercontrole');
    return tekst;
  } finally { clearTimeout(timer); }
}

function feedLinks(tekst, bron) {
  return [...new Set([...tekst.matchAll(/<(?:link|a)\b[^>]*>/gi)].flatMap(([tag]) => {
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)/i)?.[1]?.replaceAll('&amp;', '&');
    if (!href || !/application\/(?:rss|atom)\+xml|text\/calendar|\.ics(?:[?"']|$)/i.test(tag)) return [];
    const url = veiligeUrl(href, bron);
    return url && new URL(url).origin === new URL(bron).origin ? [url] : [];
  }))].slice(0, 5);
}

export function feedItems(tekst, bron, now = new Date()) {
  const items = [];
  for (const [, blok] of tekst.replace(/\r?\n[ \t]/g, '').matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/gi)) {
    const veld = (key) => blok.match(new RegExp('^' + key + '(?:;[^:\\r\\n]*)?:(.+)$', 'im'))?.[1]?.trim();
    const naam = veilig(veld('SUMMARY'));
    const datum = veilig(veld('DTSTART'), 32);
    const dag = datum.slice(0, 8);
    if (KEYWORDS.test(naam) && /^\d{8}$/.test(dag) && dag >= kalenderDag(now).replaceAll('-', '')) {
      items.push({ naam, url: veiligeUrl(veld('URL'), bron) || bron, datum });
    }
  }
  for (const [, blok] of tekst.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)) {
    const naam = veilig(blok.match(/<title\b[^>]*>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]);
    const href = blok.match(/<link\b[^>]*\bhref=["']([^"']+)/i)?.[1] || blok.match(/<link>([^<]+)/i)?.[1];
    if (KEYWORDS.test(naam)) items.push({ naam, url: veiligeUrl(href, bron) || bron });
  }
  return items.slice(0, MAX_EVENTS);
}

const kalenderDag = (tijd) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(tijd);

export async function controleer({ kerken, initiatieven, vorige = {}, fetcher = ophalen, now = new Date(), productie = false }) {
  const datum = kalenderDag(now);
  const lijst = bronnen(kerken, initiatieven);
  const rapport = { datum, bronnen: [], voorstellen: [], wijzigingen: [] };
  const paginas = { ...vorige };
  const kandidaten = new Map();
  const items = structuredClone(initiatieven);
  const inhoudPerUrl = new Map();

  for (let begin = 0; begin < lijst.length;) {
    // In rondes, zodat traag reagerende kerksites elkaar zo min mogelijk ophouden.
    const resultaten = await Promise.allSettled(lijst.slice(begin, begin + 8).map(async ({ url }) => {
      if (!inhoudPerUrl.has(url)) inhoudPerUrl.set(url, Promise.resolve().then(() => fetcher(url)));
      return inhoudPerUrl.get(url);
    }));
    for (const [index, resultaat] of resultaten.entries()) {
      const bron = lijst[begin + index];
      const kerk = kerken.find((k) => k.id === bron.kerkId);
      const key = kerk.id + '|' + bron.url;
      if (resultaat.status === 'rejected') {
        rapport.bronnen.push({ ...bron, fout: veilig(resultaat.reason?.message, 100), laatstGecontroleerd: paginas[key]?.laatstGecontroleerd });
        continue;
      }
      const tekst = resultaat.value;
      rapport.bronnen.push({ ...bron, laatstGecontroleerd: datum });
      const links = nieuweLinks(tekst, bron.url);
      const vingerafdruk = hash(tekst.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));
      if (paginas[key]?.hash !== vingerafdruk) {
        for (const link of links.filter(({ url }) => !paginas[key]?.links?.includes(url))) {
          rapport.voorstellen.push({ kerk: kerk.id, naam: link.label, url: link.url, reden: 'Aankondiging controleren' });
        }
        if (paginas[key] && !links.some(({url}) => !paginas[key].links?.includes(url))) {
          rapport.voorstellen.push({ kerk: kerk.id, url: bron.url, reden: 'Bron gewijzigd. Controleer agenda en bezoekinformatie.' });
        }
      }
      paginas[key] = { hash: vingerafdruk, laatstGecontroleerd: datum, links: links.map(({ url }) => url) };
      for (const url of feedLinks(tekst, bron.url)) {
        if (lijst.length < MAX_PAGES && !lijst.some((b) => b.kerkId === kerk.id && b.url === url)) lijst.push({ url, kerkId: kerk.id, auto: false });
      }
      for (const item of feedItems(tekst, bron.url, now)) {
        rapport.voorstellen.push({ ...item, kerk: kerk.id, reden: 'Feedmelding. Controleer op de oorspronkelijke aankondiging.' });
      }
      for (const event of gebeurtenissen(tekst)) {
        const e = beoordeel(event, kerk, bron.url, now);
        // Alleen de eigen aankondiging kan een gevonden evenement bevestigen.
        if (e.url && bron.auto && e.url !== bron.url && lijst.length < MAX_PAGES && !lijst.some((b) => b.kerkId === kerk.id && b.url === e.url)) {
          lijst.push({ kerkId: kerk.id, url: e.url, auto: true });
        }
        if (!e.akkoord || !bron.auto || e.url !== bron.url || (!e.annulering && (!productie || !magPubliceren(kerk)))) {
          rapport.voorstellen.push({ kerk: kerk.id, naam: e.naam, url: e.url || bron.url, reden: e.redenen.join(', ') || 'Aankondiging of publicatie nog niet bevestigd' });
          continue;
        }
        const sleutel = kerk.id + '|' + e.url + '|' + e.start.toISOString();
        const eerdere = kandidaten.get(sleutel);
        if (!eerdere || e.annulering) kandidaten.set(sleutel, { e, kerk });
      }
    }
    begin += resultaten.length;
  }

  for (const [sleutel, { e, kerk }] of kandidaten) {
    const start = e.start.toISOString();
    const id = 'automatisch-' + hash(sleutel);
    const bestaande = items.find((i) => i.id === id || (i.organisatoren?.includes(kerk.id) &&
      (veiligeUrl(i.bron) === e.url || canon(i.naam) === canon(e.naam)) &&
      (i.start ? Date.parse(i.start) === Date.parse(start) : !e.annulering)));
    if (bestaande) {
      if (e.annulering && bestaande.actueel && veiligeUrl(bestaande.bron) === e.url) {
        bestaande.actueel = false;
        rapport.wijzigingen.push({ id: bestaande.id, actie: 'geannuleerd' });
      }
      continue;
    }
    if (e.annulering) continue;
    items.push({
      id, naam: e.naam, groep: /kerst|viering|dienst/i.test(e.naam) ? 'vieringen' : /jongeren|jeugd|tiener/i.test(e.naam) ? 'jongeren' : 'geloof',
      organisatoren: [kerk.id], omschrijving: 'Bekijk de aankondiging voor het programma en informatie over deelname.',
      start, waar: [kerk.adres, kerk.postcode, kerk.plaats].join(', '), bron: e.url,
      gecontroleerd: datum, actueel: true, automatisch: { bronKerk: kerk.id }
    });
    rapport.wijzigingen.push({ id, actie: 'toegevoegd' });
  }

  for (const item of items.filter((i) => i.actueel)) {
    const zonderToestemming = item.automatisch && !magPubliceren(kerken.find((k) => k.id === item.automatisch.bronKerk));
    const laatsteDag = item.totDatum || (item.start && kalenderDag(new Date(item.start)));
    if (zonderToestemming || (laatsteDag && laatsteDag < datum)) {
      item.actueel = false;
      rapport.wijzigingen.push({ id: item.id, actie: zonderToestemming ? 'toestemming vervallen' : 'verlopen' });
    }
  }
  rapport.voorstellen = [...new Map(rapport.voorstellen.map((v) => [JSON.stringify(v), v])).values()];
  return { rapport, paginas, items };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [site, kData, iData] = await Promise.all([json('site.json'), json('kerken.json'), json('initiatieven.json')]);
  const staatPad = path.join(MON, 'staat.json');
  const vorige = await readFile(staatPad, 'utf8').then(JSON.parse, (e) => {
    if (e.code !== 'ENOENT') throw e;
    return {};
  });
  const { rapport, paginas, items } = await controleer({
    kerken: kData.kerken, initiatieven: iData.initiatieven, vorige, productie: site.modus === 'productie'
  });
  await mkdir(MON, { recursive: true });
  await writeFile(path.join(MON, 'laatste-rapport.json'), JSON.stringify(rapport, null, 2) + '\n');
  if (process.argv.includes('--write')) {
    await writeFile(staatPad, JSON.stringify(paginas, null, 2) + '\n');
    if (rapport.wijzigingen.length) await writeFile(path.join(CONT, 'initiatieven.json'), JSON.stringify({ ...iData, initiatieven: items }, null, 2) + '\n');
  }
  const fouten = rapport.bronnen.filter((b) => b.fout).length;
  const samenvatting = `Bronnen: ${rapport.bronnen.length - fouten}/${rapport.bronnen.length} opgehaald. Wijzigingen: ${rapport.wijzigingen.length}. Ter beoordeling: ${rapport.voorstellen.length}.\n`;
  console.log(samenvatting.trim());
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_STEP_SUMMARY, samenvatting);
  }
}
