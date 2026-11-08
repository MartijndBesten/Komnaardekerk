// Leest en past de regels uit dist/_headers toe, zoals Cloudflare dat doet.
// Gedeeld door de lokale testserver (scripts/serve.mjs) en de bundel-Worker (worker/bundel.js).

export function leesHeaders(tekst) {
  const regels = [];
  let huidig = null;
  for (const lijn of tekst.split('\n')) {
    if (!lijn.trim() || lijn.trim().startsWith('#')) continue;
    if (!/^\s/.test(lijn)) {
      huidig = { patroon: lijn.trim(), headers: [] };
      regels.push(huidig);
    } else if (huidig) {
      const i = lijn.indexOf(':');
      huidig.headers.push([lijn.slice(0, i).trim(), lijn.slice(i + 1).trim()]);
    }
  }
  return regels;
}

export function past(patroon, host, pad) {
  const doel = /^https:\/\//.test(patroon) ? `https://${host}${pad}` : pad;
  const re = new RegExp(
    '^' +
      patroon
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/:[A-Za-z]\w*/g, '[^./]+') +
      '$'
  );
  return re.test(doel);
}

export function headersVoor(regels, host, pad) {
  const uit = [];
  for (const r of regels) if (past(r.patroon, host, pad)) uit.push(...r.headers);
  return uit;
}
