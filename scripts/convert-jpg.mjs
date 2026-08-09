// ============================================================
//   CONVERSOR DE FOTOS A JPG (para el preview de WhatsApp)
// ------------------------------------------------------------
//   WhatsApp/Facebook no previsualizan fotos .webp/.avif/.jfif.
//   Este script crea una copia .jpg al lado de la foto principal
//   de cada producto que esté en esos formatos, para que el
//   generador de /p/ (gen-og.mjs) la use en el preview.
//
//   REQUIERE la librería sharp (una sola vez):
//       npm init -y && npm i sharp
//   USO:
//       node scripts/convert-jpg.mjs
//   Después corré:  node scripts/gen-og.mjs
// ============================================================
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let sharp
try {
  sharp = require('sharp')
} catch {
  console.error('Falta la librería "sharp". Instálala con:  npm i sharp')
  process.exit(1)
}

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OK = new Set(['jpg', 'jpeg', 'png'])

const code = fs.readFileSync(path.join(raiz, 'productos.js'), 'utf8')
const sandbox = { window: {}, document: { createElement: () => ({}) }, console, Date, Set, Number, String, Math, Array, Object, JSON }
vm.createContext(sandbox)
vm.runInContext(`${code}\nthis.__d = { productos }`, sandbox)

const objetivos = sandbox.__d.productos
  .map((p) => ({ codigo: p.codigo, imagen: p.imagen }))
  .filter((p) => p.imagen && !OK.has(p.imagen.split('.').pop().toLowerCase()))

let ok = 0
const fallos = []
for (const { codigo, imagen } of objetivos) {
  const origen = path.join(raiz, imagen)
  const destino = origen.replace(/\.[^.]+$/, '.jpg')
  try {
    await sharp(origen, { failOn: 'none' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(destino)
    ok++
    console.log(`✓ ${codigo}  ${path.basename(imagen)} -> ${path.basename(destino)}`)
  } catch (error) {
    fallos.push({ codigo, imagen, error: error.message })
    console.log(`✗ ${codigo}  ${imagen}  ::  ${error.message}`)
  }
}
console.log(`\nConvertidas ${ok}/${objetivos.length} foto(s) a .jpg`)
if (fallos.length) console.log('Fallos:', JSON.stringify(fallos, null, 2))
