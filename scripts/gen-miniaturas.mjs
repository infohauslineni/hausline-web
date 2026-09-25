// Miniaturas para las TARJETAS del catálogo (y carrito/buscador).
// La tarjeta se ve a ~200-300px, pero cargaba la foto completa (1600px, ~140KB).
// Esto genera imgM/<misma ruta que imgP>.webp a 640px (~30-40KB) SOLO de la foto
// principal de cada producto. La vista del producto sigue usando la foto completa.
//
// app.js usa miniatura(ruta) → si la mini no existe, el <img> cae solo a la original
// (listener de error), así que un producto nuevo sin mini nunca queda roto.
//
// Correr: node scripts/gen-miniaturas.mjs   (también lo corre el workflow previews.yml)
// Incremental: solo regenera si la original es más nueva que la mini.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import sharp from 'sharp'

sharp.cache(false)
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const ANCHO = 640
const CALIDAD = 72

const ctx = { console }
vm.createContext(ctx)
vm.runInContext(fs.readFileSync(path.join(raiz, 'productos.js'), 'utf8') + ';this.__p = productos; this.__m = marcasCatalogo', ctx)

// Misma regla que miniatura() en app.js: imgP/… → imgM/… con extensión .webp
const rutaMini = (rel) => rel.replace(/^imgP\//, 'imgM/').replace(/\.[^./]+$/, '.webp')

const rutas = new Set()
for (const p of ctx.__p) {
  const r = String(p.imagen || '').replace(/^\.?\//, '')
  if (/^imgP\//.test(r)) rutas.add(r)
}
// Fotos de "entregas a clientes" del inicio (imgP/clientes).
const dirClientes = path.join(raiz, 'imgP', 'clientes')
if (fs.existsSync(dirClientes)) {
  for (const f of fs.readdirSync(dirClientes)) if (/\.(jpe?g|png|webp|avif|jfif)$/i.test(f)) rutas.add(`imgP/clientes/${f}`)
}
// Portadas de los mosaicos de marca del inicio (misma foto de tarjeta o una propia).
for (const m of ctx.__m || []) {
  const r = String((m && (m.portada || m.logo || m.tarjeta)) || '').replace(/^\.?\//, '')
  if (/^imgP\//.test(r)) rutas.add(r)
}

let hechas = 0, saltadas = 0, faltan = 0, antes = 0, despues = 0

// Productos subidos desde el PANEL: su foto vive en Supabase Storage (bucket catalogo).
// Se descarga y se guarda en imgM/panel/<ruta del bucket>.webp — misma regla que
// miniatura() en app.js. El workflow corre cada 15 min, así que los nuevos la reciben solos.
const STORAGE = 'https://xgdijumnmaqfirmckugw.supabase.co/storage/v1/object/public/catalogo/'
const KEY = 'sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw'
try {
  const r = await fetch('https://xgdijumnmaqfirmckugw.supabase.co/rest/v1/catalogo_web?select=datos&activo=eq.true',
    { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
  const filas = r.ok ? await r.json() : []
  for (const f of filas) {
    const url = String((f.datos && f.datos.imagen) || '')
    if (!url.startsWith(STORAGE)) continue
    const rel = decodeURIComponent(url.slice(STORAGE.length).split('?')[0])
    if (!rel || rel.startsWith('banners/')) continue
    const destino = path.join(raiz, 'imgM', 'panel', rel.replace(/\.[^./]+$/, '.webp'))
    if (fs.existsSync(destino)) { saltadas++; continue }   // el panel sube un nombre nuevo por foto
    try {
      const img = await fetch(url)
      if (!img.ok) { faltan++; continue }
      const orig = Buffer.from(await img.arrayBuffer())
      const buf = await sharp(orig).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: CALIDAD }).toBuffer()
      fs.mkdirSync(path.dirname(destino), { recursive: true })
      fs.writeFileSync(destino, buf)
      antes += orig.length; despues += buf.length; hechas++
    } catch (e) { console.log(`⚠ panel ${rel}: ${e.message}`) }
  }
} catch (e) {
  console.log(`⚠ Panel no disponible (${e.message}); sin miniaturas del panel`)
}
for (const rel of rutas) {
  const origen = path.join(raiz, rel)
  const destino = path.join(raiz, rutaMini(rel))
  if (!fs.existsSync(origen)) { faltan++; continue }
  const so = fs.statSync(origen)
  // En GitHub Actions el checkout deja todas las fechas iguales: ahí basta con que exista.
  if (fs.existsSync(destino) && (process.env.CI || fs.statSync(destino).mtimeMs >= so.mtimeMs)) { saltadas++; continue }
  try {
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    const buf = await sharp(origen).rotate().resize({ width: ANCHO, withoutEnlargement: true }).webp({ quality: CALIDAD }).toBuffer()
    fs.writeFileSync(destino, buf)
    antes += so.size; despues += buf.length; hechas++
  } catch (e) {
    console.log(`⚠ ${rel}: ${e.message}`)
  }
}
console.log(`✓ Miniaturas: ${hechas} nuevas, ${saltadas} al día, ${faltan} sin archivo` +
  (hechas ? ` · ${(antes / 1e6).toFixed(1)}MB → ${(despues / 1e6).toFixed(1)}MB` : ''))
