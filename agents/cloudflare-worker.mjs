// Cloudflare Worker OPCIONAL para cumplir acceptmarkdown.com en hauslineshopni.es.
//
// Por qué existe: la tienda se sirve por GitHub Pages, que es estático puro y NO
// permite negociar por la cabecera `Accept` ni añadir `Vary: Accept`. Poniendo
// este Worker delante del dominio (Cloudflare proxied), un agente que pida
// `Accept: text/markdown` recibe la versión Markdown de la página en la MISMA
// URL, con `Content-Type: text/markdown` y `Vary: Accept`; un navegador normal
// sigue recibiendo el HTML intacto (también con `Vary: Accept` para que las
// cachés no mezclen variantes).
//
// Cómo activarlo (resumen; ver docs/agent-readiness.md):
//   1. Poner el dominio detrás de Cloudflare (DNS proxied) — GitHub Pages sigue
//      siendo el origen.
//   2. Crear un Worker con este archivo y una ruta `hauslineshopni.es/*`.
//   No cambia nada del repo ni del HTML.

import { prefersMarkdown, markdownTwinFor } from './negotiation.mjs';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const wantsMd = prefersMarkdown(request.headers.get('accept'));
    const twin = markdownTwinFor(url.pathname);

    // Agente pide Markdown y la ruta tiene gemelo .md -> servirlo en la misma URL.
    if (wantsMd && twin) {
      const mdUrl = new URL(twin, url.origin);
      const upstream = await fetch(mdUrl.toString(), {
        headers: { 'user-agent': request.headers.get('user-agent') || '' },
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.ok ? 200 : upstream.status,
        headers: {
          'content-type': 'text/markdown; charset=utf-8',
          'vary': 'Accept, Accept-Encoding',
          'cache-control': 'public, max-age=300',
        },
      });
    }

    // Cualquier otra petición: pasa al origen (GitHub Pages) y solo añadimos
    // `Vary: Accept` a las páginas negociables para que las cachés keyeen bien.
    const response = await fetch(request);
    if (twin) {
      const headers = new Headers(response.headers);
      const existingVary = headers.get('vary');
      headers.set(
        'vary',
        existingVary && !/\baccept\b/i.test(existingVary)
          ? `${existingVary}, Accept`
          : existingVary || 'Accept, Accept-Encoding',
      );
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  },
};
