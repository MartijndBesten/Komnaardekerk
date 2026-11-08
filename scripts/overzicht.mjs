#!/usr/bin/env node
// Schrijft docs/KERKEN-OVERZICHT.md en docs/INITIATIEVEN.md uit content/*.json (één bron).
//   node scripts/overzicht.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lees = async (f) => JSON.parse(await readFile(path.join(ROOT, f), 'utf8'));
const { kerken, teVerifieren } = await lees('content/kerken.json');
const { initiatieven } = await lees('content/initiatieven.json');
const naam = Object.fromEntries(kerken.map((k) => [k.id, k.naam]));
const cel = (t) => String(t ?? '–').replace(/\|/g, '/').replace(/\n/g, ' ');
const tijd = (k) => (k.diensten || []).map((d) => `${d.dag.slice(0, 2)} ${d.tijd || '?'}${d.agenda === false ? '*' : ''}`).join(', ') || '–';

let md = `# Kerken in de gemeente Houten — geverifieerd overzicht

Gegenereerd uit \`content/kerken.json\` met \`node scripts/overzicht.mjs\`. Niet met de hand wijzigen.

**Deelnamestatus:** alle kerken staan op \`kandidaat\` (nog niet benaderd). Niemand is 'partner' of 'deelnemer'. Bron per kerk is de eigen website; controledatum per regel. \`*\` = niet wekelijks of tijd wisselt (zie rooster).

| Kerk | Verband | Plaats | Adres | Diensten | Kinderen | Contact | Status | Gecontroleerd |
|---|---|---|---|---|---|---|---|---|
`;
for (const k of kerken) {
  const c = k.contactroute ? `${k.contactroute.soort}` : '–';
  md += `| [${cel(k.naam)}](${k.website}) | ${cel(k.verband)} | ${cel(k.plaats)} | ${cel([k.adres, k.postcode].filter(Boolean).join(', '))} | ${cel(tijd(k))} | ${k.kinderen ? 'ja' : '–'} | ${c} | ${k.deelname.status} | ${k.gecontroleerd} |\n`;
}
md += `\n## Per kerk: zelfomschrijving, geloofsbasis en missionair\n\n`;
for (const k of kerken) {
  md += `### ${k.naam} (${k.officieleNaam || k.naam})\n\n`;
  md += `- **Kerkverband:** ${cel(k.kerkverband)}\n`;
  if (k.zelfomschrijving?.tekst) md += `- **Zelfomschrijving:** “${k.zelfomschrijving.tekst}” ([bron](${k.zelfomschrijving.bron}))\n`;
  if (k.geloofsbasis?.tekst) md += `- **Geloofsbasis:** ${cel(k.geloofsbasis.tekst)}${k.geloofsbasis.bron ? ` ([bron](${k.geloofsbasis.bron}))` : ''}\n`;
  if (k.kinderen) md += `- **Kinderen:** ${cel(k.kinderen)}\n`;
  if (k.livestream) md += `- **Online:** ${k.livestream}\n`;
  const eigen = initiatieven.filter((i) => (i.organisatoren || []).includes(k.id));
  if (eigen.length) md += `- **Missionair/kennismaken:** ${eigen.map((i) => i.naam).join('; ')}\n`;
  if (k.opmerkingen) md += `- **Opmerkingen onderzoek:** ${cel(k.opmerkingen)}\n`;
  md += `- **Bronnen:** ${(k.bronnen || []).map((b) => `[${cel(b.wat || 'bron')}](${b.url})`).join(' · ')}\n\n`;
}
md += `## Nog niet geverifieerd\n\n| Kerk | Plaats | Reden |\n|---|---|---|\n`;
for (const k of teVerifieren) md += `| ${cel(k.naam)} | ${cel(k.plaats)} | ${cel(k.reden)} |\n`;
md += `| Moluks Kerkelijk Centrum (Landelijk MKC) | Houten | Genoemd op Wikipedia/Commons; of er samenkomsten zijn, is niet bevestigd. |\n`;
await writeFile(path.join(ROOT, 'docs/KERKEN-OVERZICHT.md'), md);

let mi = `# Missionaire initiatieven — overzicht

Gegenereerd uit \`content/initiatieven.json\` met \`node scripts/overzicht.mjs\`. Alleen activiteiten met een directe kerkelijke of missionaire verbinding; algemene welzijnsorganisaties (Wereldhuis, Houten voor Houten, Stichting Present) vallen bewust buiten deze afbakening. Geen enkele organisator is benaderd; PROEF! is géén deelnemer.

| Activiteit | Organisator | Wanneer | Op de site | Gecontroleerd |
|---|---|---|---|---|
`;
for (const i of initiatieven) {
  mi += `| [${cel(i.naam)}](${i.website || i.bron}) | ${cel((i.organisatoren || []).map((o) => naam[o] || o).join(' en '))} | ${cel(i.wanneer)} | ${i.groep ? `ja (${i.groep})` : `nee: ${cel(i.nietOpgenomenOmdat)}`} | ${cel(i.gecontroleerd)} |\n`;
}
await writeFile(path.join(ROOT, 'docs/INITIATIEVEN.md'), mi);
console.log(`✓ docs/KERKEN-OVERZICHT.md (${kerken.length} + ${teVerifieren.length + 1}), docs/INITIATIEVEN.md (${initiatieven.length})`);
