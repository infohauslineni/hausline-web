// ============================================================
//   BANNER DE PREVIEW DE LA WEB GENERAL (Open Graph raíz)
// ------------------------------------------------------------
//   Genera og-home.jpg (1200x630) con la MARCA HAUSLINE, para que
//   al compartir el enlace general (hauslineshopni.es) el preview
//   de WhatsApp/Facebook muestre el LOGO y no un producto suelto.
//   Los enlaces de producto (/p/CODIGO) siguen mostrando su foto.
//
//   USO:  node scripts/gen-og-home.mjs
// ============================================================
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="28%" cy="26%" r="75%">
      <stop offset="0%" stop-color="#1a2a05"/>
      <stop offset="45%" stop-color="#0a0f04"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#050505"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="8" fill="#b7ff00"/>
  <rect x="0" y="622" width="1200" height="8" fill="#b7ff00"/>

  <!-- Punto + wordmark (centrado) -->
  <circle cx="262" cy="292" r="16" fill="#b7ff00"/>
  <text x="294" y="315" font-family="Arial, Helvetica, sans-serif" font-size="118" font-weight="800" letter-spacing="10">
    <tspan fill="#ffffff">HAUS</tspan><tspan fill="#b7ff00">LINE</tspan>
  </text>

  <!-- Subtítulo -->
  <text x="600" y="388" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="16" fill="#c3c9c5">KING OF SHOES</text>

  <!-- Pie -->
  <text x="600" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="500" letter-spacing="2" fill="#8a938d">Sneakers  ·  Ropa  ·  Accesorios  —  Envíos a toda Nicaragua</text>
</svg>`

const destino = path.join(raiz, 'og-home.jpg')
await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(destino)
console.log('✓ og-home.jpg (1200x630) generado')
