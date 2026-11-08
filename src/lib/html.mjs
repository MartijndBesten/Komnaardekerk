// Kleine, veilige HTML-hulpjes. Alle inhoud uit content/*.json gaat via esc().

export function esc(waarde) {
  return String(waarde ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Template-tag: alleen interpolaties die al HTML zijn (raw) worden niet ge-escaped.
const RAW = Symbol('raw');
export function raw(html) {
  return { [RAW]: true, html: String(html) };
}

function waarde(v) {
  if (v === null || v === undefined || v === false) return '';
  if (Array.isArray(v)) return v.map(waarde).join('');
  if (typeof v === 'object' && v[RAW]) return v.html;
  return esc(v);
}

export function html(strings, ...waarden) {
  let uit = '';
  strings.forEach((s, i) => {
    uit += s;
    if (i < waarden.length) uit += waarde(waarden[i]);
  });
  return raw(uit);
}

export function alinea(teksten, klasse = '') {
  const k = klasse ? ` class="${esc(klasse)}"` : '';
  return raw((teksten || []).map((t) => `<p${k}>${esc(t)}</p>`).join('\n'));
}

export function render(v) {
  return waarde(v);
}
