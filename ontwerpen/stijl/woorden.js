// Ronde 5 — woorden die rustig wisselen, en een woord kiezen. Zonder dit script werkt alles via gewone links.
// Bewust: geen localStorage, sessionStorage, cookies, analytics of netwerkverzoeken.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Eén woord tegelijk; pauzeert bij hover en focus; knoppen voor pauze en een ander woord
  const w = $('.wissel');
  if (w) {
    const lijst = JSON.parse(w.dataset.woorden || '[]');
    const regel = w.parentElement;
    const knoppen = $('.wissel-knoppen');
    const pauze = $('[data-pauze]');
    let i = 0;
    let timer = null;
    let vast = rustig;
    let binnen = false;
    const toon = (n) => {
      i = (n + lijst.length) % lijst.length;
      const zet = () => {
        w.textContent = lijst[i].w;
        w.href = w.href.replace(/\/[^/]+\/$/, `/${lijst[i].id}/`);
        w.dataset.woord = lijst[i].id;
        regel.style.setProperty('--len', lijst[i].w.length);
        w.classList.remove('weg');
      };
      if (rustig) { zet(); return; }
      w.classList.add('weg');
      setTimeout(zet, 600);
    };
    const plan = () => {
      clearInterval(timer);
      timer = null;
      if (!vast && !binnen) timer = setInterval(() => toon(i + 1), 4200);
    };
    knoppen.hidden = false;
    $('[data-ander]').addEventListener('click', () => toon(i + 1));
    if (rustig) pauze.hidden = true;
    pauze.addEventListener('click', () => {
      vast = !vast;
      pauze.setAttribute('aria-pressed', String(vast));
      pauze.textContent = vast ? 'Verder' : 'Pauze';
      plan();
    });
    const blok = w.closest('.wissel-blok');
    blok.addEventListener('mouseenter', () => { binnen = true; plan(); });
    blok.addEventListener('mouseleave', () => { binnen = false; plan(); });
    blok.addEventListener('focusin', () => { binnen = true; plan(); });
    blok.addEventListener('focusout', () => { binnen = false; plan(); });
    plan();
  }

  // 2. Woord kiezen: het paneel opent op dezelfde pagina (zonder JS: de pagina /woord/)
  const panelen = $('.panelen');
  if (panelen) {
    const knoppen = $$('.woordveld .woord');
    let laatste = null;
    const open = (id) => {
      const p = $(`#paneel-${id}`);
      if (!p) return false;
      $$('.paneel', panelen).forEach((x) => { x.hidden = x !== p; x.classList.remove('verschijnt'); });
      knoppen.forEach((k) => {
        if (k.dataset.woord === id) k.setAttribute('aria-current', 'true');
        else k.removeAttribute('aria-current');
      });
      laatste = knoppen.find((k) => k.dataset.woord === id) || null;
      if (!rustig) p.classList.add('verschijnt');
      p.scrollIntoView({ behavior: rustig ? 'auto' : 'smooth', block: 'start' });
      $('.paneel-kop', p).focus({ preventScroll: true });
      return true;
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-woord]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (open(a.dataset.woord)) e.preventDefault();
    });
    panelen.addEventListener('click', (e) => {
      if (!e.target.closest('[data-sluit]')) return;
      e.target.closest('.paneel').hidden = true;
      knoppen.forEach((k) => k.removeAttribute('aria-current'));
      (laatste || knoppen[0]).focus();
    });
  }
})();
