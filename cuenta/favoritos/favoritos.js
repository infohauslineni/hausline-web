/* Mi cuenta · Lista de deseos. Sincroniza el corazón de la tienda (este navegador) con la
   cuenta (cualquier teléfono) y muestra precio/foto actuales del catálogo. */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var CORAZON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  var lista = [];

  // Datos actuales del producto en el catálogo de la tienda (productos.js + panel).
  function datosDe(codigo) {
    if (typeof productos === "undefined") return null;
    var p = null;
    for (var i = 0; i < productos.length; i++) if (String(productos[i].codigo) === String(codigo)) { p = productos[i]; break; }
    if (!p) return null;
    var cotizar = typeof necesitaCotizar === "function" && necesitaCotizar(p);
    var precio = cotizar ? null : (typeof precioVigente === "function" ? precioVigente(p) : Number(p.precio) || null);
    return { nombre: p.nombreReal || p.nombre || String(codigo), marca: p.marca || null, precio: precio, imagen: p.imagen || null };
  }
  function precioTexto(v) {
    if (v == null) return "Precio a consultar";
    var moneda = "USD";
    try { moneda = localStorage.getItem("hausline_moneda") || "USD"; } catch (e) {}
    if (moneda === "NIO" && typeof HAUSLINE_EXCHANGE_RATE !== "undefined") return "C$ " + Math.round(Number(v) * HAUSLINE_EXCHANGE_RATE).toLocaleString("en-US");
    return C.monto(v);
  }
  var urlProducto = function (c) { return "/p/" + encodeURIComponent(c) + "/"; };

  function pintar() {
    var html = '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:24px;margin:0">Lista de deseos</h1><p class="cta-sub" style="margin-top:4px;font-size:14px">Tus productos favoritos, siempre a mano.</p>';
    if (!lista.length) {
      html += '<div class="cta-card cta-vacio" style="margin-top:18px">' + CORAZON.replace("<svg", '<svg style="width:28px;height:28px;fill:none;stroke:var(--texto-3);stroke-width:1.4;margin:0 auto 10px;display:block"') +
        '<p style="font-weight:600">Tu lista de deseos está vacía</p><p class="cta-nota" style="font-size:13.5px;margin-top:6px">Tocá el corazón en cualquier producto de la tienda y aparece aquí, en todos tus dispositivos.</p><a class="cta-btn auto" style="margin-top:16px" href="/">Explorar la tienda</a></div>';
    } else {
      html += '<div style="margin-top:16px">' + lista.map(function (f) {
        var d = datosDe(f.codigo) || {};
        var foto = C.img(d.imagen || f.imagen);
        return '<article class="cta-card cta-fav">' +
          '<a class="cta-foto" href="' + urlProducto(f.codigo) + '">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA) + "</a>" +
          '<div style="min-width:0;flex:1;display:flex;flex-direction:column">' +
            '<div style="display:flex;gap:8px"><a href="' + urlProducto(f.codigo) + '" style="min-width:0;flex:1;text-decoration:none"><b style="display:block;font-weight:600">' + esc(d.marca || f.marca || "") + '</b><span class="cta-prod" style="margin:0">' + esc(d.nombre || f.nombre) + "</span></a>" +
            '<button type="button" class="cta-fav-cora" data-quitar="' + esc(f.codigo) + '" aria-label="Quitar de la lista de deseos">' + CORAZON + "</button></div>" +
            '<span style="margin-top:4px;font-weight:500">' + esc(precioTexto(d.precio !== undefined ? d.precio : f.precio)) + "</span>" +
            '<div style="margin-top:auto;padding-top:10px;display:flex;align-items:center;gap:8px"><a class="cta-btn-borde" href="' + urlProducto(f.codigo) + '">Agregar al carrito</a><span style="flex:1"></span>' +
            '<button type="button" class="cta-ico" data-menu="' + esc(f.codigo) + '" aria-label="Más opciones" style="width:34px;height:34px">⋯</button></div>' +
          "</div></article>";
      }).join("") + "</div>";
    }
    main.innerHTML = html;
    main.querySelectorAll("[data-quitar]").forEach(function (b) { b.addEventListener("click", function () { quitar(b.dataset.quitar); }); });
    main.querySelectorAll("[data-menu]").forEach(function (b) { b.addEventListener("click", function () { menu(b.dataset.menu); }); });
  }

  async function quitar(codigo) {
    var antes = lista.slice();
    lista = lista.filter(function (f) { return f.codigo !== codigo; });
    pintar();
    try { await C.quitarFavorito(codigo); C.aviso("Quitado de tu lista de deseos."); }
    catch (e) { lista = antes; pintar(); C.aviso("No se pudo quitar. Intentá de nuevo.", "error"); }
  }

  function menu(codigo) {
    var f = lista.filter(function (x) { return x.codigo === codigo; })[0];
    if (!f) return;
    var h = C.hoja('<div class="cta-card cta-filas">' +
      '<a class="cta-fila" href="' + urlProducto(codigo) + '"><span class="t">Ver producto</span></a>' +
      '<button type="button" class="cta-fila" id="mCompartir"><span class="t">Compartir</span></button>' +
      '<button type="button" class="cta-fila peligro" id="mQuitar"><span class="t">Quitar de la lista</span></button></div>' +
      '<button type="button" class="cta-link" style="display:block;margin:14px auto 0" id="mCancelar">Cancelar</button>', ((f.marca || "") + " " + f.nombre).trim());
    h.panel.querySelector("#mCancelar").addEventListener("click", h.cerrar);
    h.panel.querySelector("#mQuitar").addEventListener("click", function () { h.cerrar(); quitar(codigo); });
    h.panel.querySelector("#mCompartir").addEventListener("click", async function () {
      var url = location.origin + urlProducto(codigo);
      h.cerrar();
      try {
        if (navigator.share) await navigator.share({ title: ((f.marca || "") + " " + f.nombre).trim(), url: url });
        else { await navigator.clipboard.writeText(url); C.aviso("Enlace copiado."); }
      } catch (e) { /* cancelado */ }
    });
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("favoritos");
    // Incluye también los productos cargados desde el panel de la tienda.
    if (typeof cargarProductosDelPanel === "function") { try { await cargarProductosDelPanel(); } catch (e) {} }
    try { lista = await C.sincronizarFavoritos(datosDe); pintar(); }
    catch (err) { main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tu lista de deseos</p><p class="cta-nota">' + esc(C.mensajeError(err)) + "</p></div>"; }
  }
  iniciar();
})();
