// Optimiza las fotos del catálogo (imgP) SIN cambiar rutas ni formato:
//   - JPG/JPEG: reescala a máx 1600px lado largo, recomprime q78 progresivo (mozjpeg),
//     respeta la orientación EXIF. Solo sobrescribe si el archivo queda MÁS liviano.
//   - PNG: recomprime al máximo. Conserva la transparencia (fondo del catálogo).
//     Solo sobrescribe si queda más liviano.
// Reversible con git. Correr: node scripts/optimizar-imagenes.mjs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Sin caché de libvips: procesamos y SOBRESCRIBIMOS miles de archivos; el caché de
// handles de libvips choca con writeFileSync en Windows (errores "UNKNOWN: open").
sharp.cache(false);

const RAIZ = 'imgP';
const MAX = 1600;
const MIN_JPG = 100 * 1024; // no tocar JPG ya livianas (<100KB)

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(RAIZ);
let antes = 0, despues = 0, tocados = 0, errores = 0, i = 0;

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const esJpg = ext === '.jpg' || ext === '.jpeg';
  const esPng = ext === '.png';
  if (!esJpg && !esPng) continue;

  i++;
  if (i % 200 === 0) console.log(`  …${i} procesadas (${tocados} recomprimidas)`);

  let input;
  try { input = fs.readFileSync(f); } catch { errores++; continue; }
  const orig = input.length;
  if (esJpg && orig < MIN_JPG) { antes += orig; despues += orig; continue; }

  try {
    // Leemos desde BUFFER (no desde la ruta): así sharp no mantiene el archivo
    // abierto y podemos sobrescribirlo sin conflicto.
    let img = sharp(input).rotate(); // respeta EXIF y lo hornea
    const meta = await img.metadata();
    if ((meta.width && meta.width > MAX) || (meta.height && meta.height > MAX)) {
      img = img.resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
    }
    let out;
    if (esJpg) {
      out = await img.jpeg({ quality: 78, progressive: true, mozjpeg: true }).toBuffer();
    } else {
      out = await img.png({ compressionLevel: 9, effort: 10, palette: !meta.hasAlpha, quality: 90 }).toBuffer();
    }
    if (out.length < orig) {
      fs.writeFileSync(f, out);
      antes += orig; despues += out.length; tocados++;
    } else {
      antes += orig; despues += orig;
    }
  } catch (e) {
    antes += orig; despues += orig; errores++;
    if (errores <= 10) console.warn('  ! saltada', f, e.message);
  }
}

console.log(`\nListo. ${tocados} imágenes recomprimidas, ${errores} errores.`);
console.log(`Antes: ${(antes / 1048576).toFixed(0)}MB  →  Después: ${(despues / 1048576).toFixed(0)}MB  (${Math.round(100 - despues / antes * 100)}% menos)`);
