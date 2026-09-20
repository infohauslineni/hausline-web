// ============================================================
//   GENERADOR DE MINI-PÁGINAS PARA COMPARTIR MARCAS (Open Graph)
// ------------------------------------------------------------
//   Crea una página por marca en /m/<slug>/index.html con el
//   LOGO (o la mejor foto) de la marca en las etiquetas Open
//   Graph. Eso es lo que WhatsApp/Facebook leen al pegar el
//   enlace, así el preview muestra la marca (no el logo genérico).
//
//   La página ES la tienda real (index.html) abierta en la
//   sección de esa marca: app.js detecta la ruta /m/<slug>/ al
//   cargar y abre la colección de la marca.
//
//   USO:  node scripts/gen-og-marcas.mjs   (corre DESPUÉS de gen-og.mjs)
//   Correlo cada vez que agregues/cambies marcas o sus logos.
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITIO = 'https://hauslineshopni.es'
const HERO = `${SITIO}/hero-hausline.png` // respaldo si la marca no tiene imagen usable

// --- Cargar el catálogo real desde productos.js (misma fuente que el sitio) ---
const codigoFuente = fs.readFileSync(path.join(raiz, 'productos.js'), 'utf8')
const sandbox = { window: {}, document: { createElement: () => ({}) }, console, Date, Set, Number, String, Math, Array, Object, JSON }
vm.createContext(sandbox)
vm.runInContext(`${codigoFuente}\nthis.__data = { productos, nombreProducto, marcaProducto, normalizarProducto, buscarProducto, logoDeMarca }`, sandbox)
const { productos, marcaProducto, normalizarProducto, buscarProducto, logoDeMarca } = sandbox.__data

// --- Sumar los productos AGREGADOS DESDE EL PANEL (Supabase · catalogo_web) ---
// Igual que gen-og.mjs, para que las marcas nuevas del panel también tengan página.
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
    if (Array.isArray(filas)) {
      for (const fila of filas) {
        const datos = fila && fila.datos ? fila.datos : null
        if (!datos || !datos.codigo) continue
        const existente = buscarProducto(datos.codigo)
        if (existente) {
          const i = productos.indexOf(existente)
          if (i >= 0) productos[i] = normalizarProducto(datos, existente.orden)
        } else {
          productos.push(normalizarProducto(datos, productos.length))
        }
      }
    }
    console.log('✓ Panel (Supabase) leído')
  } else {
    console.log(`⚠ Panel (Supabase) respondió ${r.status}; se generan solo las marcas de productos.js`)
  }
} catch (e) {
  console.log(`⚠ Panel (Supabase) no disponible (${e.message}); se generan solo las marcas de productos.js`)
}

// --- Utilidades (mismas que gen-og.mjs) ---
const escaparHtml = (texto) => String(texto ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const urlImagen = (relativa) => {
  if (!relativa) return HERO
  if (/^https?:\/\//i.test(relativa)) return relativa
  const limpia = String(relativa).replace(/^\.?\//, '')
  return `${SITIO}/${limpia.split('/').map(encodeURIComponent).join('/')}`
}

const FORMATOS_OK = new Set(['jpg', 'jpeg', 'png'])
const formatoSoportado = (ruta) => FORMATOS_OK.has(String(ruta || '').split('.').pop().toLowerCase())
const imagenParaPreview = (relativa) => {
  if (!relativa) return null
  if (/^https?:\/\//i.test(relativa)) return formatoSoportado(relativa) ? relativa : null
  if (formatoSoportado(relativa)) return relativa
  const jpg = relativa.replace(/\.[^.]+$/, '.jpg')
  return fs.existsSync(path.join(raiz, jpg)) ? jpg : null
}

// Slug legible de la marca — DEBE coincidir con slugMarca() de app.js.
const slugMarca = (nombre) => String(nombre || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/&/g, ' ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

// --- Reunir las marcas con al menos un producto (con o sin logo) ---
// Se generan TODAS las marcas con productos para que cualquier ruta /m/<slug>/
// abra bien (banners "ver marca", búsqueda, etc.), no solo las que tienen logo.
const porMarca = new Map()
for (const p of productos) {
  const marca = marcaProducto(p)
  if (!marca) continue
  if (!porMarca.has(marca)) porMarca.set(marca, [])
  porMarca.get(marca).push(p)
}

const INDEX_HTML = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8')

const paginaMarca = (marca, items) => {
  const nombre = `${marca} · HAUSLINE`
  const total = items.length
  const descripcion = `${marca} en HAUSLINE — ${total} ${total === 1 ? 'producto' : 'productos'}. Originales, envíos a toda Nicaragua y al mundo.`
  const canonica = `${SITIO}/m/${slugMarca(marca)}/`

  // Imagen del preview: el LOGO de la marca si sirve; si no, la mejor foto de un producto.
  const relLogo = imagenParaPreview(logoDeMarca(marca))
  let relFoto = null
  if (!relLogo) {
    for (const it of items) { const r = imagenParaPreview(it.imagen); if (r) { relFoto = r; break } }
  }
  const imagenOg = relLogo ? urlImagen(relLogo) : (relFoto ? urlImagen(relFoto) : HERO)

  const esc = escaparHtml
  let html = INDEX_HTML
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(nombre)}</title>`)
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(descripcion)}">`)
  html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="website">`)
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(nombre)}">`)
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(descripcion)}">`)
  html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(imagenOg)}">`)
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(canonica)}">`)
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(nombre)}">`)
  html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(imagenOg)}">`)
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(canonica)}">`)
  // Contenido ÚNICO por marca (SEO): reemplaza el <h1 class="solo-lectores"> genérico por el
  // nombre de la marca + la lista de sus productos, para que Google no la vea como duplicado
  // de la home y la indexe con su propia canónica.
  const nombresProd = items.slice(0, 60).map((it) => it.nombre || it.codigo).filter(Boolean)
  const seoBloque = `<h1 class="solo-lectores">${esc(marca)} en HAUSLINE</h1>`
    + `<section class="solo-lectores"><p>${esc(descripcion)}</p>`
    + (nombresProd.length ? `<ul>${nombresProd.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '')
    + `</section>`
  html = html.replace(/<h1 class="solo-lectores">[\s\S]*?<\/h1>/, seoBloque)
  return html
}

// --- Generar ---
const salida = path.join(raiz, 'm')
fs.rmSync(salida, { recursive: true, force: true })
fs.mkdirSync(salida, { recursive: true })

let generadas = 0
const slugsGenerados = []
const vistos = new Set()
for (const [marca, items] of porMarca) {
  const slug = slugMarca(marca)
  if (!slug || vistos.has(slug)) continue // evita colisiones de slug (marcas casi iguales)
  vistos.add(slug)
  const carpeta = path.join(salida, slug)
  fs.mkdirSync(carpeta, { recursive: true })
  fs.writeFileSync(path.join(carpeta, 'index.html'), paginaMarca(marca, items), 'utf8')
  slugsGenerados.push(slug)
  generadas++
}
console.log(`✓ ${generadas} páginas de marca generadas en /m/`)

// --- Sitemap: añade (idempotente) las URLs /m/<slug>/ a las que ya escribió gen-og.mjs ---
// Corre DESPUÉS de gen-og.mjs. Quita cualquier bloque /m/ previo y agrega los actuales
// antes de </urlset>, para no duplicar si se vuelve a correr.
try {
  const rutaSitemap = path.join(raiz, 'sitemap.xml')
  if (fs.existsSync(rutaSitemap)) {
    let xml = fs.readFileSync(rutaSitemap, 'utf8')
    // Elimina entradas <url>…/m/…</url> anteriores.
    xml = xml.replace(/\s*<url>\s*<loc>[^<]*\/m\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '')
    const hoy = new Date().toISOString().slice(0, 10)
    const bloques = slugsGenerados.map((slug) =>
      `  <url>\n    <loc>${SITIO}/m/${slug}/</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    ).join('\n')
    xml = xml.replace(/\s*<\/urlset>\s*$/, `\n${bloques}\n</urlset>\n`)
    fs.writeFileSync(rutaSitemap, xml, 'utf8')
    console.log(`✓ sitemap.xml: ${slugsGenerados.length} marcas añadidas (URLs /m/)`)
  } else {
    console.log('⚠ sitemap.xml no existe todavía; corré gen-og.mjs primero.')
  }
} catch (e) {
  console.log(`⚠ No se pudo actualizar el sitemap con las marcas (${e.message}).`)
}
