/* TerraTech Agro — detector de versión (escritorio / móvil)
   Se carga en el <head> de las 5 páginas de escritorio y de las 5 móviles.
   Si el visitante entra desde un celular, lo lleva a /web-mobile/<misma-pagina>.
   Si entra desde un computador estando en la versión móvil, lo devuelve a la raíz.

   El usuario puede forzar una versión con ?ver=full o ?ver=movil (queda guardada
   en la pestaña, así no se le vuelve a redirigir mientras navega). */
(function () {
  var LIMITE = 820;                 // mismo breakpoint que usa styles.css
  var CARPETA = 'web-mobile/';

  function esMovil() {
    var anchoChico = window.innerWidth <= LIMITE;
    var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var ua = /Android|iPhone|iPod|IEMobile|Opera Mini|BlackBerry/i.test(navigator.userAgent);
    // iPad se declara como Mac: se detecta por el soporte táctil
    var ipad = /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
    return ua || ipad || (anchoChico && tactil);
  }

  var ruta = location.pathname;
  var enMovil = ruta.indexOf('/' + CARPETA) !== -1;
  var pagina = ruta.split('/').pop() || 'index.html';
  if (pagina.indexOf('.html') === -1) pagina = 'index.html';

  // preferencia manual (?ver=full | ?ver=movil), recordada durante la sesión
  var forzado = (location.search.match(/[?&]ver=(full|movil)/) || [])[1];
  try {
    if (forzado) sessionStorage.setItem('tt-ver', forzado);
    else forzado = sessionStorage.getItem('tt-ver');
  } catch (e) { /* modo privado: seguimos sin recordar */ }

  if (forzado === 'full' && !enMovil) return;
  if (forzado === 'movil' && enMovil) return;

  var quiereMovil = forzado ? forzado === 'movil' : esMovil();

  if (quiereMovil && !enMovil) {
    location.replace(CARPETA + pagina + location.hash);
  } else if (!quiereMovil && enMovil) {
    location.replace('../' + pagina + location.hash);
  }
})();
