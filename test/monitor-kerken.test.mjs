import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controleer, feedItems } from '../scripts/monitor-kerken.mjs';

const website = 'https://kerk.example/';
const url = website + 'kerst/2026';
const nu = new Date('2026-11-27T12:00:00Z');
const kerk = {
  id: 'voorbeeld', naam: 'Voorbeeldkerk', website, adres: 'Plein 1', postcode: '3991 ED', plaats: 'Houten',
  deelname: { status: 'deelnemer', toestemmingPublicatie: true }
};
const kerst = {
  '@type': 'Event', name: 'Kerstnachtdienst', startDate: '2026-12-24T22:00:00+01:00', url,
  organizer: { name: kerk.naam },
  location: { address: { streetAddress: kerk.adres, postalCode: kerk.postcode, addressLocality: kerk.plaats } }
};

async function scan({ items = [], events = [kerst], kerkData = kerk, productie = true, now = nu, stuk = false } = {}) {
  return controleer({
    kerken: [kerkData], initiatieven: items, productie, now,
    fetcher: async (bron) => {
      if (stuk && bron === url) throw new Error('HTTP 503');
      return '<script type="application/ld+json">' + JSON.stringify(events) + '</script>';
    }
  });
}

test('alleen een evenement op de eigen bevestigde aankondiging wordt toegevoegd, eenmaal per uitvoering en herhaling', async () => {
  const { items, rapport } = await scan({ events: [kerst, kerst] });
  assert.equal(items.length, 1);
  assert.equal(items[0].bron, url);
  assert.equal(rapport.wijzigingen[0].actie, 'toegevoegd');
  assert.deepEqual((await scan({ items })).rapport.wijzigingen, []);
  assert.equal((await scan({ productie: false })).items.length, 0);
  assert.equal((await scan({ kerkData: { ...kerk, deelname: { status: 'kandidaat' } } })).items.length, 0);
});

test('bronfouten en een onjuiste organisator blijven ter beoordeling', async () => {
  const mislukt = await scan({ stuk: true });
  assert.equal(mislukt.items.length, 0);
  assert.equal(mislukt.rapport.bronnen.find((bron) => bron.url === url).fout, 'HTTP 503');
  for (const event of [{ ...kerst, organizer: { name: 'Andere kerk' } }, { ...kerst, startDate: '2026-12-24' }]) {
    assert.equal((await scan({ events: [event] })).items.length, 0);
  }
});

test('annulering en verlopen datum maken activiteiten onzichtbaar zonder historie te wissen', async () => {
  const { items } = await scan();
  const annulering = await scan({ items, events: [{ ...kerst, eventStatus: 'https://schema.org/EventCancelled' }] });
  assert.equal(annulering.items[0].actueel, false);
  assert.equal(annulering.rapport.wijzigingen[0].actie, 'geannuleerd');
  const verlopen = await scan({ items, events: [], now: new Date('2026-12-24T23:01:00Z') });
  assert.equal(verlopen.items[0].actueel, false);
  assert.equal(verlopen.rapport.wijzigingen[0].actie, 'verlopen');
});

test('RSS, Atom en iCal leveren signalen voor beoordeling', () => {
  const invoer = `BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Kerstviering\r\nDTSTART;TZID=Europe/Amsterdam:20261224T190000\r\nEND:VEVENT\r\nEND:VCALENDAR
    <rss><channel><item><title>Alpha-cursus</title><link>${website}alpha/</link></item></channel></rss>
    <feed><entry><title>Jongerenavond</title><link href="${website}jeugd/"/></entry></feed>`;
  assert.deepEqual(feedItems(invoer, website, nu).map(({naam}) => naam), ['Kerstviering', 'Alpha-cursus', 'Jongerenavond']);
});
