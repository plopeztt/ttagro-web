// ==========================================================
// TerraTech Agro — script.js
// Menú móvil, animaciones de entrada y contadores
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // idioma de la página (las versiones en inglés usan <html lang="en">)
  const EN = document.documentElement.lang === 'en';

  // ----- Sólo el nav (píldora) baja con la página; refuerzo visual al hacer scroll -----
  const nav = document.querySelector('.main-nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Menú móvil -----
  const toggle = document.querySelector('.menu-toggle');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Cerrar el menú al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ----- Animaciones de entrada (reveal on scroll) -----
  const revealTargets = document.querySelectorAll(
    '.chip, .enfoque-text, .enfoque-cta, .pilares-figure, .stat, .hero-content h1, .hero-copy, .mv-card, .team-card, .qh-intro, .paso'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  // ----- Contadores +60k y +30: animación rápida al entrar en pantalla -----
  const animateCount = span => {
    const target = parseInt(span.dataset.target, 10);
    const prefix = span.dataset.prefix || '';
    const duration = 1100;
    const start = performance.now();

    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // arranque veloz, frena al final
      span.textContent = prefix + Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.count').forEach(el => {
    el.textContent = (el.dataset.prefix || '') + '0';
    countObserver.observe(el);
  });

  // ----- Pilares ESG (hoja pilares): color de fondo se desvanece + foto aparece -----
  const figure = document.querySelector('.pilares-figure');
  if (figure) {
    const zones = figure.querySelectorAll('.pilar-zone');
    const CLOSE_DELAY = 200;   // sólo cierra si el cursor sale del margen por >200ms
    const MARGIN = 40;         // hitbox invisible de 40px alrededor del bloque expandido
    let closeTimer = null, activeState = null;

    // hoja + su panel de texto, por estado (define el área que mantiene abierta la pestaña)
    const els = {};
    zones.forEach(z => {
      els[z.dataset.state] = { zone: z, panel: figure.querySelector('.state-' + z.dataset.state + ' .ps-text') };
    });

    const HANDOFF = 180;   // ms que el color sólido actúa de placeholder al cambiar de hoja
    let switchTimer = null;

    const applyClass = st => {
      figure.classList.remove(
        'active-ma', 'active-social', 'active-gob',
        'closing-ma', 'closing-social', 'closing-gob'
      );
      if (st) figure.classList.add('active-' + st);
    };
    const cancelClose  = () => { if (closeTimer)  { clearTimeout(closeTimer);  closeTimer  = null; } };
    const cancelSwitch = () => { if (switchTimer) { clearTimeout(switchTimer); switchTimer = null; } };
    // Cierre en dos fases (como el video): 1) las fotos se quedan y el color vuelve
    // fundiéndose sobre ellas (clase closing-*), 2) al estar el verde completo, se
    // retira la clase y el isotipo base retoma sin corte (mismos colores).
    const close = () => {
      cancelSwitch();
      if (activeState) {
        const st = activeState;
        figure.classList.remove('active-' + st);
        figure.classList.add('closing-' + st);
        switchTimer = setTimeout(() => {
          figure.classList.remove('closing-' + st);
          switchTimer = null;
        }, 560);   /* justo cuando la hoja termina de encoger (0.55s): relevo invisible */
      }
      activeState = null;
    };
    const scheduleClose = () => { cancelClose(); closeTimer = setTimeout(close, CLOSE_DELAY); };

    const open = st => {
      // Cambio directo: la nueva hoja reproduce su animación de color (greenDissolve) sola,
      // así que no hace falta handoff. El isotipo queda fuera y no parpadea.
      cancelClose();
      cancelSwitch();
      applyClass(st);
      activeState = st;
    };

    zones.forEach(zone => {
      zone.addEventListener('mouseenter', () => open(zone.dataset.state));
      zone.addEventListener('click', () => {
        const st = zone.dataset.state;
        if (activeState === st) close(); else open(st);
      });
    });

    // Margen de seguridad: mientras el cursor esté dentro del rectángulo que engloba la
    // HOJA + su PANEL, ampliado por MARGIN px, la pestaña sigue abierta. Sólo cierra si sale
    // de ese margen y se mantiene fuera durante CLOSE_DELAY. Evita el cierre abrupto.
    document.addEventListener('mousemove', e => {
      if (!activeState) return;
      const a = els[activeState].zone.getBoundingClientRect();
      const b = els[activeState].panel.getBoundingClientRect();
      const inside =
        e.clientX >= Math.min(a.left, b.left) - MARGIN &&
        e.clientX <= Math.max(a.right, b.right) + MARGIN &&
        e.clientY >= Math.min(a.top, b.top) - MARGIN &&
        e.clientY <= Math.max(a.bottom, b.bottom) + MARGIN;
      if (inside) cancelClose();
      else if (!closeTimer) scheduleClose();
    }, { passive: true });
  }

  // ----- Modal Experiencia: +60k abre el collage; cada categoría, su galería -----
  const GALERIAS = {
    cultivos:   { titulo: EN ? 'Crops' : 'Cultivos',                          fotos: ['cultivos/foto1.webp', 'cultivos/foto2.webp', 'cultivos/foto3.webp'] },
    frutales:   { titulo: EN ? 'Fruit trees' : 'Frutales',                    fotos: ['frutales/foto1.webp', 'frutales/foto2.webp', 'frutales/foto3.webp', 'frutales/foto4.webp', 'frutales/foto5.webp'] },
    riego:      { titulo: EN ? 'Water management' : 'Gestión hídrica',         fotos: ['riego/foto1.webp', 'riego/foto2.webp', 'riego/foto3.webp'] },
    innovacion: { titulo: EN ? 'Agricultural innovation' : 'Innovación agrícola', fotos: ['innovacion/foto1.webp', 'innovacion/foto2.webp'] },
    impacto:    { titulo: EN ? 'Environmental impact' : 'Impacto ambiental',  fotos: ['impacto/foto1.webp', 'impacto/foto2.webp'] }
  };
  const BASE = 'assets/collage/galerias/';

  const modal = document.getElementById('expModal');
  if (modal) {
    const collageView = modal.querySelector('[data-view="collage"]');
    const galleryView = modal.querySelector('[data-view="gallery"]');
    const esquemaView = modal.querySelector('[data-view="esquema"]');
    const logosView = modal.querySelector('[data-view="logos"]');
    const galA = modal.querySelector('.gal-img-a');
    const galB = modal.querySelector('.gal-img-b');
    let activeGal = galA;
    let fotos = [], idx = 0, titulo = '';

    const dialog = modal.querySelector('.exp-dialog');

    const showCollage = () => {
      galleryView.hidden = true;
      esquemaView.hidden = true;
      logosView.hidden = true;
      collageView.hidden = false;
      dialog.classList.remove('in-gallery');
      modal.classList.remove('mode-esquema');
    };

    // ----- Esquema KPIs: carga el SVG y lo revela por partes -----
    const esqContainer = modal.querySelector('.esq-frame');

    // Escala el marco completo al ancho disponible: nada se corta al achicar.
    // 1180 = ancho real del contenido (el texto del punto 05 sobresale del marco de 1084)
    const ESQ_ANCHO = 1180;
    const ESQ_MAX = 1.15;    // con espacio de sobra, se muestra hasta 15% más grande
    const fitEsquema = () => {
      if (!esqContainer) return;
      const disponible = esqContainer.parentElement.clientWidth - 72;   /* aire a los lados */
      if (disponible <= 0) return;
      const s = Math.min(ESQ_MAX, disponible / ESQ_ANCHO);
      esqContainer.style.transform = `scale(${s})`;
      esqContainer.style.marginLeft = `${Math.max(36, Math.round((disponible + 72 - ESQ_ANCHO * s) / 2))}px`;
      esqContainer.style.marginBottom = `${Math.round((s - 1) * 412)}px`;
    };
    window.addEventListener('resize', fitEsquema);

    const playEsquema = () => {
      const svg = esqContainer.querySelector('svg');
      if (!svg) return;
      // 1º: la curva se dibuja
      const curva = svg.querySelector('.esq-curva');
      if (curva && curva.getTotalLength) {
        const L = curva.getTotalLength();
        curva.style.transition = 'none';
        curva.style.strokeDasharray = L;
        curva.style.strokeDashoffset = L;
        requestAnimationFrame(() => {
          curva.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.45, 0, 0.25, 1)';
          curva.style.strokeDashoffset = 0;
        });
      }
      // 2º: título y chip
      [esqContainer.querySelector('.esq-head'), esqContainer.querySelector('.esq-chip')].forEach((el, i) => {
        if (!el) return;
        el.style.transition = 'none';
        el.style.opacity = 0;
        requestAnimationFrame(() => {
          el.style.transition = `opacity 0.6s ease ${(0.15 + i * 0.12).toFixed(2)}s`;
          el.style.opacity = 1;
        });
      });
      // 3º: nodos 01→08, igual que antes: número → línea → texto
      esqContainer.querySelectorAll('.esq-nodo').forEach(nodo => {
        const n = parseInt(nodo.dataset.step, 10);
        const base = 0.55 + (n - 1) * 0.32;
        [
          [nodo.querySelector('.esq-num'), 0],
          [nodo.querySelector('.esq-linea'), 0.16],
          [nodo.querySelector('p'), 0.3]
        ].forEach(([el, off]) => {
          if (!el) return;
          el.style.transition = 'none';
          el.style.opacity = 0;
          requestAnimationFrame(() => {
            el.style.transition = `opacity 0.6s cubic-bezier(0.33, 0, 0.2, 1) ${(base + off).toFixed(2)}s`;
            el.style.opacity = 1;
          });
        });
      });
    };

    const openEsquema = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      collageView.hidden = true;
      galleryView.hidden = true;
      esquemaView.hidden = false;
      modal.classList.add('mode-esquema');
      fitEsquema();
      playEsquema();
    };

    const showFoto = (i, noFade) => {
      idx = (i + fotos.length) % fotos.length;
      const src = BASE + fotos[idx];
      const incoming = activeGal === galA ? galB : galA;
      incoming.src = src;
      incoming.alt = `${titulo} ${idx + 1} de ${fotos.length}`;

      const activate = () => {
        activeGal.classList.remove('is-active');
        incoming.classList.add('is-active');
        activeGal = incoming;
      };

      if (noFade) {                       // empalme sin corte tras la expansión
        incoming.style.transition = 'none';
        activate();
        void incoming.offsetWidth;
        incoming.style.transition = '';
        return;
      }
      // crossfade: espera a que la imagen entrante cargue y recién ahí funde (sin saltos)
      if (incoming.complete && incoming.naturalWidth) {
        activate();
      } else {
        const onLoad = () => { incoming.removeEventListener('load', onLoad); activate(); };
        incoming.addEventListener('load', onLoad);
      }
    };

    const openGallery = (cat, noFade) => {
      const g = GALERIAS[cat];
      if (!g) return;
      fotos = g.fotos;
      titulo = g.titulo;
      modal.querySelector('.gal-title').textContent = titulo;
      collageView.hidden = true;
      galleryView.hidden = false;
      dialog.classList.add('in-gallery');
      showFoto(0, noFade);
    };

    // Expande SOLO la foto (limpia, sin texto) desde la tarjeta clicada hasta llenar
    // el collage; las tarjetas con texto se desvanecen. Al terminar, abre la galería.
    let expanding = false;
    const expandThenGallery = tile => {
      if (expanding) return;
      const cat = tile.dataset.cat;
      const g = GALERIAS[cat];
      if (!g) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { openGallery(cat); return; }
      expanding = true;

      // rectángulos relativos al collage (posición inicial = la tarjeta clicada)
      const cRect = collageView.getBoundingClientRect();
      const tRect = tile.getBoundingClientRect();

      const img = document.createElement('img');
      img.className = 'exp-grow';
      img.alt = '';
      img.style.left = (tRect.left - cRect.left) + 'px';
      img.style.top = (tRect.top - cRect.top) + 'px';
      img.style.width = tRect.width + 'px';
      img.style.height = tRect.height + 'px';
      collageView.appendChild(img);
      collageView.classList.add('expanding');   // desvanece las tarjetas con texto

      let finished = false;
      let fallback;
      const onEnd = e => { if (e.propertyName === 'width') done(); };
      const done = () => {
        if (finished) return;
        finished = true;
        img.removeEventListener('transitionend', onEnd);
        clearTimeout(fallback);
        openGallery(cat, true);   // abre el slider sin fundido: empalme continuo
        img.remove();
        collageView.classList.remove('expanding');
        expanding = false;
      };

      // crece hasta llenar el collage (y el radio empalma con el slider)
      const grow = () => {
        void img.offsetWidth;                    // reflow antes de animar
        img.style.left = '0px';
        img.style.top = '0px';
        img.style.width = cRect.width + 'px';
        img.style.height = cRect.height + 'px';
        img.style.borderRadius = '26px';
        img.addEventListener('transitionend', onEnd);
        fallback = setTimeout(done, 950);
      };

      // arranca a crecer SÓLO cuando la foto está decodificada → animación fluida, sin cortes
      img.src = BASE + g.fotos[0];
      if (img.decode) img.decode().then(grow).catch(grow);
      else if (img.complete && img.naturalWidth) grow();
      else img.addEventListener('load', grow, { once: true });
    };

    // precarga la primera foto al pasar el mouse: al clicar ya está lista y la expansión es fluida
    const preloaded = {};
    const preloadFirst = cat => {
      if (preloaded[cat] || !GALERIAS[cat]) return;
      preloaded[cat] = true;
      new Image().src = BASE + GALERIAS[cat].fotos[0];
    };

    const openModal = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      showCollage();
    };

    const closeModal = () => {
      modal.classList.remove('open');
      modal.classList.remove('mode-esquema');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    };

    // la X vuelve al collage desde una galería; en collage o esquema, cierra
    const smartClose = () => {
      if (!galleryView.hidden) showCollage();
      else closeModal();
    };

    // Todo el recuadro es clickeable: +60k abre el collage; KPIs el esquema; +25 los logos
    const btn60k = document.querySelector('.stat-1');
    if (btn60k) btn60k.addEventListener('click', openModal);
    const btnKpis = document.querySelector('.stat-2');
    if (btnKpis) btnKpis.addEventListener('click', openEsquema);
    const btn30 = document.querySelector('.stat-3');
    if (btn30) btn30.addEventListener('click', () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      collageView.hidden = true;
      galleryView.hidden = true;
      esquemaView.hidden = true;
      logosView.hidden = false;
      modal.classList.remove('mode-esquema');
      dialog.classList.remove('in-gallery');
    });

    modal.querySelector('.exp-close').addEventListener('click', smartClose);
    modal.querySelector('.gal-close').addEventListener('click', showCollage);
    modal.querySelector('.exp-backdrop').addEventListener('click', closeModal);
    modal.querySelectorAll('.tile').forEach(t => {
      t.addEventListener('mouseenter', () => preloadFirst(t.dataset.cat));
      t.addEventListener('click', () => expandThenGallery(t));
    });
    modal.querySelector('.gal-prev').addEventListener('click', () => showFoto(idx - 1));
    modal.querySelector('.gal-next').addEventListener('click', () => showFoto(idx + 1));

    document.addEventListener('keydown', e => {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') smartClose();
      if (galleryView.hidden) return;
      if (e.key === 'ArrowLeft') showFoto(idx - 1);
      if (e.key === 'ArrowRight') showFoto(idx + 1);
    });
  }

  // ----- Proyectos: carrusel de fotos (crossfade fluido con dos capas) -----
  const proySlider = document.querySelector('.proy-slider');
  if (proySlider) {
    const fotos = [
      'assets/proyectos/carrusel-1.webp',
      'assets/proyectos/carrusel-2.webp',
      'assets/proyectos/carrusel-3.webp',
      'assets/proyectos/carrusel-4.webp',
      'assets/proyectos/carrusel-5.webp',
      'assets/proyectos/carrusel-6.webp'
    ];
    const pA = proySlider.querySelector('.proy-a');
    const pB = proySlider.querySelector('.proy-b');
    let activeP = pA, f = 0;

    const showProy = i => {
      f = (i + fotos.length) % fotos.length;
      const incoming = activeP === pA ? pB : pA;
      incoming.src = fotos[f];
      incoming.alt = EN ? `Sur Andina — photo ${f + 1} of ${fotos.length}` : `Sur Andina — foto ${f + 1} de ${fotos.length}`;
      const activate = () => {
        activeP.classList.remove('is-active');
        incoming.classList.add('is-active');
        activeP = incoming;
      };
      if (incoming.complete && incoming.naturalWidth) activate();
      else incoming.addEventListener('load', activate, { once: true });
    };

    fotos.forEach(src => { new Image().src = src; });   // precarga
    proySlider.querySelector('.proy-prev').addEventListener('click', () => showProy(f - 1));
    proySlider.querySelector('.proy-next').addEventListener('click', () => showProy(f + 1));

    // primera foto (capa A ya es la activa)
    pA.src = fotos[0];
    pA.alt = (EN ? 'Sur Andina — photo 1 of ' : 'Sur Andina — foto 1 de ') + fotos.length;
  }

  // ----- Selector de idioma (Esp/Eng) -----
  document.querySelectorAll('.lang-menu').forEach(menu => {
    const btn = menu.querySelector('.lang-btn');
    const opts = menu.querySelector('.lang-options');
    opts.hidden = true;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      opts.hidden = !open;
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', () => {
      menu.classList.remove('open');
      opts.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // ----- Buscador del sitio (lupa del encabezado) -----
  const searchBtns = document.querySelectorAll('.search-btn');
  if (searchBtns.length) {
    const INDICE = EN ? [
      { t: 'Home', d: 'Main page — traceable management for sustainable agriculture', u: 'index-en.html' },
      { t: 'ESG Pillars — Environment', d: 'Traceable and efficient water use, waste management, clean production Global G.A.P.', u: 'index-en.html#que-hacemos' },
      { t: 'ESG Pillars — Social', d: 'Integrity and ethics, labor equity, fair compensation, ongoing training', u: 'index-en.html#que-hacemos' },
      { t: 'ESG Pillars — Governance', d: 'Independent board, financial transparency, risk management', u: 'index-en.html#que-hacemos' },
      { t: 'Experience', d: '+60k hectares: crops, fruit trees, water management, innovation, environmental impact; KPIs; +30 years', u: 'index-en.html#proyectos' },
      { t: 'About us', d: 'Mission, vision and team of TerraTech Agro', u: 'nosotros-en.html' },
      { t: 'Team', d: 'Michael Grasty, Tomás Bottiger, Germán Wielandt, Fernando Cisternas, Isabel Quiroz, Pedro Barros, Paula López, Rafael Guerrero', u: 'nosotros-en.html' },
      { t: 'External technical advisors', d: 'Plums, citrus and avocados, walnuts, hazelnuts, hydrology', u: 'nosotros-en.html' },
      { t: 'What we do?', d: '8-step process: from understanding the client to permanent operational support', u: 'que-hacemos-en.html' },
      { t: 'Projects — Sur Andina', d: '500-hectare agro-industrial project in Olmos, Peru: citrus and crops', u: 'proyectos-en.html' },
      { t: 'Contact', d: 'Form: agricultural production, administration and accounting, procurement, public relations', u: 'contacto-en.html' }
    ] : [
      { t: 'Inicio', d: 'Página principal — gestión trazable para una agricultura sostenible', u: 'index.html' },
      { t: 'Pilares ESG — Medio Ambiente', d: 'Uso trazable y eficiente del agua, gestión de residuos, producción limpia Global G.A.P.', u: 'index.html#que-hacemos' },
      { t: 'Pilares ESG — Social', d: 'Integridad y ética, equidad laboral, remuneraciones justas, capacitaciones continuas', u: 'index.html#que-hacemos' },
      { t: 'Pilares ESG — Gobernanza', d: 'Directorio independiente, transparencia financiera, gestión de riesgos', u: 'index.html#que-hacemos' },
      { t: 'Experiencia', d: '+60k hectáreas: cultivos, frutales, gestión hídrica, innovación, impacto ambiental; KPIs; +30 años', u: 'index.html#proyectos' },
      { t: 'Nosotros', d: 'Misión, visión y equipo de TerraTech Agro', u: 'nosotros.html' },
      { t: 'Equipo', d: 'Michael Grasty, Tomás Bottiger, Germán Wielandt, Fernando Cisternas, Isabel Quiroz, Pedro Barros, Paula López, Rafael Guerrero', u: 'nosotros.html' },
      { t: 'Asesorías técnicas externas', d: 'Ciruelos, cítricos y paltos, nogales, avellanos, hidrología', u: 'nosotros.html' },
      { t: '¿Qué hacemos?', d: 'Proceso en 8 pasos: desde el entendimiento del cliente hasta el soporte permanente de la operación', u: 'que-hacemos.html' },
      { t: 'Proyectos — Sur Andina', d: 'Proyecto agroindustrial de 500 hectáreas en Olmos, Perú: cítricos y cultivos', u: 'proyectos.html' },
      { t: 'Contacto', d: 'Formulario: consultas productiva agrícola, administrativa contable, adquisiciones, relaciones públicas', u: 'contacto.html' }
    ];
    const nrm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const ov = document.createElement('div');
    ov.className = 'search-overlay';
    const phSearch = EN ? 'Search the site…' : 'Buscar en el sitio…';
    ov.innerHTML = '<div class="search-box"><input type="search" placeholder="' + phSearch + '" aria-label="' + phSearch + '"><ul class="search-results"></ul></div>';
    document.body.appendChild(ov);
    const inp = ov.querySelector('input');
    const list = ov.querySelector('.search-results');

    const render = q => {
      const nq = nrm(q.trim());
      list.innerHTML = '';
      if (!nq) return;
      const hits = INDICE.filter(e => nrm(e.t + ' ' + e.d).includes(nq));
      if (!hits.length) {
        const li = document.createElement('li');
        li.className = 'search-empty';
        li.textContent = (EN ? 'No results for «' : 'Sin resultados para «') + q + '»';
        list.appendChild(li);
        return;
      }
      hits.forEach(e => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = e.u;
        a.innerHTML = '<span class="sr-title">' + e.t + '</span><span class="sr-desc">' + e.d + '</span>';
        li.appendChild(a);
        list.appendChild(li);
      });
    };

    const openSearch = () => { ov.classList.add('open'); inp.value = ''; list.innerHTML = ''; setTimeout(() => inp.focus(), 60); };
    const closeSearch = () => ov.classList.remove('open');
    searchBtns.forEach(b => b.addEventListener('click', openSearch));
    ov.addEventListener('click', e => { if (e.target === ov) closeSearch(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) closeSearch(); });
    inp.addEventListener('input', () => render(inp.value));
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const first = list.querySelector('a'); if (first) location.href = first.href; }
    });
  }

  // ----- Contacto: validación básica + mensaje de confirmación -----
  const contactoForm = document.querySelector('.contacto-form');
  if (contactoForm) {
    contactoForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!contactoForm.reportValidity()) return;
      // Aquí se conectará el backend/servicio de correo cuando el sitio esté en línea.
      contactoForm.querySelector('.cf-success').hidden = false;
      contactoForm.querySelector('.cf-enviar').disabled = true;
    });
  }
});
