// TEMA HALLOWEEN: se prende solo del 25 al 31 de octubre de 2026 (hora de Nicaragua) y se apaga
// solo el 1 de noviembre. Para verlo antes o después: ?halloween=1. Para apagarlo: ACTIVO = false.
// Agrega la clase hl-halloween (estilos en halloween.css), la franja del cupón, mensajes en la
// banda y la decoración de la portada. No toca precios: el descuento es el cupón HALLOWEEN10
// (30 y 31 de octubre), que ya valida la tienda.
(function(){
  "use strict";
  var ACTIVO = true;
  var DESDE = new Date("2026-10-25T00:00:00-06:00"), HASTA = new Date("2026-11-01T00:00:00-06:00");
  var SALE_DESDE = new Date("2026-10-30T00:00:00-06:00");
  var ahora = new Date();
  var forzado = /[?&]halloween=1\b/.test(location.search);
  if(!ACTIVO || (!forzado && (ahora < DESDE || ahora >= HASTA))) return;

  document.documentElement.classList.add("hl-halloween");
  var enSale = ahora >= SALE_DESDE || /[?&]halloween=sale\b/.test(location.search);
  var ultimoDia = ahora >= new Date("2026-10-31T00:00:00-06:00");

  // Mensajes de la banda (van antes que los de siempre).
  try{
    if(typeof mensajesBanda !== "undefined" && Array.isArray(mensajesBanda)){
      mensajesBanda.unshift(
        enSale ? "🎃 Halloween Sale · 10 % en todo con HALLOWEEN10" : "🎃 Halloween Sale · 30 y 31 de octubre",
        "Comente TRATO en nuestro Instagram y le enviamos un cupón",
        "🦇 Edición Halloween HAUSLINE"
      );
    }
  }catch(e){}

  function franja(){
    if(document.querySelector(".hw-strip")) return;
    var div = document.createElement("div");
    div.className = "hw-strip";
    div.setAttribute("role", "note");
    div.innerHTML = enSale
      ? "🎃 <span class=\"hw-largo\">" + (ultimoDia ? "<b>ÚLTIMO DÍA</b> · " : "") + "Halloween Sale: <b>10 % en toda la tienda</b> con el código <b>HALLOWEEN10</b></span><span class=\"hw-corto\">" + (ultimoDia ? "<b>ÚLTIMO DÍA</b> · " : "") + "<b>10 % en todo</b> · HALLOWEEN10</span> <a href=\"/?cupon=HALLOWEEN10\">Usar cupón</a>"
      : "🎃 <span class=\"hw-largo\">Se viene el <b>Halloween Sale</b>: 30 y 31 de octubre, <b>10 % en toda la tienda</b></span><span class=\"hw-corto\"><b>Halloween Sale</b> · 30 y 31 de octubre</span>";
    document.body.insertBefore(div, document.body.firstChild);
  }

  var TELA = '<svg class="hw-deco hw-tela{CL}" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M0 0 L120 120 M0 0 L60 120 M0 0 L120 60 M0 0 L0 120 M0 0 L120 0"/><path d="M0 22 Q11 18 20 20 Q19 11 22 0"/><path d="M0 44 Q22 36 40 40 Q36 22 44 0"/><path d="M0 70 Q34 56 60 62 Q56 34 70 0"/><path d="M0 98 Q48 78 84 86 Q78 48 98 0"/></svg>';
  var ARANA = '<svg class="hw-deco hw-arana" viewBox="0 0 28 130" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><line x1="14" y1="0" x2="14" y2="104" stroke="currentColor" stroke-width="1.2"/><g fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><ellipse cx="14" cy="114" rx="7" ry="8"/><circle cx="14" cy="104" r="4.5"/><path d="M8 110 L1 104 M8 114 L0 115 M8 118 L2 126 M20 110 L27 104 M20 114 L28 115 M20 118 L26 126" fill="none"/></g></svg>';
  var BAT = function(x, y, s){ return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path class="bat" d="M0 6 C4 0 9 1 12 5 C13 2 15 1 16 3 C17 1 19 2 20 5 C23 1 28 0 32 6 C28 5 25 7 24 10 C21 8 19 9 16 12 C13 9 11 8 8 10 C7 7 4 5 0 6 Z" fill="#E8650F"/></g>'; };
  var MURCIELAGOS = '<svg class="hw-deco hw-murcielagos" viewBox="0 0 300 60" aria-hidden="true">' + BAT(6, 30, 1.5) + BAT(126, 6, 1.9) + BAT(244, 34, 1.3) + '</svg>';

  function portada(){
    var hero = document.querySelector(".hl-hero");
    if(!hero || hero.querySelector(".hw-deco")) return;
    hero.insertAdjacentHTML("afterbegin", TELA.replace("{CL}", "") + TELA.replace("{CL}", " der") + ARANA + MURCIELAGOS);
    var ceja = hero.querySelector(".hl-hero-eyebrow");
    if(ceja) ceja.textContent = "🎃 Edición Halloween · 2026";
  }

  function arrancar(){ franja(); portada(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
