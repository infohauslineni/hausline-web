// ============================================================
//   GENERADOR DE MINI-PÁGINAS PARA COMPARTIR (Open Graph)
// ------------------------------------------------------------
//   Crea una página por producto en /p/<CODIGO>/index.html con
//   la FOTO, nombre y precio del producto en las etiquetas
//   Open Graph. Eso es lo que WhatsApp/Facebook leen al pegar
//   el enlace, así el preview muestra el producto (no el logo).
//
//   La página redirige al instante al catálogo normal
//   (/?producto=CODIGO), así que para la persona no cambia nada.
//
//   USO:  node scripts/gen-og.mjs
//   Correlo cada vez que agregues o cambies productos.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITIO = 'https://hauslineshopni.es'
const HERO = `${SITIO}/hero-hausline.png` // respaldo si el producto no tiene foto

// --- Cargar el catálogo real desde productos.js (misma fuente que el sitio) ---
const codigoFuente = fs.readFileSync(path.join(raiz, 'productos.js'), 'utf8')
const sandbox = { window: {}, document: { createElement: () => ({}) }, console, Date, Set, Number, String, Math, Array, Object, JSON }
vm.createContext(sandbox)
vm.runInContext(`${codigoFuente}\nthis.__data = { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto, normalizarProducto, buscarProducto, necesitaCotizar, ofertaDe }`, sandbox)
const { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto, normalizarProducto, buscarProducto, necesitaCotizar, ofertaDe } = sandbox.__data

// --- Sumar los productos AGREGADOS DESDE EL PANEL (Supabase · catalogo_web) ---
// El panel guarda en Supabase, no en productos.js, así que esos productos nuevos
// no tenían preview. Aquí los traemos y los mezclamos igual que catalogo-remoto.js
// hace en el sitio, para que TODOS (los del código y los del panel) tengan su /p.
const CATALOGO_PANEL = {
  url: 'https://xgdijumnmaqfirmckugw.supabase.co',
  key: 'sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw'
}
try {
  const r = await fetch(
    `${CATALOGO_PANEL.url}/rest/v1/catalogo_web?select=codigo,datos&activo=eq.true&order=created_at.asc`,
    { headers: { apikey: CATALOGO_PANEL.key, Authorization: 'Bearer ' + CATALOGO_PANEL.key } }
  )
  if (r.ok) {
    const filas = await r.json()
    let agregados = 0
    if (Array.isArray(filas)) {
      for (const fila of filas) {
        const datos = fila && fila.datos ? fila.datos : null
        if (!datos || !datos.codigo) continue
        const existente = buscarProducto(datos.codigo)
        if (existente) {
          // Edición desde el panel: reemplaza conservando su posición.
          const i = productos.indexOf(existente)
          if (i >= 0) productos[i] = normalizarProducto(datos, existente.orden)
        } else {
          // Producto nuevo (solo en el panel): se agrega al final.
          productos.push(normalizarProducto(datos, productos.length))
        }
        agregados++
      }
    }
    console.log(`✓ Panel (Supabase): ${agregados} producto(s) leídos`)
  } else {
    console.log(`⚠ Panel (Supabase) respondió ${r.status}; se generan solo los de productos.js`)
  }
} catch (e) {
  console.log(`⚠ Panel (Supabase) no disponible (${e.message}); se generan solo los de productos.js`)
}

// --- Utilidades ---
const escaparHtml = (texto) => String(texto ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Convierte "imgP/ZAPATOS MEN/.../1.jpeg" en URL absoluta y bien codificada.
// Si ya es una URL absoluta (productos del panel, alojados en Supabase Storage),
// se devuelve tal cual: ya viene lista y no lleva el dominio del sitio delante.
const urlImagen = (relativa) => {
  if (!relativa) return HERO
  if (/^https?:\/\//i.test(relativa)) return relativa
  const limpia = String(relativa).replace(/^\.?\//, '')
  return `${SITIO}/${limpia.split('/').map(encodeURIComponent).join('/')}`
}

const recortar = (texto, max = 160) => {
  const t = String(texto || '').replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

// WhatsApp solo previsualiza jpg/jpeg/png con fiabilidad. Para webp/avif/jfif
// buscamos una versión .jpg al lado (creada con scripts/convert-jpg.mjs). Si no
// hay ninguna imagen usable, se usa el logo como respaldo.
const FORMATOS_OK = new Set(['jpg', 'jpeg', 'png'])
const formatoSoportado = (ruta) => FORMATOS_OK.has(String(ruta || '').split('.').pop().toLowerCase())

// Devuelve la ruta de imagen que sí sirve para el preview, o null.
const imagenParaPreview = (relativa) => {
  if (!relativa) return null
  // URL absoluta (panel/Supabase): sirve si es jpg/jpeg/png; no hay archivo local
  // que revisar, se confía en la extensión (el panel sube en .jpg).
  if (/^https?:\/\//i.test(relativa)) return formatoSoportado(relativa) ? relativa : null
  if (formatoSoportado(relativa)) return relativa
  const jpg = relativa.replace(/\.[^.]+$/, '.jpg')
  return fs.existsSync(path.join(raiz, jpg)) ? jpg : null
}

// index.html completo = la TIENDA funcional. Lo usamos como base de cada
// /p/CODIGO para que la página SEA la tienda real abierta en ese producto
// (tallas seleccionables, tipo de envío, "Encargar" → tracking, carrito…), y
// solo le cambiamos el <head> a los datos del producto para que Google la
// indexe. app.js detecta la ruta /p/CODIGO al cargar y abre el producto.
const INDEX_HTML = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8')

const paginaProducto = (producto) => {
  const codigo = String(producto.codigo)
  const nombreBase = nombreProducto(producto)
  const nombre = `${nombreBase} · HAUSLINE`
  const marca = marcaProducto(producto)
  const cotizar = typeof necesitaCotizar === 'function' ? necesitaCotizar(producto) : !(Number(producto.precio) > 0)
  const precio = precioVigente(producto, false)
  const descripcion = recortar(descripcionProducto(producto) || `${marca} · Envíos a toda Nicaragua`)

  // La página vive en /p/CODIGO/ y es su propia canónica (indexable). El GitHub
  // Pages sirve el index.html de la carpeta con 200 SOLO con la barra final; sin
  // ella hace 301 a la versión con barra (eso es lo que Google marcaba como
  // "Página con redirección"). Por eso la canónica lleva la barra final.
  const canonica = `${SITIO}/p/${encodeURIComponent(codigo)}/`

  // Imagen para el preview de WhatsApp/Facebook (jpg/png segura).
  const relPreview = imagenParaPreview(producto.imagen)
  const imagenOg = relPreview ? urlImagen(relPreview) : HERO
  const fotos = (Array.isArray(producto.imagenes) && producto.imagenes.length ? producto.imagenes : [producto.imagen])
    .filter(Boolean).map(urlImagen)
  const galeria = fotos.length ? fotos : [imagenOg]

  // --- Datos estructurados (Schema.org Product) para Google ---
  const productoLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: nombreBase,
    image: galeria,
    description: descripcion,
    sku: codigo,
    brand: { '@type': 'Brand', name: marca || 'HAUSLINE' },
    url: canonica,
  }
  if (!cotizar && precio > 0) {
    productoLd.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(precio),
      availability: 'https://schema.org/InStock',
      url: canonica,
      seller: { '@type': 'Organization', name: 'HAUSLINE' },
    }
  }
  const jsonLd = JSON.stringify(productoLd).replace(/</g, '\\u003c')

  const esc = escaparHtml
  // Partimos del index.html real y le ponemos el <head> específico del producto.
  let html = INDEX_HTML
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(nombre)}</title>`)
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(descripcion)}">`)
  html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="product">`)
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(nombre)}">`)
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(descripcion)}">`)
  html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(imagenOg)}">`)
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonica)}">`)
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(nombre)}">`)
  html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(imagenOg)}">`)
  // Canónica del producto + JSON-LD Product, justo antes de cerrar el <head>.
  html = html.replace(/<\/head>/, `<link rel="canonical" href="${esc(canonica)}">\n<script type="application/ld+json">${jsonLd}</script>\n</head>`)
  return html
}

// --- Generar ---
const salida = path.join(raiz, 'p')
fs.rmSync(salida, { recursive: true, force: true })
fs.mkdirSync(salida, { recursive: true })

let generadas = 0
let respaldoLogo = 0
const codigosGenerados = []
for (const producto of productos) {
  if (!producto.codigo) continue
  const carpeta = path.join(salida, String(producto.codigo))
  fs.mkdirSync(carpeta, { recursive: true })
  fs.writeFileSync(path.join(carpeta, 'index.html'), paginaProducto(producto), 'utf8')
  if (!imagenParaPreview(producto.imagen)) respaldoLogo++
  codigosGenerados.push(String(producto.codigo))
  generadas++
}

console.log(`✓ ${generadas} páginas generadas en /p/`)
if (respaldoLogo) console.log(`⚠ ${respaldoLogo} producto(s) con foto en webp/avif/jfif usan el logo como respaldo (WhatsApp no previsualiza esos formatos).`)

// --- Sitemap: apunta a las páginas REALES /p/CODIGO (no a ?producto=) ---
// Se regenera aquí para que SIEMPRE coincida con las páginas creadas arriba.
// Antes el sitemap listaba URLs ?producto= (JavaScript) que Google no indexaba.
const hoy = new Date().toISOString().slice(0, 10)
const urlSitemap = (loc, prioridad) =>
  `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${prioridad}</priority>\n  </url>`
const entradas = [urlSitemap(`${SITIO}/`, '1.0')]
for (const codigo of codigosGenerados) {
  // Barra final: la URL que devuelve 200 en GitHub Pages (sin ella hay 301). Así
  // el sitemap no lista URLs que redirigen y Google puede indexarlas.
  const loc = `${SITIO}/p/${codigo.split('/').map(encodeURIComponent).join('/')}/`
  entradas.push(urlSitemap(loc, '0.8'))
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas.join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(raiz, 'sitemap.xml'), sitemap, 'utf8')
console.log(`✓ sitemap.xml regenerado con ${codigosGenerados.length} productos (URLs /p/)`)
