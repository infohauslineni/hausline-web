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

// --- Plantilla de la página de producto (REAL e indexable) ---
// Antes era un stub que redirigía al instante a /?producto= (JavaScript). Google
// no indexaba eso ("Discovered - currently not indexed"). Ahora /p/CODIGO es una
// página estática de verdad: foto, nombre, marca, precio, descripción y tallas
// en el HTML, auto-canónica y con botón de compra. Google la puede leer sin JS.
const paginaProducto = (producto) => {
  const codigo = String(producto.codigo)
  const nombreBase = nombreProducto(producto)
  const nombre = `${nombreBase} · HAUSLINE`
  const marca = marcaProducto(producto)
  const cotizar = typeof necesitaCotizar === 'function' ? necesitaCotizar(producto) : !(Number(producto.precio) > 0)
  const precio = precioVigente(producto, false)
  const oferta = typeof ofertaDe === 'function' ? ofertaDe(producto) : null
  const descripcion = recortar(descripcionProducto(producto) || `${marca} · Envíos a toda Nicaragua`)

  // La página vive en /p/CODIGO y es su propia canónica (indexable).
  const canonica = `${SITIO}/p/${encodeURIComponent(codigo)}`
  const tienda = `/?producto=${encodeURIComponent(codigo)}` // vista completa del catálogo

  // Imagen para el preview de WhatsApp/Facebook (jpg/png segura).
  const relPreview = imagenParaPreview(producto.imagen)
  const imagenOg = relPreview ? urlImagen(relPreview) : HERO
  // Galería visible: todas las fotos del producto (aquí sí sirven webp/jfif).
  const fotos = (Array.isArray(producto.imagenes) && producto.imagenes.length ? producto.imagenes : [producto.imagen])
    .filter(Boolean).map(urlImagen)
  const galeria = fotos.length ? fotos : [imagenOg]

  // Fotos en JSON para el visor (flechas + miniaturas). El \\u003c evita que un
  // "</script>" dentro de una URL rompa la etiqueta.
  const fotosJson = JSON.stringify(galeria).replace(/</g, '\\u003c')

  // Precio visible.
  const precioHtml = cotizar
    ? `<span class="precio-consultar">Precio a consultar</span>`
    : oferta
      ? `<span class="precio">US$ ${precio}</span> <span class="precio-antes">US$ ${Number(producto.precio)}</span>`
      : `<span class="precio">US$ ${precio}</span>`

  const tallasHtml = Array.isArray(producto.tallas) && producto.tallas.length
    ? `<div class="bloque"><h2>Tallas disponibles</h2><div class="tallas">${producto.tallas.map((t) => `<span class="talla">${escaparHtml(t)}</span>`).join('')}</div></div>`
    : ''

  const categoriaHtml = producto.categoria
    ? `<p class="meta">${escaparHtml(producto.categoria)}${producto.subcategoria ? ` · ${escaparHtml(producto.subcategoria)}` : ''}</p>`
    : ''

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

  // "Encargar" lleva al producto en la tienda, donde el flujo real de encargo
  // (abrirEncargo → crear_solicitud_publica) registra el pedido en el tracking.
  const ctaLabel = cotizar ? 'Cotizar' : 'Encargar'

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escaparHtml(nombre)}</title>
<meta name="description" content="${escaparHtml(descripcion)}">
<link rel="canonical" href="${escaparHtml(canonica)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="HAUSLINE">
<meta property="og:title" content="${escaparHtml(nombre)}">
<meta property="og:description" content="${escaparHtml(descripcion)}">
<meta property="og:image" content="${escaparHtml(imagenOg)}">
<meta property="og:image:alt" content="${escaparHtml(nombreBase)}">
<meta property="og:url" content="${escaparHtml(canonica)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escaparHtml(nombre)}">
<meta name="twitter:description" content="${escaparHtml(descripcion)}">
<meta name="twitter:image" content="${escaparHtml(imagenOg)}">
<script type="application/ld+json">${jsonLd}</script>
<link rel="icon" href="/logo.png" type="image/png">
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#050505;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;line-height:1.5}
  a{color:inherit}
  .top{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #1a1a1a}
  .logo{font-weight:800;letter-spacing:.5px;font-size:20px;text-decoration:none}
  .logo span{color:#b7ff00}
  .top .volver{font-size:13px;color:#9a9a9a;text-decoration:none}
  .wrap{max-width:980px;margin:0 auto;padding:24px 20px 60px;display:grid;gap:28px}
  @media(min-width:820px){.wrap{grid-template-columns:1fr 1fr;align-items:start}}
  .fotos{display:grid;gap:10px;align-self:start}
  .galeria{position:relative}
  .galeria .principal{display:block;width:100%;max-height:68vh;aspect-ratio:1;object-fit:contain;background:#0d0d0d;border-radius:16px}
  .cerrar{position:absolute;top:12px;right:12px;z-index:3;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,.55);color:#fff;font-size:18px;cursor:pointer;display:grid;place-items:center;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
  .flecha{position:absolute;top:50%;transform:translateY(-50%);z-index:2;width:42px;height:42px;border-radius:50%;border:none;background:rgba(0,0,0,.5);color:#fff;font-size:26px;line-height:0;cursor:pointer;display:grid;place-items:center;padding-bottom:4px}
  .flecha.izq{left:10px}
  .flecha.der{right:10px}
  .miniaturas{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .miniaturas img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;background:#111;cursor:pointer;border:1px solid #1c1c1c}
  .miniaturas img.activa{border-color:#b7ff00}
  .info h1{font-size:26px;margin:0 0 4px}
  .marca{color:#b7ff00;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:.5px;margin:0 0 14px}
  .precio{font-size:30px;font-weight:800}
  .precio-antes{color:#7a7a7a;text-decoration:line-through;font-size:18px;margin-left:8px}
  .precio-consultar{font-size:22px;font-weight:700;color:#b7ff00}
  .desc{color:#cfcfcf;margin:16px 0}
  .meta{color:#8a8a8a;font-size:13px;margin:0 0 10px}
  .bloque{margin-top:18px}
  .bloque h2{font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:#9a9a9a;margin:0 0 10px}
  .tallas{display:flex;flex-wrap:wrap;gap:8px}
  .talla{border:1px solid #2a2a2a;border-radius:10px;padding:8px 12px;font-size:14px;min-width:44px;text-align:center}
  .acciones{display:flex;flex-direction:column;gap:10px;margin-top:26px}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:16px 20px;border-radius:14px;font-weight:800;text-decoration:none;font-size:16px}
  .btn-primario{background:#b7ff00;color:#0a0a0a}
  .btn-ghost{border:1px solid #2a2a2a;color:#fff}
  .nota{color:#7a7a7a;font-size:12px;text-align:center;margin-top:8px}
</style>
</head>
<body>
<header class="top">
  <a class="logo" href="/">HAUS<span>LINE</span></a>
  <a class="volver" href="/">← Ver todo el catálogo</a>
</header>
<main class="wrap">
  <div class="fotos">
    <div class="galeria">
      <button class="cerrar" id="btnCerrar" type="button" aria-label="Volver">✕</button>
      <img class="principal" id="fotoPrincipal" src="${escaparHtml(galeria[0])}" alt="${escaparHtml(nombreBase)}">
      ${galeria.length > 1 ? `<button class="flecha izq" id="prevFoto" type="button" aria-label="Foto anterior">‹</button><button class="flecha der" id="nextFoto" type="button" aria-label="Foto siguiente">›</button>` : ''}
    </div>
    ${galeria.length > 1 ? `<div class="miniaturas">${galeria.slice(0, 6).map((src, i) => `<img data-full="${escaparHtml(src)}"${i === 0 ? ' class="activa"' : ''} src="${escaparHtml(src)}" alt="${escaparHtml(nombreBase)} — foto ${i + 1}" loading="lazy">`).join('')}</div>` : ''}
  </div>
  <div class="info">
    <p class="marca">${escaparHtml(marca)}</p>
    <h1>${escaparHtml(nombreBase)}</h1>
    ${categoriaHtml}
    <div>${precioHtml}</div>
    ${descripcion ? `<p class="desc">${escaparHtml(descripcion)}</p>` : ''}
    ${tallasHtml}
    <div class="acciones">
      <a class="btn btn-primario" href="${escaparHtml(tienda)}">${ctaLabel}</a>
    </div>
    <p class="nota">Código ${escaparHtml(codigo)} · Envíos a toda Nicaragua</p>
  </div>
</main>
<script>
  // Visor de fotos: flechas ‹ ›, miniaturas y X para regresar. (Mejora visual;
  // Google ya leyó todas las fotos del HTML/JSON-LD, así que no afecta el SEO.)
  var fotos = ${fotosJson};
  var idx = 0;
  var principal = document.getElementById('fotoPrincipal');
  var minis = [].slice.call(document.querySelectorAll('.miniaturas img'));
  function mostrar(i) {
    idx = (i + fotos.length) % fotos.length;
    principal.src = fotos[idx];
    minis.forEach(function (m, k) { m.classList.toggle('activa', k === idx); });
  }
  minis.forEach(function (m, k) { m.addEventListener('click', function () { mostrar(k); }); });
  var prev = document.getElementById('prevFoto'), next = document.getElementById('nextFoto');
  if (prev) prev.addEventListener('click', function () { mostrar(idx - 1); });
  if (next) next.addEventListener('click', function () { mostrar(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') mostrar(idx - 1);
    else if (e.key === 'ArrowRight') mostrar(idx + 1);
  });
  document.getElementById('btnCerrar').addEventListener('click', function () {
    if (history.length > 1) history.back(); else location.href = '/';
  });
</script>
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
  const loc = `${SITIO}/p/${codigo.split('/').map(encodeURIComponent).join('/')}`
  entradas.push(urlSitemap(loc, '0.8'))
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas.join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(raiz, 'sitemap.xml'), sitemap, 'utf8')
console.log(`✓ sitemap.xml regenerado con ${codigosGenerados.length} productos (URLs /p/)`)
