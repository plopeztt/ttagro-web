export async function onRequest(context) {
  const { request, env } = context;

  // Credenciales: se leen de las variables de entorno de Cloudflare.
  // Nunca deben escribirse en este archivo (el repositorio es publico).
  const USERNAME = env.SITE_USER;
  const PASSWORD = env.SITE_PASS;

  // Si faltan las variables no dejamos pasar a nadie.
  if (!USERNAME || !PASSWORD) {
    return new Response('Configuracion incompleta', { status: 500 });
  }

  const authHeader = request.headers.get('Authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      let decoded = '';
      try {
        decoded = atob(encoded);
      } catch (e) {
        decoded = '';
      }
      // La contrasena puede contener ':', asi que separamos solo en el primero.
      const corte = decoded.indexOf(':');
      if (corte !== -1) {
        const user = decoded.slice(0, corte);
        const pass = decoded.slice(corte + 1);
        if (user === USERNAME && pass === PASSWORD) {
          return context.next(); // Deja pasar a la web
        }
      }
    }
  }

  return new Response('Acceso restringido', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acceso Privado"',
    },
  });
}
