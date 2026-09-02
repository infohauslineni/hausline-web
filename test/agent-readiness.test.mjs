// Pruebas de "agent readiness" para hauslineshopni.es.
// Correr con: npm test   (equivale a: node --test)
//
// Cubren (1) la lógica de negociación Markdown y (2) que los archivos del sitio
// mantengan los datos que los agentes/LLM esperan (JSON-LD de identidad, llms.txt
// con "when to use", 404 con cuerpo Markdown, páginas de confianza, gemelos .md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  parseAccept,
  prefersMarkdown,
  markdownTwinFor,
  MARKDOWN_ROUTES,
} from '../agents/negotiation.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ---------------------------------------------------------------------------
// 1. Negociación de contenido Markdown (base del Worker acceptmarkdown.com)
// ---------------------------------------------------------------------------

test('prefersMarkdown: solo Markdown -> true', () => {
  assert.equal(prefersMarkdown('text/markdown'), true);
  assert.equal(prefersMarkdown('text/x-markdown'), true);
});

test('prefersMarkdown: navegador (html primero) -> false', () => {
  assert.equal(
    prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'),
    false,
  );
  assert.equal(prefersMarkdown('text/html, text/markdown;q=0.9'), false);
});

test('prefersMarkdown: Markdown por delante de html -> true', () => {
  assert.equal(prefersMarkdown('text/markdown, text/html;q=0.9'), true);
});

test('prefersMarkdown: sin Accept o */* -> false', () => {
  assert.equal(prefersMarkdown(''), false);
  assert.equal(prefersMarkdown(undefined), false);
  assert.equal(prefersMarkdown('*/*'), false);
});

test('prefersMarkdown: q=0 desactiva Markdown', () => {
  assert.equal(prefersMarkdown('text/markdown;q=0'), false);
});

test('parseAccept respeta valores q', () => {
  const list = parseAccept('text/markdown;q=0.4, text/html');
  assert.deepEqual(
    list.find((x) => x.type === 'text/markdown'),
    { type: 'text/markdown', q: 0.4 },
  );
});

test('markdownTwinFor normaliza la barra final', () => {
  assert.equal(markdownTwinFor('/about/'), '/about.md');
  assert.equal(markdownTwinFor('/about'), '/about.md');
  assert.equal(markdownTwinFor('/'), '/index.md');
  assert.equal(markdownTwinFor('/no-existe'), null);
});

test('markdownTwinFor: /devoluciones y /returns comparten el mismo .md', () => {
  assert.equal(markdownTwinFor('/devoluciones'), '/devoluciones.md');
  assert.equal(markdownTwinFor('/returns/'), '/devoluciones.md');
});

test('cada gemelo Markdown declarado existe como archivo', () => {
  for (const twin of Object.values(MARKDOWN_ROUTES)) {
    assert.ok(existsSync(join(ROOT, twin.replace(/^\//, ''))), `falta ${twin}`);
    assert.ok(read(twin.replace(/^\//, '')).trim().length > 200, `${twin} muy corto`);
  }
});

// ---------------------------------------------------------------------------
// 2. JSON-LD de identidad (Organization con contactPoint + address)
// ---------------------------------------------------------------------------

function ldBlocks(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    out.push(JSON.parse(m[1].trim()));
  }
  return out;
}

test('index.html tiene JSON-LD de identidad (Organization)', () => {
  const blocks = ldBlocks(read('index.html'));
  assert.ok(blocks.length >= 1, 'no hay bloques JSON-LD');
  const types = ['Organization', 'OnlineStore', 'LocalBusiness', 'Store'];
  const org = blocks.find((b) => {
    const t = [].concat(b['@type'] || []);
    return t.some((x) => types.includes(x));
  });
  assert.ok(org, 'no hay tipo de identidad en el JSON-LD');
  assert.equal(org.name, 'HAUSLINE');
  assert.ok(org.url && org.description, 'faltan url/description');
});

test('Organization: contactPoint con email/telefono/contactType', () => {
  const org = ldBlocks(read('index.html')).find((b) =>
    [].concat(b['@type'] || []).includes('Organization'),
  );
  const cp = org.contactPoint;
  assert.ok(cp, 'sin contactPoint');
  assert.equal(cp['@type'], 'ContactPoint');
  assert.ok(cp.contactType, 'sin contactType');
  assert.ok(cp.telephone, 'sin telephone');
  assert.ok(cp.email, 'sin email');
});

test('Organization: address de tipo PostalAddress', () => {
  const org = ldBlocks(read('index.html')).find((b) =>
    [].concat(b['@type'] || []).includes('Organization'),
  );
  assert.ok(org.address, 'sin address');
  assert.equal(org.address['@type'], 'PostalAddress');
  assert.ok(org.address.addressCountry, 'sin addressCountry');
});

// ---------------------------------------------------------------------------
// 3. llms.txt con guía de "cuándo usar" (when to use)
// ---------------------------------------------------------------------------

test('llms.txt tiene seccion "when to use"', () => {
  const txt = read('llms.txt').toLowerCase();
  assert.match(txt, /when to use|cuándo usar/);
  assert.match(txt, /wa\.me\/50578995116/); // canal de contacto concreto
});

test('llms.txt enlaza los gemelos .md', () => {
  const txt = read('llms.txt');
  for (const twin of ['/index.md', '/about.md', '/contact.md', '/privacy.md']) {
    assert.ok(txt.includes(twin), `llms.txt no enlaza ${twin}`);
  }
});

// ---------------------------------------------------------------------------
// 4. 404 real con cuerpo Markdown que apunta a sitemap/llms.txt
// ---------------------------------------------------------------------------

test('404.html tiene noindex y cuerpo Markdown util', () => {
  const html = read('404.html');
  assert.match(html, /name=["']robots["']\s+content=["']noindex/i);
  assert.match(html, /sitemap\.xml/);
  assert.match(html, /llms\.txt/);
  assert.match(html, /#\s*404/); // encabezado Markdown en el cuerpo
  assert.match(html, /^-\s+/m); // lista Markdown de puntos de entrada
});

// ---------------------------------------------------------------------------
// 5. Páginas de confianza (about / contact / privacy) con contenido real
// ---------------------------------------------------------------------------

for (const [rel, needle] of [
  ['about/index.html', /Sobre HAUSLINE/i],
  ['contact/index.html', /Contacto/i],
  ['privacy/index.html', /privacidad/i],
  ['devoluciones/index.html', /Devoluciones y reembolsos/i],
  ['returns/index.html', /Returns &amp; refunds/i],
]) {
  test(`${rel} existe, tiene canonical y >500 chars de texto`, () => {
    const html = read(rel);
    assert.match(html, needle);
    assert.match(html, /rel=["']canonical["']/);
    const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.ok(textOnly.length > 500, `${rel} tiene poco texto (${textOnly.length})`);
  });
}

test('paginas negociables declaran <link rel="alternate" text/markdown>', () => {
  for (const rel of [
    'index.html',
    'about/index.html',
    'contact/index.html',
    'privacy/index.html',
    'devoluciones/index.html',
    'returns/index.html',
  ]) {
    assert.match(
      read(rel),
      /rel=["']alternate["'][^>]*type=["']text\/markdown["']/,
      `${rel} sin link alternate markdown`,
    );
  }
});

// ---------------------------------------------------------------------------
// 6. sitemap y generador incluyen /privacy
// ---------------------------------------------------------------------------

test('sitemap.xml y gen-og.mjs incluyen /privacy', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/hauslineshopni\.es\/privacy<\/loc>/);
  assert.match(read('scripts/gen-og.mjs'), /\$\{SITIO\}\/privacy`/);
});

// ---------------------------------------------------------------------------
// 7. Política de devoluciones/reembolsos, descubrible por agentes
// ---------------------------------------------------------------------------

test('terminos.html tiene seccion #devoluciones', () => {
  const html = read('terminos.html');
  assert.match(html, /id=["']devoluciones["']/);
  assert.match(html, /Devoluciones y reembolsos/i);
  assert.match(html, /ventas por encargo son finales/i);
});

test('FAQ (visible + JSON-LD) responde sobre devoluciones', () => {
  const html = read('index.html');
  // visible
  assert.match(html, /¿Puedo devolver o cambiar un producto\?/);
  // JSON-LD: existe una Question del FAQPage sobre devolver/cambiar
  const faq = ldBlocks(html).find((b) => b['@type'] === 'FAQPage');
  assert.ok(faq, 'sin FAQPage');
  const q = faq.mainEntity.find((x) => /devolver o cambiar/i.test(x.name));
  assert.ok(q, 'sin pregunta de devoluciones en JSON-LD');
  assert.match(q.acceptedAnswer.text, /ventas por encargo son finales/i);
});

test('/returns es alias canónico de /devoluciones', () => {
  assert.match(
    read('returns/index.html'),
    /rel=["']canonical["']\s+href=["']https:\/\/hauslineshopni\.es\/devoluciones["']/,
  );
});

test('sitemap.xml y gen-og.mjs incluyen /devoluciones (canónico)', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/hauslineshopni\.es\/devoluciones<\/loc>/);
  assert.match(read('scripts/gen-og.mjs'), /\$\{SITIO\}\/devoluciones`/);
  // /returns NO va en el sitemap (es alias no canónico)
  assert.doesNotMatch(read('sitemap.xml'), /\/returns</);
});

test('llms.txt menciona la politica de devoluciones', () => {
  const txt = read('llms.txt');
  assert.match(txt, /\/devoluciones/);
  assert.match(txt, /\/devoluciones\.md/);
});
