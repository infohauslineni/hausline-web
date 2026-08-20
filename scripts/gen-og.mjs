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
vm.runInContext(`${codigoFuente}\nthis.__data = { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto, normalizarProducto, buscarProducto }`, sandbox)
const { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto, normalizarProducto, buscarProducto } = sandbox.__data

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

// --- Plantilla de la mini-página ---
const paginaProducto = (producto) => {
  const codigo = String(producto.codigo)
  const nombre = `${nombreProducto(producto)} · HAUSLINE`
  const precio = precioVigente(producto, false)
  const marca = marcaProducto(producto)
  const descripcion = recortar(descripcionProducto(producto) || `${marca} · US$ ${precio} · Envíos a toda Nicaragua`)
  const relPreview = imagenParaPreview(producto.imagen)
  const imagen = relPreview ? urlImagen(relPreview) : HERO
  const destino = `/?producto=${encodeURIComponent(codigo)}`
  const canonica = `${SITIO}${destino}`

  // --- Datos estructurados (Schema.org Product) para Google ---
  // Hace que el producto sea elegible para "resultados enriquecidos": foto,
  // precio, disponibilidad y marca directo en la búsqueda de Google.
  const productoLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: nombreProducto(producto),
    image: [imagen],
    description: descripcion,
    sku: codigo,
    brand: { '@type': 'Brand', name: marca || 'HAUSLINE' },
    url: canonica,
  }
  // Solo declaramos precio si el producto lo tiene (los de "cotizar" no).
  if (precio > 0) {
    productoLd.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: String(precio),
      availability: 'https://schema.org/InStock',
      url: canonica,
      seller: { '@type': 'Organization', name: 'HAUSLINE' },
    }
  }
  // < evita que un "</script>" dentro del texto rompa la etiqueta.
  const jsonLd = JSON.stringify(productoLd).replace(/</g, '\\u003c')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escaparHtml(nombre)}</title>
<meta name="description" content="${escaparHtml(descripcion)}">
<link rel="canonical" href="${escaparHtml(canonica)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="HAUSLINE">
<meta property="og:title" content="${escaparHtml(nombre)}">
<meta property="og:description" content="${escaparHtml(descripcion)}">
<meta property="og:image" content="${escaparHtml(imagen)}">
<meta property="og:image:alt" content="${escaparHtml(nombreProducto(producto))}">
<meta property="og:url" content="${escaparHtml(canonica)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escaparHtml(nombre)}">
<meta name="twitter:description" content="${escaparHtml(descripcion)}">
<meta name="twitter:image" content="${escaparHtml(imagen)}">
<script type="application/ld+json">${jsonLd}</script>
<link rel="icon" href="/logo.png" type="image/png">
<!-- Sin meta-refresh en el <head>: los crawlers (WhatsApp/Facebook) leen las
     etiquetas de arriba con la FOTO. La redirección de personas se hace con
     JavaScript (los crawlers no lo ejecutan) y, para navegadores sin JS, con
     un meta-refresh dentro de <noscript>. Así el preview nunca cae en la
     imagen genérica del sitio. -->
</head>
<body style="background:#050505;color:#fff;font-family:system-ui,Arial,sans-serif;text-align:center;padding:40px">
<p>Abriendo ${escaparHtml(nombreProducto(producto))}…</p>
<p><a href="${escaparHtml(destino)}" style="color:#b7ff00">Toca aquí si no cargó automáticamente</a></p>
<noscript><meta http-equiv="refresh" content="0; url=${escaparHtml(destino)}"></noscript>
<script>location.replace(${JSON.stringify(destino)});</script>
</body>
</html>
`
}

// --- Generar ---
const salida = path.join(raiz, 'p')
fs.rmSync(salida, { recursive: true, force: true })
fs.mkdirSync(salida, { recursive: true })

let generadas = 0
let respaldoLogo = 0
for (const producto of productos) {
  if (!producto.codigo) continue
  const carpeta = path.join(salida, String(producto.codigo))
  fs.mkdirSync(carpeta, { recursive: true })
  fs.writeFileSync(path.join(carpeta, 'index.html'), paginaProducto(producto), 'utf8')
  if (!imagenParaPreview(producto.imagen)) respaldoLogo++
  generadas++
}

console.log(`✓ ${generadas} páginas generadas en /p/`)
if (respaldoLogo) console.log(`⚠ ${respaldoLogo} producto(s) con foto en webp/avif/jfif usan el logo como respaldo (WhatsApp no previsualiza esos formatos).`)
