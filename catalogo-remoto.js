// ============================================================
//  PRODUCTOS CARGADOS DESDE EL PANEL  (Supabase · hausline-shop)
//  - Trae los productos que subís en admin.html y los agrega al
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

  let filas;
  try{
    const r = await fetch(
      `${CATALOGO_PANEL.url}/rest/v1/catalogo_web?select=codigo,datos&activo=eq.true&order=created_at.asc`,
      { headers: { apikey: CATALOGO_PANEL.key, Authorization: "Bearer " + CATALOGO_PANEL.key } }
    );
    if(!r.ok) return;
    filas = await r.json();
  }catch(e){
    console.warn("Catálogo del panel no disponible:", e);
    return;
  }
  if(!Array.isArray(filas) || !filas.length) return;

  let agregados = 0;
  filas.forEach(fila => {
    const datos = fila && fila.datos ? fila.datos : null;
    if(!datos || !datos.codigo) return;
    // Si ese código ya está en productos.js, no lo duplicamos.
    if(typeof buscarProducto === "function" && buscarProducto(datos.codigo)) return;
    const prod = normalizarProducto(datos, productos.length);
    productos.push(prod);
    agregados++;
  });
  if(!agregados) return;

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

  console.log(`HAUSLINE · +${agregados} productos del panel · ${productos.length} en total`);
}

// Arranca apenas cargue el script (después de productos.js y app.js).
cargarProductosDelPanel();
