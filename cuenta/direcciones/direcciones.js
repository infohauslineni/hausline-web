/* Mi cuenta · Direcciones: varias direcciones con mapa, predeterminada, costo de envío, editar/eliminar. */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var dirs = [], tarifas = [];
  var PIN = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;flex:none" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  function tarjeta(d) {
    var c = C.costoDelivery(d, tarifas);
    var etiqueta = d.predeterminada ? "Dirección principal" : d.tipo === "trabajo" ? "Trabajo" : "Otra dirección";
    return '<article class="cta-card" style="overflow:hidden">' +
      '<div style="padding:16px 16px 12px"><div style="display:flex;align-items:center;gap:8px">' + PIN + '<b style="flex:1;font-weight:600;font-size:14px">' + esc(etiqueta) + "</b>" + (d.predeterminada ? '<span class="cta-pill">Predeterminada</span>' : "") + "</div>" +
      '<a href="/cuenta/direccion/?id=' + encodeURIComponent(d.id) + '" style="display:block;text-decoration:none;margin-top:8px"><b style="display:block;font-weight:600">' + esc(d.nombre) + "</b>" +
      C.lineasDireccion(d).map(function (l) { return '<span class="cta-prod" style="margin:0;white-space:normal">' + esc(l) + "</span>"; }).join("") + "</a></div>" +
      '<div style="padding:0 16px"><div data-mapa="' + esc(d.id) + '"></div></div>' +
      '<div class="cta-kv" style="margin:12px 16px 0;border-top:0;padding-top:0"><span>Costo de envío estimado</span><b>' + esc(c != null ? C.monto(c) : "A cotizar") + "</b></div>" +
      '<div class="cta-botones" style="padding:12px 16px 16px"><a class="cta-btn linea chico" href="/cuenta/direccion/?id=' + encodeURIComponent(d.id) + '">Editar</a><button type="button" class="cta-btn linea chico" data-borrar="' + esc(d.id) + '">Eliminar</button></div>' +
      (d.predeterminada ? "" : '<button type="button" class="cta-link" style="display:block;margin:-6px auto 14px" data-pred="' + esc(d.id) + '">Establecer como predeterminada</button>') +
      "</article>";
  }

  function pintar() {
    main.innerHTML = '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:24px;margin:0">Direcciones</h1><p class="cta-sub" style="margin-top:4px;font-size:14px">Gestioná tus direcciones de envío y facturación.</p>' +
      '<div style="margin-top:16px;display:grid;gap:12px">' + (dirs.length ? dirs.map(tarjeta).join("") :
        '<div class="cta-card cta-vacio"><p style="font-weight:600">Todavía no guardaste direcciones</p><p class="cta-nota" style="font-size:13.5px;margin-top:6px">Guardá tu casa, trabajo u otro lugar para pedir el envío de tus pedidos con un toque.</p></div>') + "</div>" +
      '<a class="cta-btn" style="margin-top:18px" href="/cuenta/direccion/">Agregar nueva dirección</a>';
    dirs.forEach(function (d) { var el = main.querySelector('[data-mapa="' + d.id + '"]'); if (el) C.mapa(el, { lat: d.lat, lng: d.lng }); });
    main.querySelectorAll("[data-borrar]").forEach(function (b) { b.addEventListener("click", function () { borrar(b.dataset.borrar); }); });
    main.querySelectorAll("[data-pred]").forEach(function (b) {
      b.addEventListener("click", async function () {
        try { await C.hacerPredeterminada(b.dataset.pred); await cargar(); C.aviso("Dirección predeterminada actualizada."); }
        catch (e) { C.aviso(C.mensajeError(e), "error"); }
      });
    });
  }

  function borrar(id) {
    var d = dirs.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    var h = C.hoja('<p class="cta-sub" style="margin:0;font-size:14px"><b style="color:var(--texto)">' + esc(d.nombre) + "</b> · " + esc(d.direccion + ", " + d.ciudad) + "</p>" +
      (d.predeterminada ? '<p class="cta-nota">Es tu dirección predeterminada: otra pasará a serlo.</p>' : "") +
      '<button type="button" class="cta-btn" id="sBorrar" style="margin-top:18px;background:var(--rojo);border-color:var(--rojo)">Eliminar dirección</button><button type="button" class="cta-link" style="display:block;margin:12px auto 0" id="sCancelar">Cancelar</button>', "¿Eliminar esta dirección?");
    h.panel.querySelector("#sCancelar").addEventListener("click", h.cerrar);
    h.panel.querySelector("#sBorrar").addEventListener("click", async function () {
      try { await C.eliminarDireccion(id); h.cerrar(); await cargar(); C.aviso("Dirección eliminada."); }
      catch (e) { C.aviso(C.mensajeError(e), "error"); }
    });
  }

  async function cargar() {
    var r = await Promise.all([C.direcciones(), C.tarifas()]);
    dirs = r[0]; tarifas = r[1];
    pintar();
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    try { await cargar(); }
    catch (err) { main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tus direcciones</p><p class="cta-nota">' + esc(C.mensajeError(err)) + "</p></div>"; }
  }
  iniciar();
})();
