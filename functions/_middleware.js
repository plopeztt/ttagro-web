
export async function onRequest(context) {
  const { request } = context;
  const authHeader = request.headers.get('Authorization');
  
  const USERNAME = 'admin'; 
  const PASSWORD = 'ttagro26'; 

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [user, pass] = decoded.split(':');
      if (user === USERNAME && pass === PASSWORD) {
        return context.next(); // Deja pasar a la web
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
