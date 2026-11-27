# Wekelijkse broncontrole

GitHub Actions draait op maandag om 07.17 UTC (08.17 uur wintertijd, 09.17 uur zomertijd) op de standaardbranch. De workflow kan ook handmatig worden gestart. Bij een pull request draait alleen de teststraat.

De controle leest kerkwebsites, opgegeven roosters en een begrensd aantal feeds en officiële aankondigingen. HTML-links, RSS, Atom en iCal leveren signalen ter beoordeling. Alleen gestructureerde evenementgegevens op de aankondiging zelf komen in aanmerking voor automatische toevoeging. De controle vraagt om een specifieke HTTPS-bron op het eigen domein, een volledige datum en tijd met tijdzone, een bekende organisator, een bevestigd kerkadres en een geldige status. Pagina-aanpassingen en ontoegankelijke bronnen veranderen de bestaande gegevens niet.

Nieuwe evenementen worden alleen automatisch toegevoegd in productiemodus, voor een kerk met bevestigde deelname én toestemming voor publicatie. Een bevestigde annulering verbergt een overeenkomende activiteit met dezelfde datum. Een verstreken einddatum of ingetrokken toestemming maakt het item onzichtbaar. Bij een activiteit met meerdere data geeft `totDatum` de laatste bevestigde datum aan. Losse gebeurtenissen kunnen `start` gebruiken. Tekstuele data zonder zo'n veld vragen redactie. De wekelijkse uitvoering bepaalt wanneer verlopen kaarten verdwijnen.

Bij iedere uitvoering toont GitHub Actions een samenvatting en biedt het artefact `kerkagenda-rapport` de details per bron, fouten en voorstellen. `monitor/staat.json` bewaart de laatste geslaagde controledatum en een vingerafdruk per bron. Bij bronfouten blijven de laatst bekende gegevens staan. Bij een mislukte build, test of push volgt geen Cloudflare-uitrol.

## Lokaal

```bash
node --test test/monitor-kerken.test.mjs
node scripts/monitor-kerken.mjs
# Met --write worden ook de bronstaat en verwerkte wijzigingen opgeslagen.
```

Gebruik bij Node 24 achter een proxy zo nodig `NODE_USE_ENV_PROXY=1`. De broncontrole volgt geen redirects. Voor een verhuisde agenda moet de nieuwe officiële URL worden gecontroleerd en vastgelegd. Voor afgeschermde bronnen is handmatige controle nodig. Er worden geen websitescripts uitgevoerd. PDF-roosters worden gesignaleerd via de officiële agenda of het rooster waarin ze zijn gelinkt en vragen handmatige controle.

## Uitrol

De workflow kan uitsluitend de bestaande preview-Worker bijwerken. Daarvoor zijn de GitHub-omgeving `kerkoverzicht-preview`, een Cloudflare-omgevingsecret `CLOUDFLARE_API_TOKEN` voor de bestaande Worker en de repositoryvariabele `KNDK_AUTOMATISCHE_PREVIEW=ja` nodig. De workflow verifieert de huidige hoofdbranch, de build, de live commit en de noindex-header. De Worker-uitrol weigert een nieuw domein of een domein dat aan een andere Worker hangt. De preview behandelt het contactformulier als uitgeschakeld. Het officiële hoofddomein vraagt een afzonderlijk geautoriseerde koppeling en uitrol.
