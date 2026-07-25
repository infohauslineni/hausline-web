// ============================================================
//  CONTADOR REAL DE VISUALIZACIONES  (Supabase)
//  - Cuenta SOLO cuando se abre un producto (no cuando aparece).
//  - Evita contar varias veces desde el mismo navegador por 24 h.
//  - El contador vive en Supabase, no en el navegador.
//  Si SUPABASE_URL / SUPABASE_ANON_KEY están vacíos, todo esto
//  se desactiva solo y la web sigue funcionando igual.
// ============================================================

const HL_VIEWS = {
  activo: false,
  cliente: null,
  cache: {},          // { codigo: vistas } cargado una sola vez
  cargado: false
};

// Carga la librería de Supabase desde CDN solo si hay claves.
function hlInitSupabase(){
  if(!SUPABASE_URL || !SUPABASE_ANON_KEY) return; // no configurado → desactivado
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  s.onload = () => {
    try{
      HL_VIEWS.cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      HL_VIEWS.activo = true;
      hlCargarTodasLasVistas().then(() => {
        document.dispatchEvent(new CustomEvent("vistas:listas"));
      });
    }catch(e){ console.warn("Supabase no disponible:", e); }
  };
  s.onerror = () => console.warn("No se pudo cargar Supabase (CDN).");
  document.head.appendChild(s);
}

// Trae todos los contadores una sola vez (para Tendencias).
async function hlCargarTodasLasVistas(){
  if(!HL_VIEWS.activo) return {};
  try{
    const { data, error } = await HL_VIEWS.cliente
      .from("vistas_producto")
      .select("codigo, vistas");
    if(error) throw error;
    HL_VIEWS.cache = {};
    (data || []).forEach(r => { HL_VIEWS.cache[r.codigo] = Number(r.vistas) || 0; });
    HL_VIEWS.cargado = true;
  }catch(e){ console.warn("No se pudieron leer las vistas:", e); }
  return HL_VIEWS.cache;
}

// ¿Este navegador ya contó este producto en las últimas 24 h?
function hlYaConto(codigo){
  try{
    const t = Number(localStorage.getItem("hausline_vista_" + codigo) || 0);
    return (Date.now() - t) < 24 * 60 * 60 * 1000;
  }catch(e){ return false; }
}
function hlMarcarConto(codigo){
  try{ localStorage.setItem("hausline_vista_" + codigo, String(Date.now())); }catch(e){}
}

// Registra una visualización al ABRIR el producto. Devuelve el total.
async function hlRegistrarVista(codigo){
  if(!HL_VIEWS.activo) return null;

  // Si ya contó en 24h, solo devuelve el valor cacheado (no incrementa).
  if(hlYaConto(codigo)){
    return HL_VIEWS.cache[codigo] ?? null;
  }

  try{
    const { data, error } = await HL_VIEWS.cliente
      .rpc("incrementar_vista", { p_codigo: codigo });
    if(error) throw error;
    hlMarcarConto(codigo);
    const total = Number(data) || (HL_VIEWS.cache[codigo] || 0) + 1;
    HL_VIEWS.cache[codigo] = total;
    return total;
  }catch(e){
    console.warn("No se pudo registrar la vista:", e);
    return HL_VIEWS.cache[codigo] ?? null;
  }
}

// Lectura rápida desde caché (sin ir a la red).
function hlVistasDe(codigo){
  return HL_VIEWS.cache[codigo] ?? 0;
}

// Productos ordenados por vistas reales (para Tendencias).
// Devuelve solo los que tienen al menos 1 vista.
function hlTopVistos(lista, limite){
  return lista
    .map(p => ({ p, v: hlVistasDe(p.codigo) }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, limite || 12)
    .map(x => x.p);
}

// Más vendidos de la semana (tabla ventas en Supabase).
async function hlMasVendidosSemana(){
  if(!HL_VIEWS.activo) return null;   // null = Supabase no configurado
  try{
    const { data, error } = await HL_VIEWS.cliente.rpc("mas_vendidos_semana");
    if(error) throw error;
    return data || [];                // [] = configurado pero sin ventas aún
  }catch(e){
    console.warn("No se pudieron leer las ventas:", e);
    return null;
  }
}

hlInitSupabase();
