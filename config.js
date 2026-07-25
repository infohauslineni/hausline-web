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

// ============================================================
//  SUPABASE  (para el contador REAL de visualizaciones)
//  Pega aquí los datos de tu proyecto Supabase.
//  Mientras estén vacíos, la web funciona igual pero sin contador.
//  NUNCA pegues la clave service_role, SOLO la anon (pública).
// ============================================================
const SUPABASE_URL      = "";   // ej: https://xxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = "";   // ej: eyJhbGciOi...

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
  // { imagen: "imgP/instagram/post1.jpg", url: "https://www.instagram.com/p/XXXXXXX/" },
  // { imagen: "imgP/instagram/post2.jpg", url: "https://www.instagram.com/p/YYYYYYY/" },
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
  // { portada: "imgP/tiktok/video1.jpg", url: "https://www.tiktok.com/@hausline.niof/video/XXXX" },
];

// ---------- Redes (perfiles) ----------
const HAUSLINE_INSTAGRAM = "https://instagram.com/hausline.ni";
const HAUSLINE_TIKTOK    = "https://tiktok.com/@hausline.niof";
