// Lógica de negociación de contenido Markdown (acceptmarkdown.com).
//
// GitHub Pages (donde vive hauslineshopni.es) NO puede negociar por cabecera
// Accept ni fijar `Vary: Accept`. Este módulo implementa esa lógica para poder
// ponerla delante del sitio con un proxy (Cloudflare Worker en
// ./cloudflare-worker.mjs) sin cambiar el HTML. Se exporta aparte para poder
// probarlo con `node --test`.

// Rutas (sin barra final) que tienen gemelo Markdown servido en /<archivo>.md
export const MARKDOWN_ROUTES = {
  '/': '/index.md',
  '/about': '/about.md',
  '/contact': '/contact.md',
  '/devoluciones': '/devoluciones.md',
  '/returns': '/devoluciones.md',
  '/privacy': '/privacy.md',
};

// Parsea un header Accept a una lista [{ type, q }] normalizada.
export function parseAccept(header) {
  return String(header || '')
    .split(',')
    .map((part) => {
      const [type, ...params] = part.trim().split(';').map((s) => s.trim());
      let q = 1;
      for (const p of params) {
        const m = /^q=([0-9.]+)$/i.exec(p);
        if (m) q = parseFloat(m[1]);
      }
      return { type: type.toLowerCase(), q: Number.isNaN(q) ? 1 : q };
    })
    .filter((x) => x.type);
}

function qFor(list, type) {
  let best = -1;
  for (const item of list) if (item.type === type) best = Math.max(best, item.q);
  return best;
}

// ¿El cliente prefiere Markdown sobre HTML? Verdadero solo si text/markdown
// (o text/x-markdown) está aceptado con q>0 y con preferencia >= a la de HTML.
export function prefersMarkdown(acceptHeader) {
  const list = parseAccept(acceptHeader);
  const md = Math.max(qFor(list, 'text/markdown'), qFor(list, 'text/x-markdown'));
  if (md <= 0) return false;
  const htmlEffective = Math.max(
    qFor(list, 'text/html'),
    qFor(list, 'text/*'),
    qFor(list, '*/*'),
  );
  return md >= htmlEffective;
}

// Normaliza el pathname (quita barra final) y devuelve el gemelo .md o null.
export function markdownTwinFor(pathname) {
  const clean = String(pathname || '/').replace(/\/+$/, '') || '/';
  return MARKDOWN_ROUTES[clean] || null;
}
