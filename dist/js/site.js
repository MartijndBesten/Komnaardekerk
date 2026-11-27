/* komnaardekerk.nl — kleine, losse verbeteringen. Alles werkt ook zonder dit script.
   Geen cookies, geen opslag, geen externe verzoeken (behalve het formulier naar /api/contact). */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.remove('geen-js');
  doc.classList.add('js');

  function alle(sel, basis) {
    return Array.prototype.slice.call((basis || document).querySelectorAll(sel));
  }

  /* ---------- menu ---------- */
  var knop = document.querySelector('.menuknop');
  var menu = document.getElementById('hoofdmenu');
  if (knop && menu) {
    var zet = function (open) {
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open);
    };
    knop.addEventListener('click', function () {
      zet(knop.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && knop.getAttribute('aria-expanded') === 'true') {
        zet(false);
        knop.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (knop.getAttribute('aria-expanded') === 'true' && !menu.contains(e.target) && !knop.contains(e.target)) zet(false);
    });
  }

  /* ---------- wisselende woorden in de held ---------- */
  var w = document.querySelector('.wissel');
  if (w) {
    var rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lijst = JSON.parse(w.getAttribute('data-woorden') || '[]');
    var regel = w.parentNode;
    var knoppen = document.querySelector('.wissel-knoppen');
    var pauze = document.querySelector('[data-pauze]');
    var ander = document.querySelector('[data-ander]');
    var i = 0;
    var timer = null;
    var vast = rustig;
    var binnen = false;
    var toon = function (n) {
      i = (n + lijst.length) % lijst.length;
      var zet = function () {
        w.textContent = lijst[i].w;
        w.setAttribute('href', '#gevoel-' + lijst[i].id);
        w.setAttribute('data-woord', lijst[i].id);
        regel.style.setProperty('--len', String(lijst[i].w.length));
        w.classList.remove('weg');
      };
      if (rustig) {
        zet();
        return;
      }
      w.classList.add('weg');
      setTimeout(zet, 700);
    };
    var plan = function () {
      clearInterval(timer);
      timer = null;
      if (!vast && !binnen) timer = setInterval(function () { toon(i + 1); }, 4500);
    };
    regel.style.setProperty('--len', String(lijst[0] ? lijst[0].w.length : 4));
    if (knoppen) knoppen.hidden = false;
    if (rustig && pauze) pauze.hidden = true;
    if (ander) ander.addEventListener('click', function () { toon(i + 1); });
    if (pauze) {
      pauze.addEventListener('click', function () {
        vast = !vast;
        pauze.setAttribute('aria-pressed', vast ? 'true' : 'false');
        pauze.textContent = vast ? 'Verder' : 'Pauze';
        plan();
      });
    }
    var blok = w.closest('.wissel-blok') || regel;
    blok.addEventListener('mouseenter', function () { binnen = true; plan(); });
    blok.addEventListener('mouseleave', function () { binnen = false; plan(); });
    blok.addEventListener('focusin', function () { binnen = true; plan(); });
    blok.addEventListener('focusout', function () { binnen = false; plan(); });
    // het woord opent de bijbehorende keuze
    w.addEventListener('click', function () {
      var doel = document.getElementById('gevoel-' + w.getAttribute('data-woord'));
      if (doel && doel.tagName === 'DETAILS') doel.open = true;
    });
    plan();
  }

  /* ---------- onthullen bij scrollen ---------- */
  var onthul = alle('main > :not(.held) .onthul');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (items) {
        items.forEach(function (it) {
          if (it.isIntersecting) {
            it.target.classList.add('zichtbaar');
            io.unobserve(it.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    );
    onthul.forEach(function (el) {
      io.observe(el);
    });
  } else {
    onthul.forEach(function (el) {
      el.classList.add('zichtbaar');
    });
  }

  /* ---------- een zondagochtend: tijdlijn die meegroeit, en keuzes die de tekst aanpassen ---------- */
  // Niets wordt opgeslagen: de keuzes gelden alleen zolang deze pagina open is.
  var ochtend = document.querySelector('[data-ochtend]');
  if (ochtend) {
    var stappen = alle('.ochtend-stap', ochtend);
    var vastTot = 0; // na een klik op een stip even niet laten verspringen door het scrollen
    var vul = function () {
      var bereikt = alle('.ochtend-stap.bereikt', ochtend);
      var laatste = bereikt[bereikt.length - 1];
      var deel = laatste ? Math.min(1, (laatste.offsetTop + 12) / Math.max(1, ochtend.offsetHeight - 12)) : 0;
      if (laatste === stappen[stappen.length - 1]) deel = 1;
      ochtend.style.setProperty('--vulling', String(deel));
      if (toonScene) toonScene(laatste || stappen[0]);
    };

    // de getekende zaal volgt de laatst bereikte stap
    var sceneFig = document.querySelector('[data-ochtend-scene]');
    var zaal = sceneFig && sceneFig.querySelector('svg');
    var sceneTitel = sceneFig && sceneFig.querySelector('[data-scene-titel]');
    var stipKnoppen = sceneFig ? alle('[data-naar]', sceneFig) : [];
    var toonScene = function (stap) {
      if (!zaal || !stap) return;
      var id = stap.id.replace('ochtend-', '');
      zaal.setAttribute('data-stap', id);
      var kop = stap.querySelector('.ochtend-kop');
      if (sceneTitel && kop) sceneTitel.textContent = kop.firstChild.textContent.trim();
      stipKnoppen.forEach(function (b) {
        if (b.getAttribute('data-naar') === id) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
    };
    if (sceneFig) {
      sceneFig.hidden = false;
      var rustigScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      stipKnoppen.forEach(function (b) {
        b.addEventListener('click', function () {
          var doel = document.getElementById('ochtend-' + b.getAttribute('data-naar'));
          if (!doel) return;
          var n = stappen.indexOf(doel);
          stappen.forEach(function (st, k) {
            st.classList.toggle('bereikt', k <= n);
          });
          vastTot = 0;
          vul();
          vastTot = Date.now() + 1400;
          // op een telefoon staat de zaal bovenaan vast: scroll zo dat de stap eronder begint
          var boven = window.matchMedia('(max-width: 63.99rem)').matches ? sceneFig.offsetHeight + 16 : 80;
          window.scrollTo({ top: doel.getBoundingClientRect().top + window.pageYOffset - boven, behavior: rustigScroll ? 'auto' : 'smooth' });
        });
      });
    }
    if ('IntersectionObserver' in window) {
      // een stap telt als 'bereikt' zodra hij boven het midden van het scherm komt
      var lijnIO = new IntersectionObserver(
        function (items) {
          items.forEach(function (it) {
            var boven = it.boundingClientRect.top < (it.rootBounds ? it.rootBounds.bottom : window.innerHeight);
            it.target.classList.toggle('bereikt', it.isIntersecting || boven);
          });
          if (Date.now() > vastTot) vul();
        },
        { rootMargin: '0px 0px -62% 0px', threshold: 0 }
      );
      stappen.forEach(function (st) {
        lijnIO.observe(st);
      });
    } else {
      stappen.forEach(function (st) {
        st.classList.add('bereikt');
      });
      vul();
    }
    // een stap openen markeert hem ook als bereikt
    alle('.ochtend-meer', ochtend).forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) {
          d.closest('.ochtend-stap').classList.add('bereikt');
          vul();
        }
      });
    });

    var keuzes = document.querySelector('[data-ochtend-keuzes]');
    if (keuzes) {
      keuzes.hidden = false;
      var status = keuzes.querySelector('[data-ochtend-status]');
      var NAAM = { orgel: 'orgel', piano: 'piano', band: 'band' };
      var naKeuze = ochtend.querySelector('[data-na-keuze]');
      if (naKeuze) {
        naKeuze.hidden = false;
        naKeuze.addEventListener('change', function (e) {
          if (zaal) zaal.setAttribute('data-na', e.target.value);
          var antwoord = naKeuze.querySelector('[data-na-antwoord]');
          if (antwoord) antwoord.hidden = false;
        });
      }
      keuzes.addEventListener('change', function (e) {
        var veld = e.target;
        if (zaal) zaal.setAttribute(veld.name === 'muziek' ? 'data-muziek' : 'data-mee', veld.value);
        if (veld.name === 'muziek') {
          var tekst = ochtend.querySelector('[data-muziek-tekst]');
          var tag = ochtend.querySelector('[data-muziek-tag]');
          var w = NAAM[veld.value];
          tekst.textContent = (w && tekst.getAttribute('data-' + w)) || tekst.getAttribute('data-standaard');
          if (tag) {
            tag.hidden = !w;
            tag.textContent = w ? veld.parentNode.textContent.trim() : '';
          }
          if (status) status.textContent = w ? 'De stap ‘Er wordt gezongen’ is aangepast.' : 'De stap ‘Er wordt gezongen’ toont weer de algemene tekst.';
        }
        if (veld.name === 'gezelschap') {
          alle('.ochtend-tip', ochtend).forEach(function (tip) {
            tip.hidden = tip.getAttribute('data-tip') !== veld.value;
          });
          if (status) status.textContent = 'Er staat nu een tip bij ‘Je komt binnen’ en bij ‘En daarna: koffie’.';
        }
      });
    }
  }

  /* ---------- zwevende knop 'Vind een kerk' (alleen telefoon, alleen homepage) ---------- */
  // Zichtbaar na de opening; weg zodra de kerken, het slot of de voet in beeld zijn.
  var zweef = document.querySelector('[data-zweefknop]');
  if (zweef && 'IntersectionObserver' in window) {
    var inBeeld = {};
    var stoppers = alle('.held, .buurt, .slot, .voet');
    var zetZweef = function () {
      var weg = stoppers.some(function (el, n) { return inBeeld[n]; });
      zweef.hidden = weg;
    };
    var zweefIO = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        inBeeld[stoppers.indexOf(it.target)] = it.isIntersecting;
      });
      zetZweef();
    });
    stoppers.forEach(function (el) {
      zweefIO.observe(el);
    });
  }

  /* ---------- exclusieve uitklappers (terugval voor oudere browsers) ---------- */
  alle('details[name]').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      alle('details[name="' + d.getAttribute('name') + '"]').forEach(function (ander) {
        if (ander !== d && ander.open) ander.open = false;
      });
    });
  });
  // Direct openen via #gevoel-moe e.d.
  if (location.hash && /^#gevoel-/.test(location.hash)) {
    var doel = document.getElementById(location.hash.slice(1));
    if (doel && doel.tagName === 'DETAILS') doel.open = true;
  }

  /* ---------- eerlijke volgorde: kerken schudden ---------- */
  alle('[data-schud]').forEach(function (lijst) {
    var kinderen = Array.prototype.slice.call(lijst.children);
    for (var i = kinderen.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = kinderen[i];
      kinderen[i] = kinderen[j];
      kinderen[j] = t;
    }
    kinderen.forEach(function (k) {
      lijst.appendChild(k);
    });
  });

  /* ---------- filter op de kerkenpagina ---------- */
  // Binnen een groep (plaats, traditie) = 'of'; tussen groepen en kenmerken = 'en'.
  var filter = document.querySelector('[data-filter]');
  if (filter) {
    filter.hidden = false;
    var kerken = alle('[data-kerkenlijst] [data-kenmerken]');
    var uitkomst = filter.querySelector('[data-filter-uitkomst]');
    var geen = document.querySelector('[data-geen-resultaat]');
    var pas = function () {
      var gekozen = { plaats: [], traditie: [], kenmerk: [] };
      alle('.filterknop[aria-pressed="true"]', filter).forEach(function (b) {
        gekozen[b.getAttribute('data-groep')].push(b.getAttribute('data-waarde'));
      });
      var aantalGekozen = gekozen.plaats.length + gekozen.traditie.length + gekozen.kenmerk.length;
      var aantal = 0;
      kerken.forEach(function (k) {
        var heeft = (k.getAttribute('data-kenmerken') || '').split(' ');
        var past =
          (!gekozen.plaats.length || gekozen.plaats.indexOf(k.getAttribute('data-plaats')) !== -1) &&
          (!gekozen.traditie.length || gekozen.traditie.indexOf(k.getAttribute('data-traditie')) !== -1) &&
          gekozen.kenmerk.every(function (g) {
            return heeft.indexOf(g) !== -1;
          });
        k.hidden = !past;
        if (past) aantal++;
      });
      if (geen) geen.hidden = aantal !== 0;
      uitkomst.textContent = aantalGekozen ? (aantal === 1 ? '1 kerk past bij je keuze.' : aantal + ' kerken passen bij je keuze.') : '';
    };
    alle('.filterknop', filter).forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        pas();
      });
    });
  }

  /* ---------- in je agenda zetten (.ics, alleen in de browser gemaakt) ---------- */
  var DAGNR = { zondag: 0, maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4, vrijdag: 5, zaterdag: 6 };
  function twee(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function ics(knopEl) {
    var dag = DAGNR[knopEl.getAttribute('data-dag')];
    var tijd = (knopEl.getAttribute('data-tijd') || '10:00').split(':');
    var nu = new Date();
    var d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate(), +tijd[0], +tijd[1]);
    var verschil = (dag - d.getDay() + 7) % 7;
    if (verschil === 0 && d <= nu) verschil = 7;
    d.setDate(d.getDate() + verschil);
    var eind = new Date(d.getTime() + 90 * 60000);
    var f = function (x) {
      return x.getFullYear() + twee(x.getMonth() + 1) + twee(x.getDate()) + 'T' + twee(x.getHours()) + twee(x.getMinutes()) + '00';
    };
    var schoon = function (s) {
      return String(s || '').replace(/[\\;,]/g, function (c) {
        return '\\' + c;
      }).replace(/\r?\n/g, ' ');
    };
    var kerk = knopEl.getAttribute('data-kerk');
    var regels = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//komnaardekerk.nl//NL',
      'BEGIN:VEVENT',
      'UID:' + f(d) + '-' + kerk.replace(/\W+/g, '') + '@komnaardekerk.nl',
      'DTSTAMP:' + f(nu),
      'DTSTART:' + f(d),
      'DTEND:' + f(eind),
      'SUMMARY:' + schoon('Kerkdienst · ' + kerk),
      'LOCATION:' + schoon(knopEl.getAttribute('data-adres')),
      'DESCRIPTION:' + schoon('Je bent welkom, zoals je bent. Meer info: https://komnaardekerk.nl/kerken/'),
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    var blob = new Blob([regels.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kerkdienst-' + kerk.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }
  alle('[data-agenda]').forEach(function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      ics(b);
    });
  });

  /* ---------- contactformulier ---------- */
  var form = document.querySelector('[data-contactformulier]');
  if (form) {
    var start = form.querySelector('[data-starttijd]');
    if (start) start.value = String(Date.now());
    var params = new URLSearchParams(location.search);
    var kerkKeuze = params.get('kerk');
    if (kerkKeuze && form.kerk) {
      var opt = form.kerk.querySelector('option[value="' + kerkKeuze.replace(/[^a-z0-9-]/g, '') + '"]');
      if (opt) form.kerk.value = opt.value;
    }

    var overzicht = form.querySelector('[data-foutoverzicht]');
    var bedankt = document.querySelector('[data-bedankt]');

    var zetFout = function (veld, foutId, tekst) {
      var p = document.getElementById(foutId);
      if (veld) {
        if (tekst) veld.setAttribute('aria-invalid', 'true');
        else veld.removeAttribute('aria-invalid');
      }
      if (p) {
        p.textContent = tekst || '';
        p.hidden = !tekst;
      }
    };

    var controleer = function () {
      var fouten = [];
      var naam = form.voornaam.value.trim();
      var email = form.email.value.trim();
      var tel = form.telefoon.value.trim();
      zetFout(form.voornaam, 'voornaam-fout', '');
      zetFout(form.email, 'bereik-fout', '');
      form.telefoon.removeAttribute('aria-invalid');
      zetFout(form.toestemming, 'toestemming-fout', '');

      if (!naam) {
        zetFout(form.voornaam, 'voornaam-fout', 'Vul je voornaam in, dan weten we hoe we je mogen aanspreken.');
        fouten.push(['voornaam', 'Vul je voornaam in.']);
      }
      if (!email && !tel) {
        zetFout(form.email, 'bereik-fout', 'Vul een e-mailadres of telefoonnummer in, anders kunnen we je niet bereiken.');
        form.telefoon.setAttribute('aria-invalid', 'true');
        fouten.push(['email', 'Vul een e-mailadres of telefoonnummer in.']);
      } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        zetFout(form.email, 'bereik-fout', 'Dit e-mailadres lijkt niet te kloppen. Bijvoorbeeld: naam@voorbeeld.nl');
        fouten.push(['email', 'Controleer je e-mailadres.']);
      } else if (tel && !/^\+?[0-9][0-9 ()-]{7,18}$/.test(tel)) {
        zetFout(form.telefoon, 'bereik-fout', 'Dit telefoonnummer lijkt niet te kloppen. Bijvoorbeeld: 06 12345678');
        fouten.push(['telefoon', 'Controleer je telefoonnummer.']);
      }
      if (!form.toestemming.checked) {
        zetFout(form.toestemming, 'toestemming-fout', 'Zonder je toestemming mogen we je gegevens niet gebruiken.');
        fouten.push(['toestemming', 'Geef toestemming om contact met je op te nemen.']);
      }

      var lijst = overzicht.querySelector('ul');
      lijst.innerHTML = '';
      fouten.forEach(function (f) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + (f[0] === 'toestemming' ? 'toestemming-fout' : f[0]);
        a.textContent = f[1];
        a.addEventListener('click', function (e) {
          e.preventDefault();
          (form[f[0]] || form.voornaam).focus();
        });
        li.appendChild(a);
        lijst.appendChild(li);
      });
      overzicht.hidden = fouten.length === 0;
      if (fouten.length) overzicht.focus();
      return fouten.length === 0;
    };

    var toonBedankt = function (naam, tekst) {
      form.hidden = true;
      bedankt.hidden = false;
      bedankt.querySelector('[data-bedankt-naam]').textContent = naam ? ', ' + naam : '';
      if (tekst) bedankt.querySelector('[data-bedankt-tekst]').textContent = tekst;
      bedankt.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!controleer()) return;
      var naam = form.voornaam.value.trim();
      var status = form.getAttribute('data-status');
      if (status === 'voorbeeld') {
        toonBedankt(naam, 'Dit was een voorbeeld: er is niets verstuurd of opgeslagen. In de echte versie neemt iemand nu contact met je op.');
        return;
      }
      var verstuur = form.querySelector('button[type="submit"]');
      verstuur.disabled = true;
      verstuur.textContent = 'Bezig met versturen…';
      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form))
      })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: false };
          });
        })
        .then(function (antwoord) {
          if (antwoord && antwoord.ok) {
            toonBedankt(naam);
          } else {
            throw new Error((antwoord && antwoord.melding) || 'mislukt');
          }
        })
        .catch(function (fout) {
          verstuur.disabled = false;
          verstuur.textContent = 'Verstuur';
          var lijst = overzicht.querySelector('ul');
          lijst.innerHTML = '';
          var li = document.createElement('li');
          li.textContent =
            fout && fout.message && fout.message !== 'mislukt' && fout.message !== 'Failed to fetch'
              ? fout.message
              : 'Versturen is niet gelukt. Controleer je internetverbinding en probeer het nog eens. Lukt het niet? Neem dan contact op met een van de kerken.';
          lijst.appendChild(li);
          overzicht.hidden = false;
          overzicht.focus();
        });
    });
  }
})();
