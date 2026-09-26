/* ============================================================
   HAUSLINE — Aviso silencioso de problemas del cliente
   Anota en la base (RPC registrar_evento_cliente) lo que le pasa
   al cliente: errores que vio en pantalla, fallas de JavaScript e
   ingresos/registros. El panel lo muestra en "Salud de clientes",
   así nos enteramos aunque el cliente no diga nada.
   Nunca se envían contraseñas ni datos de pago. Si falla, no pasa
   nada: jamás interrumpe la página.
   ============================================================ */
(function () {
  "use strict";
  if (window.HauslineSalud) return;

  var RPC = "https://epslwaxjemlysqtubbfu.supabase.co/rest/v1/rpc/registrar_evento_cliente";
  var KEY = "sb_publishable_bASR2lpLTORx-1pWbwvgiQ_fsjAuX2r"; // llave PÚBLICA (anon)
  var SESION_KEY = "sb-epslwaxjemlysqtubbfu-auth-token";
  var ruta = location.pathname;
  var origen = /^\/cuenta(\/|$)/.test(ruta) ? "cuenta" : /^\/checkout(\/|$)/.test(ruta) ? "checkout" : "tienda";
  var MAX_POR_PAGINA = 25;
  var enviados = {};
  var total = 0;

  // Identificador de la visita (solo esta pestaña): agrupa lo que le pasó a un mismo cliente.
  var visita = (function () {
    try {
      var v = sessionStorage.getItem("hausline_visita");
      if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem("hausline_visita", v); }
      return v;
    } catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  })();

  function dispositivo() {
    var ua = navigator.userAgent || "";
    var so = /iPhone|iPad|iPod/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : "Otro";
    var nav = /Instagram/.test(ua) ? "Instagram" : /FBAN|FBAV|FB_IAB/.test(ua) ? "Facebook" : /EdgA?\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung" :
      /CriOS|Chrome\//.test(ua) ? "Chrome" : /FxiOS|Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Otro";
    return so + " · " + nav + " · " + (window.innerWidth || 0) + "px";
  }

  // Token del cliente con sesión en Mi cuenta (para saber de qué cuenta vino). Sin sesión válida → anónimo.
  function token() {
    try {
      var s = JSON.parse(localStorage.getItem(SESION_KEY) || "null");
      if (s && s.access_token && s.expires_at && s.expires_at * 1000 > Date.now() + 30000) return s.access_token;
    } catch (e) {}
    return KEY;
  }

  function registrar(nombre, o) {
    o = o || {};
    try {
      var mensaje = o.mensaje != null ? String(o.mensaje).slice(0, 500) : null;
      var clave = nombre + "|" + (mensaje || "");
      if (enviados[clave] || total >= MAX_POR_PAGINA) return;
      enviados[clave] = true; total++;
      fetch(RPC, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", apikey: KEY, Authorization: "Bearer " + token() },
        body: JSON.stringify({
          p_origen: o.origen || origen, p_tipo: o.tipo === "error" ? "error" : "evento", p_nombre: nombre,
          p_pagina: (ruta + location.search).slice(0, 300), p_mensaje: mensaje, p_detalle: o.detalle || null,
          p_visita: visita, p_dispositivo: dispositivo(),
        }),
      }).catch(function () {});
    } catch (e) {}
  }
  function error(nombre, mensaje, detalle) { registrar(nombre, { tipo: "error", mensaje: mensaje, detalle: detalle }); }

  // Fallas de JavaScript de NUESTROS archivos (se ignoran extensiones y scripts de terceros).
  function nuestro(archivo) { return !archivo || archivo.indexOf(location.origin) === 0 || /cdn\.jsdelivr\.net\/npm\/@supabase/.test(archivo); }
  window.addEventListener("error", function (e) {
    if (!e || !e.message || e.message === "Script error." || !nuestro(e.filename)) return;
    error("js_error", e.message, { archivo: String(e.filename || "").replace(location.origin, "").split("?")[0], linea: e.lineno || null });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    var m = r && (r.message || r.error_description) || (typeof r === "string" ? r : "");
    if (!m || /extension|chrome-extension|moz-extension/i.test(m + (r && r.stack || ""))) return;
    error("promesa_error", m);
  });

  window.HauslineSalud = { registrar: registrar, error: error, visita: visita, origen: origen };
})();
