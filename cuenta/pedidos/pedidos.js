/* Mi cuenta · Mis pedidos (filtros Todos / En proceso / Enviados / Entregados). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var pedidos = [];
  var filtro = "todos";

  function tarjeta(p) {
    var e = C.etapa(p.estado_codigo);
    var foto = C.img(p.imagen);
    var prod = [p.marca, p.producto].filter(Boolean).join(" · ") || "Pedido";
    if (p.items > 1) prod += " · +" + (p.items - 1);
    return '<a class="cta-card cta-pedido" href="/cuenta/pedido/?id=' + encodeURIComponent(p.codigo) + '">' +
      '<span class="cta-foto">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA) + "</span>" +
      '<span class="cta-pedido-info"><span class="cta-cod">Pedido #' + esc(p.codigo) + "</span>" +
      '<span class="cta-prod" style="color:var(--texto-3)">' + esc(C.fecha(p.fecha_pedido)) + "</span>" +
      '<span class="cta-prod">' + esc(prod) + "</span>" +
      '<span class="cta-estado' + (e.id === "cancelado" ? " cancelado" : "") + '"><i></i>' + esc(e.label) + "</span></span>" +
      '<span class="cta-ver">Ver detalles ›</span></a>';
  }

  function pintarLista() {
    var vis = pedidos.filter(function (p) { return filtro === "todos" || C.grupo(p.estado_codigo) === filtro; });
    document.getElementById("lista").innerHTML = vis.length ? vis.map(tarjeta).join("") :
      '<div class="cta-card cta-vacio"><p style="font-weight:600">' + (filtro === "todos" ? "Todavía no hay pedidos en tu cuenta" : "No hay pedidos en esta etapa") + "</p>" +
      (filtro === "todos" ? '<p class="cta-nota" style="font-size:13.5px;margin-top:6px">Aparecen los pedidos hechos con el mismo correo de tu cuenta o comprados con tu sesión abierta. ¿Compraste con otro correo? Escribinos y lo asociamos.</p><a class="cta-btn auto linea" style="margin-top:16px" href="' + C.linkWhatsApp("Hola, quiero asociar mis pedidos a mi cuenta de HAUSLINE.") + '" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>' : "") + "</div>";
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    main.innerHTML = '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:24px">Mis pedidos</h1>' +
      '<div class="cta-chips" role="tablist">' + [["todos", "Todos"], ["proceso", "En proceso"], ["enviado", "Enviados"], ["entregado", "Entregados"]].map(function (f, i) {
        return '<button type="button" class="cta-chip' + (i === 0 ? " on" : "") + '" data-f="' + f[0] + '" role="tab">' + f[1] + "</button>";
      }).join("") + "</div>" +
      '<div id="lista" style="margin-top:14px" aria-live="polite"><div class="cta-skel"></div><div class="cta-skel"></div></div>';
    main.querySelectorAll(".cta-chip").forEach(function (b) {
      b.addEventListener("click", function () {
        filtro = b.dataset.f;
        main.querySelectorAll(".cta-chip").forEach(function (x) { x.classList.toggle("on", x === b); });
        pintarLista();
      });
    });
    try {
      pedidos = await C.misPedidos(); pintarLista();
      C.salud.registrar("vio_mis_pedidos", { detalle: { pedidos: pedidos.length } });
      // Los cambios que haga HAUSLINE en el panel aparecen solos, sin recargar.
      C.autoActualizar(async function () {
        var nuevos = await C.misPedidos();
        if (JSON.stringify(nuevos) !== JSON.stringify(pedidos)) { pedidos = nuevos; pintarLista(); }
      });
    }
    catch (err) { document.getElementById("lista").innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tus pedidos</p><p class="cta-nota">' + esc(C.mensajeError(err)) + "</p></div>"; }
  }
  iniciar();
})();
