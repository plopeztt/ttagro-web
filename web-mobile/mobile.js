// Menú hamburguesa — web móvil TerraTech
(function () {
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mmenu');
  if (!burger || !menu) return;
  function toggle() {
    var opening = menu.hasAttribute('hidden');
    if (opening) { menu.removeAttribute('hidden'); burger.classList.add('open'); }
    else { menu.setAttribute('hidden', ''); burger.classList.remove('open'); }
    burger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  }
  burger.addEventListener('click', toggle);
})();

// Swipe con el dedo para carruseles — helper reutilizable
// Uso: TT.swipe(elemento, alDeslizarDerecha /*anterior*/, alDeslizarIzquierda /*siguiente*/)
window.TT = window.TT || {};
window.TT.swipe = function (el, onPrev, onNext) {
  if (!el) return;
  var x0 = null, y0 = null, t0 = 0, moved = false;

  el.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    t0 = Date.now(); moved = false;
  }, { passive: true });

  el.addEventListener('touchmove', function (e) {
    if (x0 === null) return;
    var dx = e.touches[0].clientX - x0;
    var dy = e.touches[0].clientY - y0;
    // gesto horizontal: bloqueamos el scroll vertical para que se sienta como carrusel
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      moved = true;
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  function end(e) {
    if (x0 === null) return;
    var touch = (e.changedTouches && e.changedTouches[0]) || null;
    if (touch) {
      var dx = touch.clientX - x0;
      var dy = touch.clientY - y0;
      var dt = Date.now() - t0;
      var rapido = Math.abs(dx) > 30 && dt < 300;
      if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 45 || rapido)) {
        if (dx > 0) { onPrev && onPrev(); } else { onNext && onNext(); }
      }
    }
    x0 = y0 = null;
  }
  el.addEventListener('touchend', end, { passive: true });
  el.addEventListener('touchcancel', function () { x0 = y0 = null; }, { passive: true });

  // evita que el swipe dispare el click de las zonas prev/next
  el.addEventListener('click', function (e) {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
};

// Buscador del sitio (lupa del encabezado) — móvil
(function () {
  var btns = document.querySelectorAll('.search-btn');
  if (!btns.length) return;

  // idioma de la pagina (las versiones en ingles usan <html lang="en">)
  var EN = document.documentElement.lang === 'en';

  var INDICE = EN ? [
    { t: 'Home', d: 'Main page — traceable management for sustainable agriculture', u: 'index-en' },
    { t: 'ESG Pillars — Environment', d: 'Traceable and efficient water use, waste management, sustainable production certified by GLOBALG.A.P.', u: 'index-en#pilares' },
    { t: 'ESG Pillars — Social', d: 'Integrity and ethics, workplace equity, fair compensation, ongoing training, safe infrastructure', u: 'index-en#pilares' },
    { t: 'ESG Pillars — Governance', d: 'Independent board of directors, financial transparency, risk management', u: 'index-en#pilares' },
    { t: 'Experience', d: '+60k hectares: crops, fruit orchards, water management, agricultural innovation, environmental stewardship; KPIs; +25 years', u: 'index-en' },
    { t: 'About Us', d: 'Mission, vision and team of TerraTech Agro', u: 'nosotros-en' },
    { t: 'Team', d: 'Michael Grasty, Tomás Bottiger, Germán Wielandt, Fernando Cisternas, Isabel Quiroz, Pedro Barros, Paula López, Rafael Guerrero', u: 'nosotros-en' },
    { t: 'External Technical Advisors', d: 'Citrus and avocados, walnuts, hydrology', u: 'nosotros-en' },
    { t: 'What We Do', d: '9-step value chain: from the client needs assessment to ongoing operational support', u: 'que-hacemos-en' },
    { t: 'Projects — Sur Andina', d: '500-hectare agribusiness project in Olmos, Peru: citrus orchards and crops', u: 'proyectos-en' },
    { t: 'Contact', d: 'Form: agricultural production, administration and accounting, procurement, public relations', u: 'contacto-en' }
  ] : [
    { t: 'Inicio', d: 'Página principal — gestión trazable para una agricultura sostenible', u: './' },
    { t: 'Pilares ESG — Medio Ambiente', d: 'Uso trazable y eficiente del agua, gestión de residuos, producción limpia GLOBALG.A.P.', u: './#pilares' },
    { t: 'Pilares ESG — Social', d: 'Integridad y ética, equidad laboral, remuneraciones justas, capacitaciones continuas', u: './#pilares' },
    { t: 'Pilares ESG — Gobernanza', d: 'Directorio independiente, transparencia financiera, gestión de riesgos', u: './#pilares' },
    { t: 'Experiencia', d: '+60k hectáreas: cultivos, frutales, gestión hídrica, innovación, impacto ambiental; KPIs; +25 años', u: './' },
    { t: 'Nosotros', d: 'Misión, visión y equipo de TerraTech Agro', u: 'nosotros' },
    { t: 'Equipo', d: 'Michael Grasty, Tomás Bottiger, Germán Wielandt, Fernando Cisternas, Isabel Quiroz, Pedro Barros, Paula López, Rafael Guerrero', u: 'nosotros' },
    { t: 'Asesorías técnicas externas', d: 'Cítricos y paltos, nogales, hidrología', u: 'nosotros' },
    { t: '¿Qué hacemos?', d: 'Cadena de valor en 9 pasos: desde el entendimiento del cliente hasta el soporte permanente de la operación', u: 'que-hacemos' },
    { t: 'Proyectos — Sur Andina', d: 'Proyecto agroindustrial de 500 hectáreas en Olmos, Perú: cítricos y cultivos', u: 'proyectos' },
    { t: 'Contacto', d: 'Formulario: consultas productiva agrícola, administrativa contable, adquisiciones, relaciones públicas', u: 'contacto' }
  ];
  var nrm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

  var css = document.createElement('style');
  css.textContent = [
    '.search-btn{background:none;border:0;padding:0;color:inherit;cursor:pointer;display:flex;align-items:center}',
    '.search-overlay{position:fixed;inset:0;z-index:200;background:rgba(1,48,43,.45);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:none;justify-content:center;align-items:flex-start;padding:90px 18px 24px}',
    '.search-overlay.open{display:flex}',
    '.search-box{width:100%;max-width:394px;background:#fff;border-radius:20px;box-shadow:0 22px 55px rgba(0,0,0,.25);padding:14px;max-height:100%;display:flex;flex-direction:column}',
    '.search-box input{width:100%;font-family:var(--font,sans-serif);font-size:16px;color:#0c2c1e;background:#fff;border:1px solid var(--borde-chip,#c2cfcd);border-radius:12px;padding:12px 14px;outline:none}',
    '.search-box input:focus{border-color:var(--hoja-media,#0D7233)}',
    '.search-results{list-style:none;margin:10px 0 0;padding:0;overflow-y:auto}',
    '.search-results li{border-top:1px solid rgba(194,207,205,.5)}',
    '.search-results li:first-child{border-top:0}',
    '.search-results a{display:block;padding:11px 6px;text-decoration:none}',
    '.sr-title{display:block;font-size:15px;font-weight:500;color:var(--verde-oscuro,#01302b)}',
    '.sr-desc{display:block;margin-top:3px;font-size:12.5px;line-height:1.4;color:#5a6b62;font-weight:300}',
    '.search-empty{padding:12px 6px;font-size:13.5px;color:#5a6b62;font-weight:300}'
  ].join('');
  document.head.appendChild(css);

  var ph = EN ? 'Search the site…' : 'Buscar en el sitio…';
  var ov = document.createElement('div');
  ov.className = 'search-overlay';
  ov.innerHTML = '<div class="search-box"><input type="search" placeholder="' + ph + '" aria-label="' + ph + '"><ul class="search-results"></ul></div>';
  document.body.appendChild(ov);
  var inp = ov.querySelector('input');
  var list = ov.querySelector('.search-results');

  function render(q) {
    var nq = nrm(q.trim());
    list.innerHTML = '';
    if (!nq) return;
    var hits = INDICE.filter(function (e) { return nrm(e.t + ' ' + e.d).indexOf(nq) !== -1; });
    if (!hits.length) {
      var li = document.createElement('li');
      li.className = 'search-empty';
      li.textContent = (EN ? 'No results for «' : 'Sin resultados para «') + q + '»';
      list.appendChild(li);
      return;
    }
    hits.forEach(function (e) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = e.u;
      a.innerHTML = '<span class="sr-title">' + e.t + '</span><span class="sr-desc">' + e.d + '</span>';
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function open() { ov.classList.add('open'); inp.value = ''; list.innerHTML = ''; setTimeout(function () { inp.focus(); }, 60); }
  function close() { ov.classList.remove('open'); }

  Array.prototype.forEach.call(btns, function (b) { b.addEventListener('click', open); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  inp.addEventListener('input', function () { render(inp.value); });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { var first = list.querySelector('a'); if (first) location.href = first.href; }
  });
})();
