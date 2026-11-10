// ============================================================
//  PRODUCTOS CARGADOS DESDE EL PANEL  (Supabase · hausline-shop)
//  - Trae los productos que sube en admin.html y los agrega al
//    catálogo del sitio, ADEMÁS de los de productos.js.
//  - Si Supabase no responde, la web sigue igual con productos.js.
//  - Los códigos que ya existan en productos.js NO se duplican.
// ============================================================

const CATALOGO_PANEL = {
  url: "https://xgdijumnmaqfirmckugw.supabase.co",
  key: "sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw"
};

async function cargarProductosDelPanel(){
  // Necesita que productos.js ya haya cargado (productos + normalizarProducto).
  if(typeof productos === "undefined" || typeof normalizarProducto !== "function") return;

  // 1) Supabase con tiempo límite (6 s). 2) Si está lento, caído o saturado: la copia de
  // respaldo que vive en este mismo sitio (catalogo-respaldo.json, se actualiza cada 15 min).
  // Así la tienda siempre muestra los productos, precios y ocultos correctos.
  async function traer(url, opciones, ms, vacioOk){
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
    try{
      const r = await fetch(url, Object.assign({}, opciones, ctrl ? { signal: ctrl.signal } : {}));
      if(!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if(!Array.isArray(j) || (!j.length && !vacioOk)) throw new Error("vacío");
      return j;
    } finally { if(t) clearTimeout(t); }
  }
  // La base de datos entrega como mucho 1000 filas por pedido: se piden por páginas.
  // Los borradores NO se bajan enteros (son miles de productos sin publicar): solo importan
  // los que tapan un producto de productos.js, y de esos basta el código.
  const BASE = `${CATALOGO_PANEL.url}/rest/v1/catalogo_web`;
  const H = { headers: { apikey: CATALOGO_PANEL.key, Authorization: "Bearer " + CATALOGO_PANEL.key } };
  async function traerTodo(query){
    let todo = [];
    for(let desde = 0; ; desde += 1000){
      const pag = await traer(`${BASE}?${query}&offset=${desde}&limit=1000`, H, 6000, true);
      todo = todo.concat(pag);
      if(pag.length < 1000) return todo;
    }
  }
  async function borradoresDeLaBase(){
    const cods = [...new Set(productos.map(p => String(p.codigo || "").toUpperCase()).filter(Boolean))];
    const tandas = [];
    for(let i = 0; i < cods.length; i += 150) tandas.push(cods.slice(i, i + 150));
    const res = await Promise.all(tandas.map(t => traer(
      `${BASE}?select=codigo,activo&datos->>borrador=eq.true&codigo=in.(${t.map(c => encodeURIComponent('"' + c.replace(/"/g, "") + '"')).join(",")})`, H, 6000, true)));
    return [].concat(...res).map(f => ({ codigo: f.codigo, activo: f.activo, datos: { codigo: f.codigo, borrador: true } }));
  }
  let filas = null;
  try{
    filas = await traerTodo("select=codigo,datos,activo&or=(datos->>borrador.is.null,datos->>borrador.neq.true)&order=created_at.asc,codigo.asc");
    if(!filas.length) throw new Error("vacío");
    try{ filas = filas.concat(await borradoresDeLaBase()); }catch(e){ /* sin esto solo no se tapan borradores de la base */ }
  }catch(e){
    console.warn("Catálogo del panel lento o no disponible, se usa el respaldo:", e && e.message);
    try{ filas = await traer("/catalogo-respaldo.json?v=" + Math.floor(Date.now() / 900000), {}, 8000); }
    catch(e2){ console.warn("Respaldo del catálogo no disponible:", e2 && e2.message); return; }
  }
  if(!Array.isArray(filas) || !filas.length) return;

  let agregados = 0;
  const editados = {};
  filas.forEach(fila => {
    const datos = fila && fila.datos ? fila.datos : null;
    const codigo = (datos && datos.codigo) || (fila && fila.codigo);
    if(!codigo) return;
    const existente = typeof buscarProducto === "function" ? buscarProducto(codigo) : null;
    // Oculto desde el panel (activo=false): si el producto viene del catálogo base,
    // se QUITA para que deje de mostrarse. Si era solo del panel, no se agrega.
    // Un borrador del panel (datos.borrador) tampoco se muestra, aunque figure activo.
    if(fila && (fila.activo === false || (datos && datos.borrador === true))){
      if(existente){ const i = productos.indexOf(existente); if(i >= 0){ productos.splice(i, 1); agregados++; } }
      return;
    }
    if(!datos || !datos.codigo) return;
    // Venta libre: se guarda aparte (solo se abre por su link, no se lista en la tienda).
    if(datos.ventaLibre === true){
      if(existente){ const i = productos.indexOf(existente); if(i >= 0) productos.splice(i, 1); }
      if(typeof productosPrivados !== "undefined"){ productosPrivados.push(normalizarProducto(datos, productos.length)); agregados++; }
      return;
    }
    if(existente){
      // Ya existe en productos.js: es una EDICIÓN hecha desde el panel.
      // Se reemplaza conservando su posición original (orden) en el catálogo.
      const i = productos.indexOf(existente);
      if(i >= 0){ productos[i] = normalizarProducto(datos, existente.orden); editados[String(datos.codigo).toUpperCase()] = true; }
    } else {
      // Producto NUEVO (solo existe en el panel): se agrega al final.
      productos.push(normalizarProducto(datos, productos.length));
    }
    agregados++;
  });
  if(!agregados) return;

  // Si el cliente ya tenía ABIERTO un producto que cambió en el panel (p. ej. entró directo por
  // /p/CODIGO/ y la página se abrió con el precio viejo de productos.js), se vuelve a pintar con
  // los datos nuevos conservando su selección. Antes el pedido podía salir con el precio viejo.
  try{
    if(typeof productoActual !== "undefined" && productoActual && editados[String(productoActual.codigo).toUpperCase()]
       && document.body.classList.contains("en-producto") && typeof repintarPrecios === "function") repintarPrecios();
  }catch(e){}

  // El set de "Nuevo" se calcula una sola vez y queda cacheado; al agregar
  // productos hay que invalidarlo para que los del panel salgan en esa fila.
  // (La sección "Marcas" es curada por logo, así que no se toca a propósito.)
  try{ _codigosNuevos = null; }catch(e){}

  // Vuelve a pintar lo que ya está en pantalla para que aparezcan los nuevos.
  try{ if(typeof renderInicio === "function") renderInicio(); }catch(e){}
  try{ if(typeof renderTendencias === "function") renderTendencias(); }catch(e){}
  try{ if(typeof renderMasVendidos === "function") renderMasVendidos(); }catch(e){}
  // Si hay una colección abierta (categoría/marca), la refresca sin perder el lugar.
  try{
    if(typeof coleccionActual !== "undefined" && coleccionActual && typeof abrirColeccion === "function"){
      abrirColeccion(coleccionActual.tipo, coleccionActual.valor, coleccionActual.titulo, true);
    }
  }catch(e){}

  // Si se entró por link directo a un producto del panel, abrirlo ahora que ya
  // cargó (iniciar() corrió antes que esta carga async y ahí no lo encontró).
  // Cubre las DOS formas de enlace directo, porque los productos del panel las
  // usan igual que los del catálogo base:
  //   • ruta estática /p/CODIGO/  → la página propia con Open Graph (200 real)
  //   • ?producto=CODIGO          → compatibilidad y fallback del 404.html
  // Sin esto, un /p/CODIGO de un producto del panel abría solo el inicio.
  try{
    const mRuta = location.pathname.match(/^\/p\/([^\/?#]+)\/?$/);
    const directo = mRuta ? decodeURIComponent(mRuta[1])
                          : new URLSearchParams(location.search).get("producto");
    if(directo && typeof abrirProducto === "function"
       && typeof buscarProducto === "function" && buscarProducto(directo)
       && !document.body.classList.contains("en-producto")){
      // Deja "/" (inicio) como base del historial ANTES de abrir, igual que hace
      // iniciar() para los productos del catálogo base. Sin esto la "X" del producto
      // (que hace history.back()) no tenía a dónde volver y no cerraba.
      try{
        const destino = mRuta ? ("/p/" + encodeURIComponent(directo) + "/")
                              : (location.pathname + location.search);
        history.replaceState({}, "", "/");
        history.pushState({ producto: directo }, "", destino);
      }catch(e){}
      abrirProducto(directo, false, true);
    }
  }catch(e){}

  console.log(`HAUSLINE · +${agregados} productos del panel · ${productos.length} en total`);
}

// Arranca apenas cargue el script (después de productos.js y app.js).
cargarProductosDelPanel();
