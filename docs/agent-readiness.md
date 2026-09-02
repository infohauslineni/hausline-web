# Agent readiness — hauslineshopni.es

Notas sobre cómo la tienda queda lista para agentes/LLM (auditoría "Is Agentic" de
Ora). El sitio se sirve por **GitHub Pages** (estático puro): esto define qué se
puede resolver dentro del repo y qué necesita infraestructura extra.

## Qué se implementó en el repo (estático, se despliega con push a `main`)

| # | Ítem auditoría | Estado | Cómo |
|---|----------------|--------|------|
| 1 | 404 amigable para agentes | ✅ | `404.html` da **HTTP 404 real** (GitHub Pages) + cuerpo Markdown con enlaces a `/`, `/about`, `/contact`, `/sitemap.xml`, `/llms.txt`. `noindex`. |
| 4 | Instrucción de agente / when-to-use | ✅ | `llms.txt` con sección **"Cuándo usar HAUSLINE (when to use)"** + casos de uso + cómo contactar. |
| 5 | Organization schema completo | ✅ | JSON-LD en `index.html`: `@type ["Organization","OnlineStore"]` con `contactPoint` (email + teléfono + contactType) y `address` (`PostalAddress`). |
| 6 | JSON-LD con tipo de identidad | ✅ | Mismo bloque Organization + `FAQPage`. |
| 7 | Páginas de confianza | ✅ | `/about`, `/contact`, **`/privacy`** y **`/devoluciones`** (+ alias inglés `/returns`) con contenido real (>500 chars) y `canonical`. |
| + | Política de devoluciones | ✅ | Antes estaba escondida en Términos §Garantía. Ahora: sección propia `terminos.html#devoluciones`, página `/devoluciones` (+ `/returns`), gemelo `/devoluciones.md`, entrada en el FAQ visible **y** en el `FAQPage` JSON-LD, y enlaces en `llms.txt` y el footer. **No cambia los términos** (ventas por encargo finales; garantía 24 h por defecto de fábrica). |
| 2 | Negociación Markdown (acceptmarkdown) | ⚠️ parcial | Gemelos `.md` (`/index.md`, `/about.md`, `/contact.md`, `/privacy.md`) + `<link rel="alternate" type="text/markdown">` + enlaces en `llms.txt`. **La negociación real por cabecera `Accept` necesita un proxy** (ver abajo). |

## Ítem 2 — por qué falta un paso y cómo cerrarlo

acceptmarkdown.com exige que la **misma URL** devuelva `Content-Type: text/markdown`
cuando el cliente manda `Accept: text/markdown`, y que la respuesta lleve
`Vary: Accept`. **GitHub Pages no permite negociar por `Accept` ni fijar
cabeceras propias**, así que esto no se puede resolver solo con archivos.

La lógica ya está escrita y probada en `agents/negotiation.mjs`, lista para
ponerla delante del sitio sin tocar el HTML:

- **Opción A — Cloudflare Worker (recomendada, gratis):** poner el dominio detrás
  de Cloudflare (DNS *proxied*; GitHub Pages sigue de origen) y publicar
  `agents/cloudflare-worker.mjs` con ruta `hauslineshopni.es/*`. Sirve el gemelo
  `.md` en la misma URL con `text/markdown` + `Vary: Accept`, y añade `Vary:
  Accept` a las páginas negociables. Requiere credenciales/DNS del dueño.
- **Opción B — mover el hosting a Vercel/Netlify** y usar una función/middleware
  equivalente. Cambia el flujo de deploy actual (push a `main`).

Verificación una vez activo el proxy:

```bash
curl -s -D - -o /dev/null -H "Accept: text/markdown" https://hauslineshopni.es/ | grep -iE "content-type|vary"
# esperado: content-type: text/markdown; charset=utf-8   y   vary: Accept, Accept-Encoding
```

## Ítem 3 — descubrimiento de marca (fuera del código)

"HAUSLINE" es un término genérico y la auditoría no encontró el dominio en la
primera página. No se arregla desde el repo; recomendaciones para el dueño:

- **NAP consistente** (nombre, dirección, teléfono) en Google Business Profile,
  Instagram, TikTok, Facebook — todos enlazando a `https://hauslineshopni.es`.
  Ya están declarados en `sameAs` del JSON-LD.
- Conseguir menciones/enlaces de prensa o directorios locales al dominio canónico.
- Evitar cadenas de redirección que oculten el dominio apex.
- Considerar reforzar la marca como "HAUSLINE King of Shoes Nicaragua" en títulos
  y perfiles para desambiguar.

## Pruebas

`npm test` (usa `node --test`, sin dependencias). Cubre la lógica de negociación
y que los archivos mantengan JSON-LD de identidad, `llms.txt` con when-to-use,
404 con cuerpo Markdown, páginas de confianza y gemelos `.md`.

## Recordatorio de mantenimiento

- `sitemap.xml` se regenera desde `scripts/gen-og.mjs` (~línea 206). Cualquier URL
  fija nueva debe agregarse ahí o el cron de `previews.yml` la borra.
- Si cambia el texto de una página, actualizá también su gemelo `.md`
  (`npm test` verifica que existan y no estén vacíos, no que coincidan palabra a
  palabra).
