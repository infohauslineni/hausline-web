/* Mi cuenta · Inicio: saludo, tarjeta destacada de pedidos, accesos y pedidos recientes. */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var FLECHA = '<svg viewBox="0 0 24 24" class="flecha" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  var ICON = {
    pedidos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    deseos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    datos: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    direcciones: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    corona: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/></svg>',
  };

  function diasHasta(f) {
    if (!f) return null;
    var ms = new Date(f + "T12:00:00").getTime() - Date.now();
    return Math.max(1, Math.ceil(ms / 86400000));
  }

  function hero(pedidos) {
    var activos = pedidos.filter(function (p) { var g = C.grupo(p.estado_codigo); return g === "proceso" || g === "enviado"; });
    var disponibles = activos.filter(function (p) { return (p.estado_codigo === "disponible_entrega" || p.estado_codigo === "pagado") && !p.entrega_solicitada_at; });
    var t, s, verde = false, href = "/cuenta/pedidos/", btn = "Ver detalles";
    if (disponibles.length) {
      t = disponibles.length === 1 ? "1 pedido disponible para entrega" : disponibles.length + " pedidos disponibles para entrega";
      s = "Ya está en Nicaragua · solicitá tu envío"; verde = true;
      href = "/cuenta/pedido/?id=" + encodeURIComponent(disponibles[0].codigo);
    } else if (activos.length) {
      t = activos.length === 1 ? "1 pedido en trámite" : activos.length + " pedidos en trámite";
      var prox = activos.filter(function (p) { return p.fecha_estimada; }).sort(function (a, b) { return a.fecha_estimada.localeCompare(b.fecha_estimada); })[0];
      var d = diasHasta(prox && prox.fecha_estimada);
      s = d ? "Llegará en aprox. " + d + (d === 1 ? " día" : " días") : "Te avisamos en cada etapa";
      if (activos.length === 1) href = "/cuenta/pedido/?id=" + encodeURIComponent(activos[0].codigo);
    } else {
      t = "No tenés pedidos en camino"; s = "Descubrí lo nuevo en la tienda."; href = "/"; btn = "Ir a la tienda";
    }
    return '<a class="cta-hero" href="' + href + '">' + CAJA + '<span class="cta-hero-sep"></span><span class="cta-hero-t"><small>Tus pedidos</small><b>' + esc(t) + "</b><span" + (verde ? ' class="verde"' : "") + ">" + esc(s) + '</span></span><span class="cta-hero-btn">' + btn + " ›</span></a>";
  }

  function mini(estado) {
    var g = C.grupo(estado);
    if (g === "cancelado") return '<span class="cta-estado cancelado" style="margin-top:8px"><i></i>Cancelado</span>';
    var idx = g === "proceso" ? 0 : g === "enviado" ? 1 : 2;
    return '<div class="cta-mini"><div class="cta-mini-riel"><i style="width:' + (idx * 50) + '%"></i></div><div class="cta-mini-pasos">' +
      ["En proceso", "Enviado", "Entregado"].map(function (n, i) { return '<span class="' + (i <= idx ? "on" : "") + '"><i></i>' + n + "</span>"; }).join("") + "</div></div>";
  }

  function reciente(p) {
    var foto = C.img(p.imagen);
    return '<a class="cta-card cta-pedido" href="/cuenta/pedido/?id=' + encodeURIComponent(p.codigo) + '">' +
      '<span class="cta-foto">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA) + "</span>" +
      '<span class="cta-pedido-info"><span class="cta-cod">Pedido #' + esc(p.codigo) + '</span><span class="cta-prod" style="color:var(--texto-3)">' + esc(C.fecha(p.fecha_pedido)) + "</span>" + mini(p.estado_codigo) + "</span>" +
      '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:var(--texto-3);stroke-width:1.6;flex:none" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></a>';
  }

  function pintar(nombre, pedidos) {
    var recientes = pedidos.slice(0, 2);
    main.innerHTML =
      '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:28px;margin-top:4px">Hola, ' + esc(nombre) + "</h1>" +
      '<p class="cta-sub" style="margin-top:4px;font-size:14px">Gracias por confiar en HAUSLINE.</p>' +
      '<div style="margin-top:20px">' + hero(pedidos) + "</div>" +
      '<nav class="cta-tiles" aria-label="Accesos">' +
        '<a class="cta-tile" href="/cuenta/pedidos/">' + ICON.pedidos + "Mis pedidos</a>" +
        '<a class="cta-tile" href="/cuenta/favoritos/">' + ICON.deseos + "Lista de deseos</a>" +
        '<a class="cta-tile" href="/cuenta/datos/">' + ICON.datos + "Datos personales</a>" +
        '<a class="cta-tile" href="/cuenta/direcciones/">' + ICON.direcciones + "Direcciones</a>" +
      "</nav>" +
      '<section class="cta-sec" style="margin-top:28px"><div class="cta-sec-h"><span>Pedidos recientes</span><a class="cta-link" style="text-decoration:none" href="/cuenta/pedidos/">Ver todos ›</a></div>' +
      (recientes.length ? recientes.map(reciente).join("") :
        '<div class="cta-card cta-vacio"><p style="font-weight:600">Todavía no hay pedidos en tu cuenta</p><p class="cta-nota" style="font-size:13.5px;margin-top:6px">Cuando compres con este correo, tus pedidos aparecen aquí.</p></div>') +
      "</section>" +
      '<a class="cta-club" href="/">' + ICON.corona + '<span style="flex:1"><span class="cta-eyebrow" style="display:block">HAUSLINE Club</span><b style="display:block;font-weight:600;font-size:15px;margin-top:3px">Sé el primero en descubrir</b><span class="cta-nota" style="display:block;margin:2px 0 0;font-size:12.5px">Nuevas colecciones, lanzamientos y más.</span></span>' + FLECHA + "</a>";
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    var nombre = ((s.user.user_metadata && s.user.user_metadata.nombre) || "Cliente").split(/\s+/)[0];
    var pedidos = [];
    var r = await Promise.all([C.cuenta().catch(function () { return null; }), C.misPedidos().catch(function () { return null; })]);
    if (r[0] && r[0].nombre) nombre = r[0].nombre.split(/\s+/)[0];
    if (r[1]) pedidos = r[1];
    pintar(nombre, pedidos);
    if (!r[1]) C.aviso("No pudimos cargar tus pedidos. Recargá la página.", "error");
    // Los cambios que haga HAUSLINE en el panel aparecen solos, sin recargar.
    C.autoActualizar(async function () {
      var nuevos = await C.misPedidos();
      if (JSON.stringify(nuevos) !== JSON.stringify(pedidos)) { pedidos = nuevos; pintar(nombre, pedidos); }
    });
    // Sube a la cuenta los favoritos que el cliente marcó en la tienda (en segundo plano).
    C.sincronizarFavoritos(null).catch(function () {});
  }
  iniciar();
})();
