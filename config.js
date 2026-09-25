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
// "preparacion" = días aprox. que tarda el proveedor en preparar el pedido; el resto del
// rango es tiempo de tránsito, que empieza a contar cuando el pedido sale en camino.
const HAUSLINE_ENVIO = {
  estandar: { id:"estandar", etiqueta:"Envío estándar", dias:"20 a 25 días", diasMin:20, diasMax:25, preparacion:"4 a 5 días", recargo:0 },
  rapido:   { id:"rapido",   etiqueta:"Envío rápido",   dias:"15 a 20 días", diasMin:15, diasMax:20, preparacion:"3 a 4 días", recargo:15 }
};
const HAUSLINE_ENVIO_DEFECTO = "estandar";

// Aclaración de tiempos que acompaña la entrega estimada (producto, checkout, Mi cuenta).
// Las fechas NUNCA son exactas: las paqueterías a veces retrasan los envíos.
function textoTiemposEnvio(metodo){
  var prep = metodo && metodo.preparacion ? metodo.preparacion : "unos días";
  return "Incluye aprox. " + prep + " de preparación (algunos productos tardan más en prepararse); "
    + "el resto es tiempo de tránsito, que empieza a contar cuando tu pedido sale en camino. "
    + "Las fechas de entrega son aproximadas, no exactas: muchas veces las paqueterías retrasan los envíos.";
}

// ---------- DEMORA EXTENDIDA POR PRODUCTO ----------
// Algunos proveedores tardan más. En el panel (admin.html) se marca el producto con
// "¿Puede tardar más de lo esperado?" → datos.demoraExtendida + diasExtra + notaDemora.
// Se avisa en la página del producto, en el carrito y en el checkout, y los días extra
// se suman a la entrega estimada.
function demoraDe(producto){
  if(!producto || producto.demoraExtendida !== true) return null;
  return { extra: Math.max(0, Math.round(Number(producto.diasExtra) || 0)), nota: String(producto.notaDemora || "").trim() };
}
// "20 a 25 días" + 10 extra → "30 a 35 días".
function diasConDemora(metodo, extra){
  if(!metodo) return "";
  return extra > 0 ? `${metodo.diasMin + extra} a ${metodo.diasMax + extra} días` : metodo.dias;
}
function textoAvisoDemora(demora){
  if(!demora) return "";
  return "Este producto puede tardar más de lo esperado"
    + (demora.nota ? `: ${demora.nota.replace(/[.\s]+$/, "")}.` : ".")
    + " Te avisamos por WhatsApp o correo cualquier novedad.";
}

// ---------- CÓRDOBAS "CERRADOS" ----------
// Convierte USD a córdobas y REDONDEA HACIA ARRIBA al múltiplo de 10
// (ej. 2964 → 2970). Se usa en el encargo para que el total quede redondo.
function cordobasCerrados(usd){
  return Math.ceil((Number(usd) || 0) * HAUSLINE_EXCHANGE_RATE / 10) * 10;
}

// ---------- CUENTAS DE PAGO (encargos por transferencia) ----------
// El cliente ve estas cuentas al encargar para hacer la transferencia.
// Para cambiar una cuenta, edita solo esta lista.
// NOTA: todas las cuentas son de Alejandro Uzziel Linares Flores.
const HAUSLINE_CUENTAS = [
  { banco: "LAFISE",         moneda: "Dólares",  numero: "133254039", titular: "Alejandro Uzziel Linares Flores" },
  { banco: "LAFISE",         moneda: "Córdobas", numero: "138038710", titular: "Alejandro Uzziel Linares Flores" },
  { banco: "BAC",            moneda: "Dólares",  numero: "374570968", titular: "Alejandro Uzziel Linares Flores" },
  { banco: "BAC",            moneda: "Córdobas", numero: "374570869", titular: "Alejandro Uzziel Linares Flores" },
];

// ============================================================
//  BANNERS · AVISO EMERGENTE AL ABRIR LA WEB
//  Muestra un aviso CHICO (no ocupa toda la pantalla) con la imagen de la
//  promo y una X para cerrar. Aparece una vez por visita. Si tocan la imagen
//  y pusiste "enlace", los lleva ahí (ej. la tienda con un cupón).
//
//  PARA AGREGAR UN BANNER:
//   1) Subí la imagen a la carpeta  imgP/banners/  (ideal vertical, ~800x1000).
//   2) Agregá una línea acá con su ruta. Ejemplos:
//        { imagen: "imgP/banners/promo1.jpg", enlace: "" },
//        { imagen: "imgP/banners/verano.jpg", enlace: "/?cupon=HAUS-VERANO" },
//  Si ponés varias, se turnan solas con puntitos. Dejá la lista vacía [] para
//  no mostrar ningún aviso.
// ============================================================
const HAUSLINE_BANNERS = [//
   { imagen: "", enlace: "" },
];

// ============================================================
//  SUPABASE  (para el contador REAL de visualizaciones)
//  Pega aquí los datos de tu proyecto Supabase.
//  Mientras estén vacíos, la web funciona igual pero sin contador.
//  NUNCA pegues la clave service_role, SOLO la anon (pública).
// ============================================================
const SUPABASE_URL      = "https://epslwaxjemlysqtubbfu.supabase.co/rest/v1/";  
const SUPABASE_ANON_KEY = "sb_publishable_bASR2lpLTORx-1pWbwvgiQ_fsjAuX2r";

// "Mi cuenta": si el cliente tiene la sesión abierta (hauslineshopni.es/cuenta), las llamadas
// que CREAN el encargo van con su token para que el pedido quede asociado a su cuenta. Sin
// sesión (o si venció), se usa la llave pública y el checkout funciona exactamente igual.
function hauslineAuthHeader(){
  try{
    var s = JSON.parse(localStorage.getItem("sb-epslwaxjemlysqtubbfu-auth-token") || "null");
    if(s && s.access_token && s.expires_at && s.expires_at * 1000 > Date.now() + 60000) return "Bearer " + s.access_token;
  }catch(e){}
  return "Bearer " + SUPABASE_ANON_KEY;
}
// Crea el encargo con el token de la cuenta; si el servidor lo rechaza (sesión vencida, hora
// del teléfono desfasada), reintenta con la llave pública para que la compra NUNCA falle.
function hauslineFetchSolicitud(url, opts){
  return fetch(url, opts).then(function(r){
    var anon = "Bearer " + SUPABASE_ANON_KEY;
    if(r.status === 401 && opts && opts.headers && opts.headers.Authorization && opts.headers.Authorization !== anon){
      return fetch(url, Object.assign({}, opts, { headers: Object.assign({}, opts.headers, { Authorization: anon }) }));
    }
    return r;
  });
}  

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

// ---------- CUENTAS DE PAGO DESDE EL PANEL ----------
// En el panel (Mi cuenta → tarjetas) cada cuenta tiene el botón "Visible a clientes". Si hay
// alguna encendida, esas REEMPLAZAN la lista HAUSLINE_CUENTAS de arriba en toda la tienda
// (checkout, pago del encargo). Si falla la red o no hay ninguna encendida, queda la de arriba.
(function cargarCuentasDelPanel(){
  if(typeof fetch !== "function" || !SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try{
    fetch(SUPABASE_URL + "rpc/cuentas_pago_publicas", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
      body: "{}"
    }).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if(!d || !d.configurado || !Array.isArray(d.cuentas)) return;
      var nuevas = d.cuentas.filter(function(c){ return c && c.numero; }).map(function(c){
        return { banco: String(c.banco || ""), moneda: String(c.moneda || ""), numero: String(c.numero), titular: String(c.titular || "") };
      });
      HAUSLINE_CUENTAS.splice.apply(HAUSLINE_CUENTAS, [0, HAUSLINE_CUENTAS.length].concat(nuevas));
      try{ document.dispatchEvent(new CustomEvent("hausline:cuentas")); }catch(e){}
    }).catch(function(){});
  }catch(e){}
})();
