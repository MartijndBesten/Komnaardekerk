# Vóór de officiële lancering — wat nog geregeld moet worden

De productiepoort (`npm run poort`) bewaakt de technische punten. Deze lijst is breder.

## Organisatie en kerken

- [ ] Kerngroep uit meerdere kerken (docs/KERKEN-UITNODIGEN.md)
- [ ] Verantwoordelijke organisatie (stichting of kerk namens anderen) → privacyverklaring, domeinhouder (VRAGEN V-002)
- [ ] Minstens één, liefst meerdere kerken als `deelnemer` met schriftelijke toestemming en eigen gecontroleerde gegevens (V-001)
- [ ] Gezamenlijke geloofsbasis vastgesteld door de deelnemende kerken (V-006)
- [ ] Afspraak over gelijke presentatie (volgorde wisselt al; foto's voor alle kerken of voor geen)
- [ ] PROEF! en andere organisatoren van activiteiten: toestemming voor vermelding

## Inhoud en rechten

- [ ] Mattheüs 11:28: vertaling kiezen (NBV21 of HSV; exacte teksten staan in `content/site.json`) en de rechthebbende om toestemming vragen; tot dan staat er een gemarkeerde eigen weergave (V-003)
- [ ] Foto's: per kerk een eigen foto met toestemming; hero eventueel afwisselend, zodat niet één kerk (nu de Pleinkerk) het gezicht van het initiatief is (V-007)
- [ ] Commons-foto's: CC BY-SA-naamsvermelding blijft staan; let op 'gelijk delen' bij bewerkte versies
- [ ] Hulplijnnummers (113, De Luisterlijn) controleren op de officiële sites
- [ ] Teksten laten lezen door iemand zonder kerkelijke achtergrond en door iemand van elke traditie
- [ ] Naam: `komnaardekerk.nl` is al geregistreerd door een ander (Wix, geen site). Beslissen of dat een probleem is

## Contact en privacy

- [ ] Wie ontvangt contactverzoeken, verdeling over kerken, reactietermijn, bewaartermijn (V-004)
- [ ] Cloudflare Email Routing + geverifieerd bestemmingsadres, `CONTACT_AAN=ja`, rate-limit-binding (README)
- [ ] Privacyverklaring definitief (verantwoordelijke, termijnen, rechten)
- [ ] Echte proefverzending met toestemming (alleen intern)

## Domein en techniek

- [ ] `komnaardekerk.nu` registreren (was op 8-11-2026 niet geregistreerd; DNS gaf NXDOMAIN) — kosten en houder bepalen
- [ ] DNS naar Cloudflare, Worker-route of Pages, www → apex (B98)
- [ ] `site.modus` op `productie`, `npm run poort` groen, browsertest tegen het echte domein
- [ ] Preview `komnaardekerk.martijndenbesten.com` opheffen of achter Access zetten
- [ ] Google Search Console / sitemap aanmelden (geen tracking nodig)
- [ ] Safari (iPhone) en Firefox handmatig of in CI testen — in de cloudsessie niet beschikbaar
- [ ] Hoge-resolutieversie van de heldfoto (Wikimedia gaf rate-limit; nu 543 px breed)

## Na de lancering

- [ ] Elk kwartaal: kerkgegevens en activiteiten opnieuw controleren (de poort weigert gegevens ouder dan 90 dagen / activiteiten ouder dan 60 dagen)
- [ ] Drukwerk: visitekaartjes, uitnodigingskaarten, poster (zie /ontwerp/)
