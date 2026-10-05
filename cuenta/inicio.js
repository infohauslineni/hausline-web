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

  function hero(pedidos, encargos) {
    var pendientesEnc = (encargos || []).filter(function (e) { return e.estado === "pendiente" || e.pago_reportado; });
    var activos = pedidos.filter(function (p) { var g = C.grupo(p.estado_codigo); return g === "proceso" || g === "enviado"; });
    var disponibles = activos.filter(function (p) { return (p.estado_codigo === "disponible_entrega" || p.estado_codigo === "pagado") && !p.entrega_solicitada_at; });
    var t, s, verde = false, href = "/cuenta/pedidos/", btn = "Ver detalles";
    if (disponibles.length) {
      t = disponibles.length === 1 ? "1 pedido disponible para entrega" : disponibles.length + " pedidos disponibles para entrega";
      s = "Ya está en Nicaragua · solicite su envío"; verde = true;
      href = "/cuenta/pedido/?id=" + encodeURIComponent(disponibles[0].codigo);
    } else if (activos.length) {
      t = activos.length === 1 ? "1 pedido en trámite" : activos.length + " pedidos en trámite";
      var prox = activos.filter(function (p) { return p.fecha_estimada; }).sort(function (a, b) { return a.fecha_estimada.localeCompare(b.fecha_estimada); })[0];
      var d = diasHasta(prox && prox.fecha_estimada);
      s = d ? "Llegará en aprox. " + d + (d === 1 ? " día" : " días") : "Le avisamos en cada etapa";
      if (activos.length === 1) href = "/cuenta/pedido/?id=" + encodeURIComponent(activos[0].codigo);
    } else if (pendientesEnc.length) {
      // Todavía no hay pedidos, pero sí un encargo esperando confirmación.
      var porPagar = pendientesEnc.filter(function (e) { return !e.pago_reportado; });
      t = pendientesEnc.length === 1 ? "1 encargo esperando confirmación" : pendientesEnc.length + " encargos esperando confirmación";
      s = porPagar.length ? "Falta su pago para confirmarlo" : "Estamos revisando su pago";
      if (porPagar.length) { href = "/checkout/?c=" + encodeURIComponent(porPagar[0].codigo); btn = "Pagar"; }
    } else {
      t = "No tiene pedidos en camino"; s = "Descubra lo nuevo en la tienda."; href = "/"; btn = "Ir a la tienda";
    }
    return '<a class="cta-hero" href="' + href + '">' + CAJA + '<span class="cta-hero-sep"></span><span class="cta-hero-t"><small>Sus pedidos</small><b>' + esc(t) + "</b><span" + (verde ? ' class="verde"' : "") + ">" + esc(s) + '</span></span><span class="cta-hero-btn">' + btn + " ›</span></a>";
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

  // ── Vitrina: banner de productos que pasa solo (publicidad dentro de Mi cuenta) ──────────────
  // Lo nuevo, lo que viene en camino y lo de entrega inmediata del catálogo (admin de la tienda).
  // Al tocar un producto se abre su página en la tienda.
  var CAT_URL = "https://xgdijumnmaqfirmckugw.supabase.co", CAT_KEY = "sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw";
  var STORAGE_CAT = CAT_URL + "/storage/v1/object/public/catalogo/";
  var vitrinaHtml = null;
  function miniatura(src) {
    var v = String(src || "");
    if (v.indexOf(STORAGE_CAT) === 0) { var rel = v.slice(STORAGE_CAT.length).split("?")[0]; return rel ? "/imgM/panel/" + decodeURIComponent(rel).replace(/\.[^./]+$/, ".webp") : v; }
    var r = v.replace(/^\.?\//, "");
    return /^imgP\//.test(r) ? "/" + r.replace(/^imgP\//, "imgM/").replace(/\.[^./]+$/, ".webp") : C.img(v);
  }
  function monto(v) { return "$" + Number(v || 0).toLocaleString("en-US"); }
  async function cargarVitrina() {
    if (vitrinaHtml !== null) return vitrinaHtml;
    vitrinaHtml = "";
    try {
      var r = await fetch(CAT_URL + "/rest/v1/catalogo_web?select=codigo,datos,created_at&activo=eq.true&order=created_at.desc&limit=80", { headers: { apikey: CAT_KEY, Authorization: "Bearer " + CAT_KEY } });
      var filas = r.ok ? await r.json() : [];
      var lista = (Array.isArray(filas) ? filas : []).map(function (row) { return Object.assign({ _codigo: row.codigo }, row.datos || {}); })
        .filter(function (d) { return d.nombre && d.imagen && Number(d.precio) > 0 && !d.cotizar && !d.ventaLibre && !/^LIB\d/i.test(d._codigo); });
      var prio = function (d) { return d.enCamino ? 0 : d.entregaInmediata ? 1 : 2; };
      lista.sort(function (a, b) { return prio(a) - prio(b); });
      lista = lista.slice(0, 16);
      if (lista.length < 4) return vitrinaHtml;
      var tarjeta = function (d) {
        var tag = d.enCamino ? "En camino" : d.entregaInmediata ? "Inmediata" : "Nuevo";
        var precio = d.entregaInmediata && Number(d.precioEntregaInmediata) > 0 ? d.precioEntregaInmediata : (Number(d.precioOferta) > 0 ? d.precioOferta : d.precio);
        return '<a class="cta-vitrina-item" href="/p/' + encodeURIComponent(d._codigo) + '/"><span class="cta-vitrina-foto" style="position:relative"><span class="cta-vitrina-tag">' + tag + '</span>' +
          '<img src="' + esc(miniatura(d.imagen)) + '" data-orig="' + esc(C.img(d.imagen)) + '" alt="" loading="lazy" decoding="async"></span>' +
          "<small>" + esc(d.marca || "HAUSLINE") + "</small><span>" + esc(d.nombre) + "</span><b>" + monto(precio) + "</b></a>";
      };
      var items = lista.map(tarjeta).join("");
      // Se repite la lista para que el desplazamiento sea infinito (la animación corre la mitad).
      vitrinaHtml = '<section class="cta-vitrina" aria-label="Productos destacados"><div class="cta-vitrina-h"><b>Para usted</b><a href="/">Ver la tienda ›</a></div>' +
        '<div class="cta-vitrina-viewport"><div class="cta-vitrina-pista" style="--dur:' + Math.max(30, lista.length * 4.5) + 's">' + items + items + "</div></div></section>";
    } catch (e) { vitrinaHtml = ""; }
    return vitrinaHtml;
  }

  // Cupón vigente, "¿Cómo le fue?" del último pedido entregado y favoritos que bajaron de precio.
  async function pintarExtras(pedidos) {
    var partes = [];
    var cupones = await C.misCupones();
    if (cupones.length) partes.push(C.tarjetaCupon(cupones[0]));
    var entregado = (pedidos || []).filter(function (p) { return p.estado_codigo === "entregado"; })[0];
    if (entregado) {
      var listo = false;
      try { listo = localStorage.getItem("hausline_encuesta_" + entregado.codigo) === "1"; } catch (e) {}
      if (!listo) partes.push(C.encuestaEntrega(entregado.codigo, null, "¿Cómo le fue con su pedido #" + entregado.codigo + "?"));
    }
    try {
      var bajas = C.bajasDePrecio(await C.favoritosCuenta());
      if (bajas.length) partes.push('<div class="cta-card cta-pad cta-bajas"><p class="cta-encuesta-t">↓ Bajaron de precio en su lista de deseos</p>' +
        bajas.slice(0, 3).map(function (f) { return '<a class="cta-baja" href="/p/' + encodeURIComponent(f.codigo) + '/"><span>' + esc(f.nombre) + '</span><s>' + C.monto(f.precio) + "</s><b>" + C.monto(f.ahora) + "</b></a>"; }).join("") + "</div>");
    } catch (e) { /* sin favoritos */ }
    var cont = document.getElementById("ctaExtras");
    if (!cont) return;
    cont.innerHTML = partes.join("");
    C.conectarCopiar(cont);
    cont.querySelectorAll(".cta-encuesta-est a").forEach(function (a) { a.addEventListener("click", function () { try { localStorage.setItem("hausline_encuesta_" + entregado.codigo, "1"); } catch (e) {} }); });
  }

  function pintar(nombre, pedidos, encargos) {
    var recientes = pedidos.slice(0, 2);
    main.innerHTML =
      '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:28px;margin-top:4px">Hola, ' + esc(nombre) + "</h1>" +
      '<p class="cta-sub" style="margin-top:4px;font-size:14px">Gracias por confiar en HAUSLINE.</p>' +
      '<div style="margin-top:20px">' + hero(pedidos, encargos) + "</div>" +
      C.seccionEncargos(encargos) +
      '<div id="ctaExtras" class="cta-extras"></div>' +
      '<nav class="cta-tiles" aria-label="Accesos">' +
        '<a class="cta-tile" href="/cuenta/pedidos/">' + ICON.pedidos + "Mis pedidos</a>" +
        '<a class="cta-tile" href="/cuenta/favoritos/">' + ICON.deseos + "Lista de deseos</a>" +
        '<a class="cta-tile" href="/cuenta/datos/">' + ICON.datos + "Datos personales</a>" +
        '<a class="cta-tile" href="/cuenta/direcciones/">' + ICON.direcciones + "Direcciones</a>" +
      "</nav>" +
      '<section class="cta-sec" style="margin-top:28px"><div class="cta-sec-h"><span>Pedidos recientes</span><a class="cta-link" style="text-decoration:none" href="/cuenta/pedidos/">Ver todos ›</a></div>' +
      (recientes.length ? recientes.map(reciente).join("") : (encargos && encargos.length)
        ? '<p class="cta-nota" style="font-size:13.5px">Cuando confirmemos su encargo, aparece aquí como pedido con su código HS.</p>' :
        '<div class="cta-card cta-vacio"><p style="font-weight:600">Todavía no hay pedidos en su cuenta</p><p class="cta-nota" style="font-size:13.5px;margin-top:6px">Cuando compre con este correo, sus pedidos aparecen aquí.</p></div>') +
      "</section>" +
      '<div id="ctaVitrina">' + (vitrinaHtml || "") + "</div>" +
      '<a class="cta-club" href="/">' + ICON.corona + '<span style="flex:1"><span class="cta-eyebrow" style="display:block">HAUSLINE Club</span><b style="display:block;font-weight:600;font-size:15px;margin-top:3px">Sé el primero en descubrir</b><span class="cta-nota" style="display:block;margin:2px 0 0;font-size:12.5px">Nuevas colecciones, lanzamientos y más.</span></span>' + FLECHA + "</a>";
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    var nombre = ((s.user.user_metadata && s.user.user_metadata.nombre) || "Cliente").split(/\s+/)[0];
    var pedidos = [];
    var errPedidos = null;
    var r = await Promise.all([C.cuenta().catch(function () { return null; }), C.misPedidos().catch(function (e) { errPedidos = e; return null; }), C.misEncargos()]);
    var encargos = r[2];
    if (r[0] && r[0].nombre) nombre = r[0].nombre.split(/\s+/)[0];
    if (r[1]) pedidos = r[1];
    pintar(nombre, pedidos, encargos);
    pintarExtras(pedidos);
    cargarVitrina().then(function (h) {
      var v = document.getElementById("ctaVitrina");
      if (!v || !h) return;
      v.innerHTML = h;
      // Si la miniatura todavía no existe, cae a la foto original.
      v.querySelectorAll("img[data-orig]").forEach(function (im) {
        im.addEventListener("error", function () { if (im.dataset.orig && im.getAttribute("src") !== im.dataset.orig) im.src = im.dataset.orig; });
      });
    });
    if (r[1]) C.salud.registrar("vio_cuenta", { detalle: { pedidos: pedidos.length } });
    // Sin señal (ya se reintentó solo): se le explica al cliente, sin anotarlo como falla del sistema.
    if (!r[1]) C.aviso(errPedidos && errPedidos.red ? "Se cortó su conexión. Revise su internet y recargue la página." : "No pudimos cargar sus pedidos. Recargue la página.", "error", !!(errPedidos && errPedidos.red));
    // Los cambios que haga HAUSLINE en el panel aparecen solos, sin recargar.
    C.autoActualizar(async function () {
      var nuevos = await C.misPedidos();
      var nuevosEnc = await C.misEncargos();
      if (JSON.stringify(nuevos) !== JSON.stringify(pedidos) || JSON.stringify(nuevosEnc) !== JSON.stringify(encargos)) { pedidos = nuevos; encargos = nuevosEnc; pintar(nombre, pedidos, encargos); }
    });
    // Sube a la cuenta los favoritos que el cliente marcó en la tienda (en segundo plano).
    C.sincronizarFavoritos(null).catch(function () {});
  }
  iniciar();
})();
