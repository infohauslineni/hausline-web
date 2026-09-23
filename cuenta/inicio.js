/* Mi cuenta · inicio: saludo + Mis pedidos (con filtros). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var $ = function (id) { return document.getElementById(id); };
  var pedidos = [];
  var filtro = "todos";
  var ICONO_CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';

  function tarjeta(p) {
    var e = C.etapa(p.estado_codigo);
    var foto = C.img(p.imagen);
    var prod = [p.marca, p.producto].filter(Boolean).join(" · ") || "Pedido";
    if (p.items > 1) prod += " · +" + (p.items - 1);
    return '<a class="cta-card cta-pedido" href="/cuenta/pedido/?id=' + encodeURIComponent(p.codigo) + '">' +
      '<span class="cta-foto">' + (foto ? '<img src="' + C.esc(foto) + '" alt="" loading="lazy">' : ICONO_CAJA) + "</span>" +
      '<span class="cta-pedido-info">' +
        '<span class="cta-cod">Pedido #' + C.esc(p.codigo) + "</span>" +
        '<span class="cta-prod">' + C.esc(prod) + "</span>" +
        '<span class="cta-prod" style="color:var(--texto-3)">' + C.esc(C.fecha(p.fecha_pedido)) + "</span>" +
        '<span class="cta-estado' + (e.id === "cancelado" ? " cancelado" : "") + '"><i></i>' + C.esc(e.label) + "</span>" +
      "</span>" +
      '<span class="cta-ver">Ver pedido →</span>' +
    "</a>";
  }

  function pintar() {
    var visibles = pedidos.filter(function (p) { return filtro === "todos" || C.grupo(p.estado_codigo) === filtro; });
    if (!visibles.length) {
      $("lista").innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">' +
        (filtro === "todos" ? "Todavía no hay pedidos en tu cuenta" : "No hay pedidos en esta etapa") + "</p>" +
        (filtro === "todos" ? '<p class="cta-nota" style="font-size:13.5px;margin-top:6px">Cuando compres con este correo, tus pedidos aparecen aquí.</p><a class="cta-btn auto" style="margin-top:18px" href="/">Ir a la tienda</a>' : "") +
        "</div>";
      return;
    }
    $("lista").innerHTML = visibles.map(tarjeta).join("");
  }

  document.querySelectorAll(".cta-chip").forEach(function (b) {
    b.addEventListener("click", function () {
      filtro = b.dataset.f;
      document.querySelectorAll(".cta-chip").forEach(function (x) { x.classList.toggle("on", x === b); });
      pintar();
    });
  });
  $("salir").addEventListener("click", C.salir);

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    $("correo").textContent = s.user.email || "";
    var nombre = (s.user.user_metadata && s.user.user_metadata.nombre) || "";
    $("hola").textContent = "Hola" + (nombre ? ", " + nombre.split(/\s+/)[0] : "");
    try {
      var c = await C.cuenta();
      if (c && c.nombre) $("hola").textContent = "Hola, " + c.nombre.split(/\s+/)[0];
    } catch (e) { /* el saludo genérico basta */ }
    try {
      pedidos = await C.misPedidos();
      pintar();
    } catch (err) {
      $("lista").innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tus pedidos</p><p class="cta-nota">' + C.esc(C.mensajeError(err)) + '</p><button class="cta-btn auto linea" style="margin-top:16px" type="button" id="reintentar">Reintentar</button></div>';
      $("reintentar").addEventListener("click", function () { location.reload(); });
    }
  }
  iniciar();
})();
