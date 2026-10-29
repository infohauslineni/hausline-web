// TEMA NAVIDAD + FECHA LÍMITE PARA RECIBIR ANTES DE NAVIDAD.
// Se prende solo el 1 de noviembre de 2026 (cuando termina Halloween) y se apaga solo el 25 de
// diciembre (hora de Nicaragua). Para verlo antes: ?navidad=1. Para simular otra fecha:
// ?navidad=2026-11-29. Para apagarlo: ACTIVO = false.
//
// La fecha límite se calcula con los MISMOS tiempos que muestra la tienda (config.js:
// HAUSLINE_ENVIO, preparación real de cada marca/producto y demoras), contando hacia atrás desde
// el 22 de diciembre (entrega antes de Navidad, con margen). Con los tiempos generales:
//   · Envío estándar (20 a 25 días) → encargar a más tardar el 27 de noviembre.
//   · Envío rápido   (15 a 20 días) → encargar a más tardar el 2 de diciembre.
//   · Entrega inmediata / Llega pronto → hasta el 23 de diciembre.
(function(){
  "use strict";
  var ACTIVO = true;
  var DESDE = new Date("2026-11-01T00:00:00-06:00"), HASTA = new Date("2026-12-25T00:00:00-06:00");
  var ENTREGA = new Date("2026-12-22T12:00:00-06:00"); // recibir a más tardar este día
  var q = location.search, sim = (q.match(/[?&]navidad=(\d{4}-\d{2}-\d{2})/) || [])[1];
  var ahora = sim ? new Date(sim + "T12:00:00-06:00") : new Date();
  var forzado = /[?&]navidad=/.test(q);
  if(!ACTIVO || (!forzado && (ahora < DESDE || ahora >= HASTA))) return;
  document.documentElement.classList.add("hl-navidad");

  var DIA = 86400000;
  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  function fecha(d){ return d.getDate() + " de " + MESES[d.getMonth()]; }
  // Día (en Nicaragua) de una fecha, a mediodía, para comparar sin líos de hora.
  function dia(d){ var n = new Date(d.getTime() - 6 * 3600000); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), 18)); }
  var hoy = dia(ahora);

  // Fecha límite para un método de envío (y producto, si se sabe).
  function limite(clave, producto){
    var m = (typeof HAUSLINE_ENVIO !== "undefined" && HAUSLINE_ENVIO[clave]) || null;
    if(!m) return null;
    var maxDias = m.diasMax;
    try{
      var prep = producto && typeof preparacionDe === "function" ? preparacionDe(producto) : null;
      var dem = producto && typeof demoraDe === "function" ? demoraDe(producto) : null;
      if(typeof rangoEntrega === "function") maxDias = rangoEntrega(m, dem ? dem.extra : 0, prep).max;
    }catch(e){}
    return dia(new Date(ENTREGA.getTime() - maxDias * DIA));
  }
  var limEst = limite("estandar"), limRap = limite("rapido");
  var faltan = function(d){ return Math.round((d - hoy) / DIA); };

  // Banda de mensajes (antes que los de siempre).
  try{
    if(typeof mensajesBanda !== "undefined" && Array.isArray(mensajesBanda)){
      var msj = !limEst ? [] : hoy <= limEst
        ? ["🎄 Encargue antes del " + fecha(limEst) + " y le llega antes de Navidad", "Envío rápido: hasta el " + fecha(limRap)]
        : hoy <= limRap
        ? ["🎄 Con envío rápido le llega antes de Navidad · hasta el " + fecha(limRap), "Entrega inmediata: llega antes de Navidad"]
        : ["🎄 Para Navidad: Entrega inmediata y Llega pronto", "Le llega antes del 24 de diciembre"];
      mensajesBanda.unshift.apply(mensajesBanda, msj);
    }
  }catch(e){}

  function franja(){
    if(!limEst || document.querySelector(".nv-strip")) return;
    var f = faltan(limEst), fr = faltan(limRap), html;
    if(hoy <= limEst){
      var cuando = f === 0 ? "<b>Hoy es el último día</b>" : f === 1 ? "<b>Falta 1 día</b>" : "<b>Faltan " + f + " días</b>";
      html = "🎄 <span class=\"nv-largo\">" + cuando + " para encargar y recibirlo <b>antes de Navidad</b> · envío estándar hasta el " + fecha(limEst) + "</span>" +
        "<span class=\"nv-corto\">" + cuando + " · llega antes de Navidad</span>";
    } else if(hoy <= limRap){
      var cuandoR = fr === 0 ? "<b>Último día</b>" : fr === 1 ? "<b>Falta 1 día</b>" : "<b>Faltan " + fr + " días</b>";
      html = "🎄 <span class=\"nv-largo\">" + cuandoR + ": con <b>envío rápido</b> le llega antes de Navidad · encargue hasta el " + fecha(limRap) + "</span>" +
        "<span class=\"nv-corto\">" + cuandoR + " · envío rápido para Navidad</span>";
    } else {
      html = "🎄 <span class=\"nv-largo\">Para Navidad: <b>Entrega inmediata</b> y <b>Llega pronto</b> le llegan antes del 24 de diciembre</span>" +
        "<span class=\"nv-corto\"><b>Entrega inmediata</b> · llega para Navidad</span> <a href=\"#entrega-inmediata\">Ver</a>";
    }
    var div = document.createElement("div");
    div.className = "nv-strip"; div.setAttribute("role", "note"); div.innerHTML = html;
    document.body.insertBefore(div, document.body.firstChild);
  }

  function portada(){
    var hero = document.querySelector(".hl-hero");
    if(!hero || hero.querySelector(".nv-nieve")) return;
    var copos = "";
    for(var i = 0; i < 18; i++){
      copos += "<i style=\"left:" + ((i * 53) % 100) + "%;animation-delay:" + (-(i * 0.73) % 9).toFixed(2) + "s;animation-duration:" + (7 + (i % 5)) + "s;font-size:" + (10 + (i % 4) * 4) + "px\">❄</i>";
    }
    hero.insertAdjacentHTML("afterbegin", "<div class=\"nv-nieve\" aria-hidden=\"true\">" + copos + "</div>");
    var ceja = hero.querySelector(".hl-hero-eyebrow");
    if(ceja) ceja.textContent = "🎄 Temporada navideña · 2026";
  }

  // Aviso en el producto: hasta cuándo encargarlo para que llegue antes de Navidad.
  function notaProducto(){
    var cont = document.getElementById("modalEntrega");
    if(!cont || typeof productoActual === "undefined" || !productoActual) return;
    var vieja = cont.querySelector(".nv-nota"); if(vieja) vieja.remove();
    var texto;
    if(typeof modoInmediataActual !== "undefined" && modoInmediataActual) texto = "Entrega inmediata: lo recibe <b>antes de Navidad</b>.";
    else if(typeof modoEnCaminoActual !== "undefined" && modoEnCaminoActual) texto = "Ya viene en camino: apártelo y llega <b>para Navidad</b>.";
    else {
      var le = limite("estandar", productoActual), lr = limite("rapido", productoActual);
      if(!le || !lr) return;
      if(hoy <= le) texto = "Para recibirlo <b>antes de Navidad</b>, encárguelo a más tardar el <b>" + fecha(le) + "</b> (envío estándar) o el <b>" + fecha(lr) + "</b> con envío rápido.";
      else if(hoy <= lr) texto = "Para recibirlo <b>antes de Navidad</b>, elija <b>envío rápido</b> y encárguelo a más tardar el <b>" + fecha(lr) + "</b>.";
      else texto = "Por encargo ya no llega antes de Navidad. Para regalar, vea <b>Entrega inmediata</b> y <b>Llega pronto</b>.";
    }
    var div = document.createElement("div");
    div.className = "nv-nota"; div.setAttribute("role", "note");
    div.innerHTML = "<span aria-hidden=\"true\">🎄</span><span>" + texto + "</span>";
    cont.appendChild(div);
  }
  // Se engancha a la función de la tienda que pinta la entrega estimada del producto.
  function enganchar(){
    if(typeof actualizarEnvioUI !== "function" || actualizarEnvioUI.__navidad) return false;
    var original = actualizarEnvioUI;
    actualizarEnvioUI = function(){ var r = original.apply(this, arguments); try{ notaProducto(); }catch(e){} return r; };
    actualizarEnvioUI.__navidad = true;
    return true;
  }

  function arrancar(){ franja(); portada(); if(!enganchar()) setTimeout(enganchar, 800); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
