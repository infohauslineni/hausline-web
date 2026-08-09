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
vm.runInContext(`${codigoFuente}\nthis.__data = { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto }`, sandbox)
const { productos, nombreProducto, descripcionProducto, precioVigente, marcaProducto } = sandbox.__data

// --- Utilidades ---
const escaparHtml = (texto) => String(texto ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// Convierte "imgP/ZAPATOS MEN/.../1.jpeg" en URL absoluta y bien codificada.
const urlImagen = (relativa) => {
  if (!relativa) return HERO
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

// Devuelve la ruta relativa de imagen que sí sirve para el preview, o null.
const imagenParaPreview = (relativa) => {
  if (!relativa) return null
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
<link rel="icon" href="/logo.png" type="image/png">
<!-- Redirección para personas (los scrapers leen las etiquetas de arriba). -->
<meta http-equiv="refresh" content="0; url=${escaparHtml(destino)}">
</head>
<body style="background:#050505;color:#fff;font-family:system-ui,Arial,sans-serif;text-align:center;padding:40px">
<p>Abriendo ${escaparHtml(nombreProducto(producto))}…</p>
<p><a href="${escaparHtml(destino)}" style="color:#b7ff00">Toca aquí si no cargó automáticamente</a></p>
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
