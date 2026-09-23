// ============================================================
//  META PIXEL (Facebook / Instagram Ads) — HAUSLINE
// ============================================================
// Carga la librería de Meta y dispara PageView en cada página del catálogo.
// Los demás eventos estándar se disparan desde el resto del sitio:
//   - ViewContent      → app.js, al abrir la ficha de un producto.
//   - AddToCart        → carrito.js, al agregar un producto al carrito.
//   - InitiateCheckout → checkout/checkout.js, al entrar al paso de info.
//   - Purchase         → checkout/checkout.js, al llegar a la confirmación.
// Para cambiar de pixel, editá solo este número (Meta Events Manager →
// Orígenes de datos → tu pixel).
const HAUSLINE_META_PIXEL_ID = "1068326725804506";

!function(f,b,e,v,n,t,s){
  if(f.fbq) return;
  n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
  if(!f._fbq) f._fbq=n;
  n.push=n; n.loaded=true; n.version="2.0"; n.queue=[];
  t=b.createElement(e); t.async=true; t.src=v;
  s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
}(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

fbq("init", HAUSLINE_META_PIXEL_ID);
fbq("track", "PageView");
