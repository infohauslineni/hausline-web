// ============================================================
//  CONFIGURACIÓN CENTRAL DE HAUSLINE
//  Aquí editas: tasa del dólar, Supabase, Instagram y TikTok.
//  Este archivo se carga PRIMERO, antes que todo lo demás.
// ============================================================

// ---------- TASA DEL DÓLAR (para el conversor USD → C$) ----------
// Cambia solo este número cuando cambie el tipo de cambio.
const HAUSLINE_EXCHANGE_RATE = 37;

// ---------- MONEDA ----------
// Formatea un precio en USD según la moneda que el cliente eligió.
// Toda la web (tarjetas, producto, carrito, totales) usa esta función.
let monedaActual = "USD";
try { monedaActual = localStorage.getItem("hausline_moneda") || "USD"; } catch(e){}

function formatearMoneda(usd){
  const n = Number(usd) || 0;
  if(monedaActual === "NIO"){
    return "C$" + Math.round(n * HAUSLINE_EXCHANGE_RATE).toLocaleString("en-US");
  }
  return "$" + n.toLocaleString("en-US");
}

// Precio SIEMPRE en dólares (para el mensaje de WhatsApp del pedido).
function precioUSD(usd){
  return "$" + (Number(usd) || 0).toLocaleString("en-US");
}

// Precio SIEMPRE en córdobas (para el mensaje de WhatsApp del pedido).
function precioNIO(usd){
  return "C$" + Math.round((Number(usd) || 0) * HAUSLINE_EXCHANGE_RATE).toLocaleString("en-US");
}

// ---------- ENVÍO (pedidos por encargo) ----------
// El cliente elige cómo quiere que llegue su pedido por encargo:
//   • Estándar → el tiempo normal, sin costo extra.
//   • Rápido   → llega antes por un cargo adicional (se cobra por producto).
// Aplica a TODOS los productos por encargo (los de ahora y los futuros).
// Para cambiar los días o el cargo, edita solo estos números.
const HAUSLINE_ENVIO = {
  estandar: { id:"estandar", etiqueta:"Envío estándar", dias:"20 a 25 días", diasMin:20, diasMax:25, recargo:0 },
  rapido:   { id:"rapido",   etiqueta:"Envío rápido",   dias:"14 a 17 días", diasMin:14, diasMax:17, recargo:15 }
};
const HAUSLINE_ENVIO_DEFECTO = "estandar";

// ---------- CÓRDOBAS "CERRADOS" ----------
// Convierte USD a córdobas y REDONDEA HACIA ARRIBA al múltiplo de 10
// (ej. 2964 → 2970). Se usa en el encargo para que el total quede redondo.
function cordobasCerrados(usd){
  return Math.ceil((Number(usd) || 0) * HAUSLINE_EXCHANGE_RATE / 10) * 10;
}

// ---------- CUENTAS DE PAGO (encargos por transferencia) ----------
// El cliente ve estas cuentas al encargar para hacer la transferencia.
// Para cambiar una cuenta, edita solo esta lista.
// NOTA: la LAFISE de Alejandro está bloqueada; por ahora va la de Xiomara.
// Cuando se desbloquee, reemplaza los dos números LAFISE por:
//   Dólares 133254039 / Córdobas 138038710 — Alejandro Uzziel Linares Flores
const HAUSLINE_CUENTAS = [
  { banco: "LAFISE",         moneda: "Dólares",  numero: "133210618", titular: "Xiomara Rivas López" },
  { banco: "LAFISE",         moneda: "Córdobas", numero: "137034030", titular: "Xiomara Rivas López" },
  { banco: "BAC",            moneda: "Córdobas", numero: "360322192", titular: "Tania Vanessa Flores Rivas" },
  { banco: "Billetera Móvil", moneda: "",        numero: "8487-6610", titular: "Alejandro Uzziel Linares Flores" },
];

// ============================================================
//  SUPABASE  (para el contador REAL de visualizaciones)
//  Pega aquí los datos de tu proyecto Supabase.
//  Mientras estén vacíos, la web funciona igual pero sin contador.
//  NUNCA pegues la clave service_role, SOLO la anon (pública).
// ============================================================
const SUPABASE_URL      = "https://epslwaxjemlysqtubbfu.supabase.co/rest/v1/";  
const SUPABASE_ANON_KEY = "sb_publishable_bASR2lpLTORx-1pWbwvgiQ_fsjAuX2r";  

// ============================================================
//  INSTAGRAM  —  @hausline.ni
//  Instagram no deja traer publicaciones sin API, así que pegas
//  cada una a mano. Es muy fácil:
//    1) Guarda la imagen de la publicación en imgP/instagram/
//    2) Copia el enlace del post (Compartir → Copiar enlace)
//    3) Agrega una línea aquí abajo.
//  Para ocultar la sección, deja el arreglo vacío: [].
// ============================================================
const instagramPosts = [
 //{ imagen: "imgP/clientes/10 (2).jpg", url: "https://www.instagram.com/p/DZbMkG_R7vk/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==" },
 //{ imagen: "imgP/clientes/10 (9).jpg", url: "https://www.instagram.com/p/DZHhmO_RN6v/?utm_source=ig_web_button_share_sheet&igsh=MzRlODBiNWFlZA==" },
];

// ============================================================
//  TIKTOK  —  @hausline.niof
//  Igual que Instagram: pega la portada (una imagen) y el link.
//    1) Guarda una captura/portada del video en imgP/tiktok/
//    2) Copia el enlace del video (Compartir → Copiar enlace)
//    3) Agrega una línea aquí abajo.
//  Para ocultar la sección, deja el arreglo vacío: [].
// ============================================================
const tiktokVideos = [
 //{ portada: "imgP/clientes/10 (13).jpg", url: "https://www.tiktok.com/@hausline.niof/photo/7653959052036164871?is_from_webapp=1&sender_device=pc" },
];

// ---------- Redes (perfiles) ----------
const HAUSLINE_INSTAGRAM = "https://instagram.com/hausline.ni";
const HAUSLINE_TIKTOK    = "https://tiktok.com/@hausline.niof";
