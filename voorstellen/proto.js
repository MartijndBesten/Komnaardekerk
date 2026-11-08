// Prototype 'Kom naar de kerk.' — progressieve verbetering. Zonder dit script werkt alles via gewone links.
// Bewust: geen localStorage, sessionStorage, cookies, analytics of netwerkverzoeken.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Wisselende campagnewoorden in de hero, met pauzeknop (WCAG 2.2.2)
  const wissel = $('.wissel');
  const pauze = $('.pauze');
  if (wissel && !rustig) {
    const woorden = JSON.parse(wissel.dataset.woorden || '[]');
    let i = 0;
    let timer = null;
    const volgende = () => {
      wissel.classList.add('weg');
      setTimeout(() => {
        i = (i + 1) % woorden.length;
        wissel.textContent = woorden[i];
        wissel.classList.remove('weg');
      }, 450);
    };
    const start = () => { timer = setInterval(volgende, 3200); };
    const stop = () => { clearInterval(timer); timer = null; };
    start();
    if (pauze) {
      pauze.hidden = false;
      pauze.addEventListener('click', () => {
        const gepauzeerd = pauze.getAttribute('aria-pressed') === 'true';
        if (gepauzeerd) { start(); pauze.setAttribute('aria-pressed', 'false'); pauze.textContent = 'Pauzeer de wisselende woorden'; }
        else { stop(); pauze.setAttribute('aria-pressed', 'true'); pauze.textContent = 'Laat de woorden weer wisselen'; }
      });
    }
  }

  // 2. Woordveld: paneel op dezelfde pagina openen (zonder JS: naar /woord/)
  const panelen = $('.panelen');
  if (panelen) {
    const woorden = $$('.woordveld .woord');
    let laatste = null;
    const open = (id, knop) => {
      const p = $(`#paneel-${id}`);
      if (!p) return false;
      $$('.paneel', panelen).forEach((x) => { x.hidden = x !== p; });
      woorden.forEach((w) => w.removeAttribute('aria-current'));
      knop.setAttribute('aria-current', 'true');
      laatste = knop;
      const kop = $('.paneel-kop', p);
      kop.focus({ preventScroll: true });
      p.scrollIntoView({ behavior: rustig ? 'auto' : 'smooth', block: 'start' });
      return true;
    };
    woorden.forEach((w) => w.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (open(w.dataset.woord, w)) e.preventDefault();
    }));
    panelen.addEventListener('click', (e) => {
      if (!e.target.closest('[data-terug]')) return;
      const p = e.target.closest('.paneel');
      p.hidden = true;
      woorden.forEach((w) => w.removeAttribute('aria-current'));
      (laatste || woorden[0]).focus();
    });
  }

  // 3. Kijk eens binnen: tabs + stap-voor-stap
  const tabs = $('.tabs');
  if (tabs) {
    tabs.hidden = false;
    const knoppen = $$('[role="tab"]', tabs);
    const secties = knoppen.map((k) => $(`#${k.getAttribute('aria-controls')}`));
    const kies = (k) => {
      knoppen.forEach((x, n) => {
        const aan = x === k;
        x.setAttribute('aria-selected', String(aan));
        x.tabIndex = aan ? 0 : -1;
        secties[n].hidden = !aan;
      });
    };
    secties.forEach((s, n) => { s.setAttribute('role', 'tabpanel'); s.setAttribute('aria-labelledby', knoppen[n].id); s.tabIndex = -1; });
    knoppen.forEach((k, n) => {
      k.addEventListener('click', () => kies(k));
      k.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const v = knoppen[(n + d + knoppen.length) % knoppen.length];
        kies(v); v.focus();
      });
    });
    $$('.dienst-kop', document).forEach((h) => h.classList.add('sr'));
    kies(knoppen[0]);

    $$('.stappen').forEach((lijst) => {
      const items = $$('.stap-item', lijst);
      let i = 0;
      const balk = document.createElement('div');
      balk.className = 'stapper';
      balk.innerHTML = '<div class="voortgang" aria-hidden="true"><span></span></div><button type="button" data-vorige>Vorige</button><button type="button" data-volgende>Volgende stap</button><p class="sr" aria-live="polite"></p><button type="button" class="alles" aria-pressed="false">Toon alle stappen</button>';
      lijst.after(balk);
      lijst.classList.add('een');
      const [vorige, volgende, alles] = [$('[data-vorige]', balk), $('[data-volgende]', balk), $('.alles', balk)];
      const live = $('[aria-live]', balk);
      const toon = (n, melden) => {
        i = n;
        items.forEach((it, k) => it.classList.toggle('actief', k === i));
        vorige.disabled = i === 0;
        volgende.disabled = i === items.length - 1;
        $('.voortgang span', balk).style.width = `${((i + 1) / items.length) * 100}%`;
        if (melden) live.textContent = `${$('.stap-nr', items[i]).textContent}: ${$('h3', items[i]).textContent}`;
      };
      vorige.addEventListener('click', () => toon(i - 1, true));
      volgende.addEventListener('click', () => toon(i + 1, true));
      alles.addEventListener('click', () => {
        const aan = lijst.classList.toggle('een');
        alles.setAttribute('aria-pressed', String(!aan));
        alles.textContent = aan ? 'Toon alle stappen' : 'Stap voor stap';
        vorige.hidden = volgende.hidden = !aan;
      });
      toon(0, false);
    });
  }

  // 4. Eerste kerkbezoek: feitelijke filters, eerstvolgende dienst, agenda-bestand
  const form = $('.filters');
  const lijst = $('.kerken');
  if (form && lijst) {
    form.hidden = false;
    const kaarten = $$('.kerk', lijst);
    // volgorde schudden: gelijkwaardigheid, niets onthouden
    for (let n = kaarten.length - 1; n > 0; n--) {
      const k = Math.floor(Math.random() * (n + 1));
      [kaarten[n], kaarten[k]] = [kaarten[k], kaarten[n]];
    }
    kaarten.forEach((k) => lijst.append(k));

    const DAGEN = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    const nu = new Date();
    const volgende = (d) => {
      const [u, m] = d.tijd.split(':').map(Number);
      const t = new Date(nu);
      t.setHours(u, m, 0, 0);
      let delta = (DAGEN.indexOf(d.dag) - nu.getDay() + 7) % 7;
      if (delta === 0 && t <= nu) delta = 7;
      t.setDate(t.getDate() + delta);
      return t;
    };
    const datum = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    const pad = (n) => String(n).padStart(2, '0');
    const icsTijd = (t) => `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`;
    kaarten.forEach((k) => {
      const diensten = JSON.parse(k.dataset.diensten || '[]');
      if (!diensten.length) return;
      const eerst = diensten.map((d) => ({ ...d, t: volgende(d) })).sort((a, b) => a.t - b.t)[0];
      $('[data-volgende]', k).textContent = `Eerstvolgende: ${datum.format(eerst.t)}, ${eerst.tijd}`;
      if (!eerst.agenda) return;
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.textContent = 'Zet in je agenda';
      knop.addEventListener('click', () => {
        const eind = new Date(eerst.t.getTime() + 75 * 60000);
        const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kom naar de kerk.//prototype//NL', 'BEGIN:VEVENT', `UID:${Date.now()}@komnaardekerk.nu`, `DTSTAMP:${icsTijd(new Date())}`, `DTSTART:${icsTijd(eerst.t)}`, `DTEND:${icsTijd(eind)}`, `SUMMARY:${eerst.wat} ${k.dataset.naam}`, `LOCATION:${k.dataset.adres.replace(/,/g, '\\,')}`, 'DESCRIPTION:Controleer de tijd op de website van de kerk.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'kerkdienst.ics';
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      $('[data-agenda]', k).append(knop);
    });

    const aantal = $('[data-aantal]');
    const filter = () => {
      const wensen = $$('input[name="wens"]:checked', form).map((i) => i.value);
      const traditie = $('input[name="traditie"]:checked', form).value;
      const plaats = $('input[name="plaats"]:checked', form).value;
      let n = 0;
      kaarten.forEach((k) => {
        const kenm = k.dataset.kenmerken.split(' ');
        const tr = k.dataset.traditie === 'reformatorisch' ? 'protestants' : k.dataset.traditie;
        const past = wensen.every((w) => kenm.includes(w)) && (!traditie || tr === traditie) && (!plaats || k.dataset.plaats === plaats);
        k.hidden = !past;
        if (past) n++;
      });
      aantal.textContent = n === 0 ? 'Geen kerk past bij alle keuzes. Haal een vinkje weg.' : `${n} ${n === 1 ? 'kerk past' : 'kerken passen'} bij je keuzes`;
    };
    form.addEventListener('change', filter);
    form.addEventListener('submit', (e) => e.preventDefault());
    filter();
  }
})();
