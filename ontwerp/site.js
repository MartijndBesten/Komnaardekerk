// Kom naar de kerk. — ontwerp 'Open deur'. Progressieve verbetering: zonder dit script werkt alles via gewone links.
// Bewust: geen localStorage, sessionStorage, cookies, analytics of netwerkverzoeken.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Menu op mobiel
  const knop = $('.menu-knop');
  const menu = $('#hoofdmenu');
  if (knop && menu) {
    knop.hidden = false;
    knop.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      knop.setAttribute('aria-expanded', String(open));
      knop.textContent = open ? 'Sluiten' : 'Menu';
    });
  }

  // Rustig in beeld komen bij scrollen (alleen als het kan en mag)
  const onthul = $$('.onthul');
  if (onthul.length && !rustig && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((items) => {
      items.forEach((i) => { if (i.isIntersecting) { i.target.classList.add('zichtbaar'); io.unobserve(i.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    onthul.forEach((el) => io.observe(el));
  } else {
    onthul.forEach((el) => el.classList.add('zichtbaar'));
  }

  // 1. Woorden die rustig wisselen; stoppen bij hover en focus; zelf pauzeren of een ander woord
  const w = $('.wissel');
  if (w) {
    const lijst = JSON.parse(w.dataset.woorden || '[]');
    const regel = w.parentElement;
    const pauze = $('[data-pauze]');
    let i = 0;
    let timer = null;
    let vast = rustig;
    let binnen = false;
    const toon = (n) => {
      i = (n + lijst.length) % lijst.length;
      const zet = () => {
        w.textContent = lijst[i].w;
        w.href = `/${lijst[i].id}/`;
        w.dataset.woord = lijst[i].id;
        regel.style.setProperty('--len', lijst[i].w.length);
        w.classList.remove('weg');
      };
      if (rustig) { zet(); return; }
      w.classList.add('weg');
      setTimeout(zet, 700);
    };
    const plan = () => {
      clearInterval(timer);
      timer = null;
      if (!vast && !binnen) timer = setInterval(() => toon(i + 1), 4500);
    };
    $('.wissel-knoppen').hidden = false;
    $('[data-ander]').addEventListener('click', () => toon(i + 1));
    if (rustig) pauze.hidden = true;
    pauze.addEventListener('click', () => {
      vast = !vast;
      pauze.setAttribute('aria-pressed', String(vast));
      pauze.textContent = vast ? 'Verder' : 'Pauze';
      plan();
    });
    const blok = $('.wissel-blok');
    blok.addEventListener('mouseenter', () => { binnen = true; plan(); });
    blok.addEventListener('mouseleave', () => { binnen = false; plan(); });
    blok.addEventListener('focusin', () => { binnen = true; plan(); });
    blok.addEventListener('focusout', () => { binnen = false; plan(); });
    plan();
  }

  // 2. Een woord kiezen: de tekst opent op dezelfde pagina (zonder JS: de pagina /woord/)
  const panelen = $('.panelen');
  if (panelen) {
    const woorden = $$('.woordveld .woord');
    let laatste = null;
    const open = (id) => {
      const p = $(`#paneel-${id}`);
      if (!p) return false;
      $$('.paneel', panelen).forEach((x) => { x.hidden = x !== p; x.classList.remove('verschijnt'); });
      woorden.forEach((k) => (k.dataset.woord === id ? k.setAttribute('aria-current', 'true') : k.removeAttribute('aria-current')));
      laatste = woorden.find((k) => k.dataset.woord === id) || null;
      if (!rustig) { void p.offsetWidth; p.classList.add('verschijnt'); }
      $('#woorden').scrollIntoView({ behavior: rustig ? 'auto' : 'smooth', block: 'start' });
      $('.paneel-kop', p).focus({ preventScroll: true });
      return true;
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-woord]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      if (open(a.dataset.woord)) e.preventDefault();
    });
    panelen.addEventListener('click', (e) => {
      if (!e.target.closest('[data-sluit]')) return;
      e.target.closest('.paneel').hidden = true;
      woorden.forEach((k) => k.removeAttribute('aria-current'));
      (laatste || woorden[0]).focus();
    });
  }

  // 3. De eerste keer: tabbladen protestants / katholiek
  const tabs = $('.tabs');
  if (tabs) {
    tabs.hidden = false;
    const knoppen = $$('[role="tab"]', tabs);
    const delen = knoppen.map((k) => $(`#${k.getAttribute('aria-controls')}`));
    const kies = (k) => knoppen.forEach((x, n) => {
      const aan = x === k;
      x.setAttribute('aria-selected', String(aan));
      x.tabIndex = aan ? 0 : -1;
      delen[n].hidden = !aan;
    });
    delen.forEach((d, n) => { d.setAttribute('role', 'tabpanel'); d.setAttribute('aria-labelledby', knoppen[n].id); d.tabIndex = -1; });
    knoppen.forEach((k, n) => {
      k.addEventListener('click', () => kies(k));
      k.addEventListener('keydown', (e) => {
        const r = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!r) return;
        const v = knoppen[(n + r + knoppen.length) % knoppen.length];
        kies(v); v.focus();
      });
    });
    kies(knoppen[0]);
  }

  // 4. Kerken: filters op feiten, eerstvolgende dienst, agenda
  const form = $('.filters');
  const lijst = $('.kerk-lijst');
  if (form && lijst) {
    form.hidden = false;
    const kaarten = $$('.kerk', lijst);
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
    const ics = (t) => `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`;
    kaarten.forEach((k) => {
      const d = JSON.parse(k.dataset.diensten || '[]');
      if (!d.length) return;
      const e = d.map((x) => ({ ...x, t: volgende(x) })).sort((a, b) => a.t - b.t)[0];
      $('[data-volgende]', k).textContent = `Eerstvolgende: ${datum.format(e.t)}, ${e.tijd.replace(':', '.')} uur`;
      if (!e.agenda) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Zet in je agenda';
      b.addEventListener('click', () => {
        const eind = new Date(e.t.getTime() + 75 * 60000);
        const tekst = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kom naar de kerk.//NL', 'BEGIN:VEVENT', `UID:${Date.now()}@komnaardekerk.nu`, `DTSTAMP:${ics(new Date())}`, `DTSTART:${ics(e.t)}`, `DTEND:${ics(eind)}`, `SUMMARY:${e.wat} ${k.dataset.naam}`, `LOCATION:${k.dataset.adres.replace(/,/g, '\\,')}`, 'DESCRIPTION:Kijk voor de zekerheid nog even op de website van de kerk.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        const url = URL.createObjectURL(new Blob([tekst], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'kerkdienst.ics';
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      $('[data-agenda]', k).append(b);
    });
    const aantal = $('[data-aantal]');
    const filter = () => {
      const wens = $$('input[name="wens"]:checked', form).map((x) => x.value);
      const soort = $('input[name="soort"]:checked', form).value;
      const plaats = $('input[name="plaats"]:checked', form).value;
      let n = 0;
      kaarten.forEach((k) => {
        const kenm = k.dataset.kenmerken.split(' ');
        const past = wens.every((x) => kenm.includes(x)) && (!soort || k.dataset.soort === soort) && (!plaats || k.dataset.plaats === plaats);
        k.hidden = !past;
        if (past) n++;
      });
      aantal.textContent = n === 0 ? 'Geen kerk past bij al je keuzes. Haal een vinkje weg.' : `${n} ${n === 1 ? 'kerk past' : 'kerken passen'} bij je keuzes`;
    };
    form.addEventListener('change', filter);
    form.addEventListener('submit', (e) => e.preventDefault());
    filter();
  }
})();
