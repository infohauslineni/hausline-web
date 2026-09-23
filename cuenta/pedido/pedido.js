/* Mi cuenta · Detalle del pedido. pedido_cliente(codigo) solo responde si el pedido es de la
   cuenta con sesión (si no → "no encontrado"). Si el pedido está DISPONIBLE (ya en Nicaragua),
   no se muestra seguimiento internacional: se muestra la dirección de entrega, el costo de
   delivery configurado y "Solicitar envío", que registra la solicitud y abre WhatsApp. */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var codigo = String(C.param("id") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  var CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var CAMION = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;flex:none;margin-top:2px" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.66L.6 23.6l6.03-1.58a11.3 11.3 0 0 0 5.42 1.38c6.25 0 11.34-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02"/></svg>';

  var estado = { p: null, dirs: [], tarifas: [], entrega: null, elegida: null, urls: [] };

  function noEncontrado() {
    main.innerHTML = '<div class="cta-card cta-vacio" style="margin-top:6px"><p style="font-weight:600;font-size:17px">No encontramos el pedido ' + esc(codigo) + " en tu cuenta</p>" +
      '<p class="cta-nota" style="font-size:13.5px;margin-top:8px">Solo ves los pedidos hechos con el mismo correo de tu cuenta (ya verificado) o comprados con tu sesión abierta. Si es tuyo y usaste otro correo, escribinos y lo asociamos.</p>' +
      '<a class="cta-btn auto" style="margin-top:18px" href="' + C.linkWhatsApp("Hola, quiero asociar mi pedido " + codigo + " a mi cuenta de HAUSLINE.") + '" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>' +
      (/^HS\d{6}$/.test(codigo) ? '<p class="cta-nota" style="font-size:13.5px;margin-top:16px">También podés verlo sin iniciar sesión: <a href="https://hausline-tracking.vercel.app/pedido/' + encodeURIComponent(codigo) + '">seguimiento de ' + esc(codigo) + "</a></p>" : "") + "</div>";
  }

  var disponible = function (p) { return p.estado_codigo === "disponible_entrega" || p.estado_codigo === "pagado"; };
  function linkSeguro(u) { return /^https?:\/\//i.test(String(u || "")) ? String(u) : null; }

  function progreso(estadoCodigo) {
    var e = C.etapa(estadoCodigo);
    if (e.id === "cancelado") return '<p class="cta-sub" style="margin:0">Este pedido fue cancelado. Si tenés dudas, escribinos por WhatsApp.</p>';
    return '<ol class="cta-pasos">' + C.ETAPAS.map(function (paso, i) {
      var clase = i < e.indice || e.id === "entregado" ? "hecho" : i === e.indice ? "actual" : "";
      return '<li class="cta-paso ' + clase + '"><span class="n" aria-hidden="true">' + (clase === "hecho" ? "✓" : "") + "</span>" + esc(paso.label) + (clase === "actual" ? '<span class="cta-nota" style="margin:0 0 0 auto">Actual</span>' : "") + "</li>";
    }).join("") + "</ol>";
  }
  function entregaEstimada(p) {
    var e = C.etapa(p.estado_codigo);
    if (e.id === "entregado") return p.fecha_entrega ? "Entregado el " + C.fecha(p.fecha_entrega) : "Entregado";
    if (e.id === "cancelado") return "—";
    if (e.id === "disponible") return "Ya está en Nicaragua";
    if (p.fecha_estimada) return C.fecha(p.fecha_estimada);
    return p.envio_rapido ? "14–17 días" : "20–25 días";
  }

  function tarjetaProducto(p) {
    var e = C.etapa(p.estado_codigo);
    var items = p.productos || [];
    var it = items[0] || {};
    var foto = C.img(it.imagen);
    var det = [it.talla ? "Talla " + it.talla : null, it.color ? String(it.color).toUpperCase() : null].filter(Boolean).join(" · ");
    // Pedido con varios productos: se listan TODOS (foto, talla, color, cantidad y precio).
    var otros = items.length > 1 ? '<p class="cta-eyebrow" style="margin:0 0 10px">' + items.length + " productos en este pedido</p>" + items.map(function (o) {
      var f = C.img(o.imagen);
      var detalle = [o.talla ? "Talla " + o.talla : null, o.color ? String(o.color).toUpperCase() : null, o.cantidad > 1 ? "×" + o.cantidad : null].filter(Boolean).join(" · ");
      return '<div class="cta-item"><span class="cta-foto">' + (f ? '<img src="' + esc(f) + '" alt="" loading="lazy">' : CAJA) + '</span><div style="min-width:0;flex:1"><b style="display:block;font-weight:600">' + esc(o.marca || "") + '</b><span class="cta-prod" style="margin:0;white-space:normal">' + esc(o.producto || "") + "</span>" +
        (detalle ? '<span class="cta-prod" style="margin:0;color:var(--texto-3)">' + esc(detalle) + "</span>" : "") + "</div>" +
        (o.precio_unitario != null ? '<b style="font-weight:500;font-size:13px;white-space:nowrap">' + esc(C.monto(o.precio_unitario * (o.cantidad || 1), p.moneda)) + "</b>" : "") + "</div>";
    }).join("") : "";
    return '<div class="cta-card cta-pad"><div style="display:flex;gap:16px;align-items:center">' +
      '<span class="cta-foto" style="width:96px;height:96px">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA) + "</span>" +
      '<div style="min-width:0;flex:1">' + (items.length > 1
        ? '<b style="display:block;font-weight:600;font-size:15px">' + items.length + ' productos</b><span class="cta-prod" style="margin:0">' + esc(items.map(function (o) { return o.marca || o.producto; }).filter(Boolean).join(", ")) + "</span>"
        : '<b style="display:block;font-weight:600;font-size:15px">' + esc(it.marca || "") + '</b><span class="cta-prod" style="margin:0">' + esc(it.producto || "Tu pedido") + "</span>" +
          (det ? '<span class="cta-prod" style="margin:0;color:var(--texto-3)">' + esc(det) + "</span>" : "")) +
      '<span class="cta-prod" style="margin:0;color:var(--texto-3)">Pedido #' + esc(p.codigo) + "</span>" +
      (p.total != null ? '<b style="display:block;font-weight:600;margin-top:2px">' + esc(C.monto(p.total, p.moneda)) + "</b>" : "") +
      '<span class="cta-estado' + (e.id === "cancelado" ? " cancelado" : "") + '" style="background:' + (e.id === "cancelado" ? "var(--rojo-bg)" : "var(--verde-bg)") + ';padding:4px 10px;border-radius:999px"><i></i>' + esc(disponible(p) ? "Disponible para entrega" : e.label) + "</span>" +
      "</div></div>" + (otros ? '<div style="margin-top:12px;border-top:1px solid var(--borde);padding-top:12px">' + otros + "</div>" : "") + "</div>";
  }

  function bloqueEntrega() {
    var p = estado.p, d = estado.elegida, ent = estado.entrega;
    var costo = C.costoDelivery(d, estado.tarifas);
    var html = '<section class="cta-card cta-pad" style="margin-top:12px">' +
      '<div class="cta-listo"><span class="cta-listo-ic">' + CAMION + '</span><div><h2 style="margin:0;font-size:17px;font-weight:600">¡Tu pedido ya está disponible!</h2><p class="cta-sub" style="margin-top:4px;font-size:14px">Tu pedido ya se encuentra en Nicaragua. Solicitá el envío a tu dirección registrada.</p></div></div>';
    if (ent && ent.solicitada_at) {
      html += '<div class="cta-nota-ok">✓ <span>Solicitaste el envío el ' + esc(C.fecha(ent.solicitada_at)) + (ent.direccion ? " a “" + esc(ent.direccion.nombre) + "”" : "") + ". Te confirmamos la entrega por WhatsApp.</span></div>";
    }
    html += '<p class="cta-eyebrow" style="margin:18px 0 8px">Dirección de entrega</p>';
    if (!d) {
      html += '<div class="cta-dir" style="padding:20px;text-align:center"><p style="margin:0;font-weight:600">Todavía no tenés una dirección guardada</p><p class="cta-nota" style="font-size:13px">Agregala para ver el costo de delivery y solicitar el envío.</p>' +
        '<a class="cta-btn auto" style="margin-top:14px" href="/cuenta/direccion/?volver=' + encodeURIComponent("/cuenta/pedido/?id=" + p.codigo) + '">Agregar dirección</a></div></section>';
      return html;
    }
    var mapsUrl = d.lat != null && d.lng != null ? "https://www.google.com/maps?q=" + d.lat + "," + d.lng : null;
    html += '<div class="cta-dir"><div style="display:flex;gap:10px;padding:14px">' + PIN + '<div><b style="display:block;font-weight:600">' + esc(d.nombre) + "</b>" +
      C.lineasDireccion(d).map(function (l) { return '<span class="cta-prod" style="margin:0;white-space:normal">' + esc(l) + "</span>"; }).join("") + "</div></div>" +
      '<div style="position:relative"><div id="mapaEntrega"></div>' + (mapsUrl ? '<a class="cta-mapa-btn" href="' + esc(mapsUrl) + '" target="_blank" rel="noopener noreferrer">Ver en mapa</a>' : "") + "</div></div>" +
      '<div class="cta-kv" style="margin-top:12px;border-top:0"><span>Costo de delivery</span><b>' + esc(costo != null ? C.monto(costo) : "A cotizar por WhatsApp") + "</b></div>" +
      (Number(p.saldo || 0) > 0.01 ? '<div class="cta-kv"><span>Saldo pendiente del pedido</span><b>' + esc(C.monto(p.saldo, p.moneda)) + "</b></div>" : "") +
      '<button type="button" class="cta-btn" id="solicitar" style="margin-top:14px">' + (ent && ent.solicitada_at ? "Volver a solicitar envío" : "Solicitar envío a esta dirección") + "</button>" +
      '<div style="text-align:center;margin-top:18px"><p style="margin:0;font-weight:600;font-size:14px">¿Necesitás cambiar tu dirección?</p><p class="cta-nota" style="margin-top:2px">Podés actualizarla antes de solicitar el envío.</p>' +
      '<button type="button" class="cta-btn linea" id="cambiar" style="margin-top:12px">Cambiar dirección</button></div></section>';
    return html;
  }

  function pintar() {
    var p = estado.p;
    var e = C.etapa(p.estado_codigo);
    var fotos = (p.fotos || []).map(function (f, i) { return estado.urls[i]; }).filter(Boolean);
    var html = '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:22px;margin:0 0 14px">Detalle del pedido</h1>' + tarjetaProducto(p);

    if (disponible(p)) {
      html += bloqueEntrega();
    } else {
      if (p.notas_publicas && e.id !== "cancelado") html += '<p class="cta-sub" style="font-size:14px;margin-top:14px">' + esc(p.notas_publicas) + "</p>";
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Progreso</h2><div class="cta-card cta-pad">' + progreso(p.estado_codigo) + "</div></section>";
      // El tracking de Everest (Miami → Nicaragua) no se le muestra al cliente.
      var tray = (p.trayectos || []).filter(function (t) { return t.tracking && !/everest/i.test(String(t.transportista || "")); });
      if (e.id !== "entregado" && e.id !== "cancelado") {
        html += '<section class="cta-sec"><h2 class="cta-sec-h">Envío</h2><div class="cta-card cta-pad"><div class="cta-kv"><span>Entrega estimada</span><b>' + esc(entregaEstimada(p)) + "</b></div>" +
          (tray.length ? tray.map(function (t) {
            var url = linkSeguro(t.url_tracking);
            return '<div class="cta-kv"><span>Tracking' + (t.transportista ? " · " + esc(t.transportista) : "") + "</span><b>" + (url ? '<a class="cta-guia" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(t.tracking) + " ↗</a>" : '<span class="cta-guia">' + esc(t.tracking) + "</span>") + "</b></div>";
          }).join("") : '<div class="cta-kv"><span>Tracking</span><b style="font-weight:500;color:var(--texto-3)">Disponible al despachar</b></div>') + "</div></section>";
      }
      var hist = (p.historial || []).slice().reverse();
      if (hist.length) {
        html += '<section class="cta-sec"><h2 class="cta-sec-h">Historial</h2><div class="cta-card cta-pad"><ol class="cta-hist">' + hist.map(function (h) {
          return '<li><time datetime="' + esc(h.fecha) + '">' + esc(C.fecha(h.fecha)) + '</time><span><b style="font-weight:600">' + esc(C.etapa(h.estado_codigo).label) + "</b>" + (h.nota ? "<small>" + esc(h.nota) + "</small>" : "") + "</span></li>";
        }).join("") + "</ol></div></section>";
      }
    }
    if (fotos.length) {
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Fotos de tu pedido</h2><div class="cta-card cta-pad"><div class="cta-fotos">' +
        fotos.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(u) + '" alt="Foto de tu pedido" loading="lazy"></a>'; }).join("") + "</div></div></section>";
    }
    if (p.total != null) {
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Resumen de pago</h2><div class="cta-card cta-pad">' +
        '<div class="cta-kv"><span>Total del pedido</span><b>' + esc(C.monto(p.total, p.moneda)) + "</b></div>" +
        '<div class="cta-kv"><span>Pagado</span><b>' + esc(C.monto(p.abono, p.moneda)) + "</b></div>" +
        '<div class="cta-kv"><span>Saldo pendiente</span><b>' + esc(C.monto(p.saldo, p.moneda)) + "</b></div></div></section>";
    }
    html += '<section class="cta-sec"><a class="cta-btn linea" href="' + C.linkWhatsApp("Hola, tengo una consulta sobre mi pedido " + p.codigo + ".") + '" target="_blank" rel="noopener noreferrer">¿Dudas? Escribinos por WhatsApp</a></section>';
    main.innerHTML = html;
    document.title = "Pedido " + p.codigo + " · HAUSLINE";

    var m = document.getElementById("mapaEntrega");
    if (m && estado.elegida) C.mapa(m, { lat: estado.elegida.lat, lng: estado.elegida.lng });
    var bs = document.getElementById("solicitar"); if (bs) bs.addEventListener("click", solicitar);
    var bc = document.getElementById("cambiar"); if (bc) bc.addEventListener("click", cambiarDireccion);
  }

  function cambiarDireccion() {
    var volver = encodeURIComponent("/cuenta/pedido/?id=" + estado.p.codigo);
    var html = estado.dirs.map(function (d) {
      var c = C.costoDelivery(d, estado.tarifas);
      var on = estado.elegida && d.id === estado.elegida.id;
      return '<button type="button" class="cta-opcion' + (on ? " on" : "") + '" data-id="' + esc(d.id) + '"><span class="radio"></span><span style="min-width:0;flex:1"><b style="font-weight:600">' + esc(d.nombre) + "</b>" + (d.predeterminada ? ' <span class="cta-pill">Predeterminada</span>' : "") +
        '<span class="cta-prod" style="margin:2px 0 0">' + esc(d.direccion + ", " + d.ciudad) + '</span><span class="cta-prod" style="margin:0">Delivery: ' + esc(c != null ? C.monto(c) : "a cotizar") + "</span></span></button>";
    }).join("") +
      '<div class="cta-botones" style="margin-top:14px">' +
      (estado.elegida ? '<a class="cta-btn linea chico" href="/cuenta/direccion/?id=' + encodeURIComponent(estado.elegida.id) + "&volver=" + volver + '">Editar esta</a>' : "<span></span>") +
      '<a class="cta-btn chico" href="/cuenta/direccion/?volver=' + volver + '">Agregar nueva</a></div>';
    var h = C.hoja(html, "Elegí la dirección de entrega");
    h.panel.querySelectorAll("[data-id]").forEach(function (b) {
      b.addEventListener("click", function () {
        estado.elegida = estado.dirs.filter(function (d) { return d.id === b.dataset.id; })[0] || estado.elegida;
        h.cerrar(); pintar();
      });
    });
  }

  async function solicitar() {
    var d = estado.elegida, p = estado.p;
    var h = C.hoja('<div style="text-align:center;padding:26px 0"><span class="cta-spin"></span><p style="font-weight:600;font-size:17px;margin:16px 0 4px">Solicitando envío</p><p class="cta-nota">Estamos registrando tu solicitud…</p></div>');
    try {
      var inicio = Date.now();
      var r = await C.solicitarEntrega(p.codigo, d.id);
      var falta = 700 - (Date.now() - inicio); if (falta > 0) await new Promise(function (ok) { setTimeout(ok, falta); });
      estado.entrega = r;
      var msg = C.mensajeEnvio(p.codigo, d, r && r.costo != null ? Number(r.costo) : C.costoDelivery(d, estado.tarifas));
      h.panel.innerHTML = '<div style="text-align:center"><span class="cta-wa-badge">' + WA + '</span><p style="font-weight:600;font-size:18px;margin:12px 0 4px">Solicitud registrada</p><p class="cta-nota" style="font-size:14px;margin:0 auto;max-width:300px">Serás redirigido a WhatsApp para confirmar tu entrega con HAUSLINE.</p></div>' +
        '<div class="cta-wa"><div class="cta-wa-h"><span class="cta-wa-av">H</span><span><b>HAUSLINE</b><small>en línea</small></span></div><div class="cta-wa-b"><p class="cta-wa-msg">' + esc(msg) + "<small>✓✓</small></p></div></div>" +
        '<a class="cta-btn cta-btn-wa" style="margin-top:16px" href="' + esc(C.linkWhatsApp(msg)) + '" target="_blank" rel="noopener noreferrer" id="abrirWa">' + WA + " Abrir WhatsApp</a>" +
        '<button type="button" class="cta-link" style="display:block;margin:12px auto 0" id="ahoraNo">Ahora no</button>';
      h.panel.querySelector("#ahoraNo").addEventListener("click", function () { h.cerrar(); pintar(); });
      h.panel.querySelector("#abrirWa").addEventListener("click", function () { setTimeout(function () { h.cerrar(); pintar(); }, 500); });
    } catch (err) {
      h.cerrar();
      C.aviso(C.mensajeError(err), "error");
    }
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    if (!/^HS\d{6}$/.test(codigo)) { noEncontrado(); return; }
    try {
      var p = await C.pedido(codigo);
      if (!p) { noEncontrado(); return; }
      estado.p = p;
      var extra = await Promise.all([
        C.urlsFotos((p.fotos || []).map(function (f) { return f.storage_path; })).catch(function () { return []; }),
        disponible(p) ? C.direcciones().catch(function () { return []; }) : Promise.resolve([]),
        disponible(p) ? C.tarifas() : Promise.resolve([]),
        disponible(p) ? C.entrega(codigo) : Promise.resolve(null),
      ]);
      estado.urls = extra[0]; estado.dirs = extra[1]; estado.tarifas = extra[2]; estado.entrega = extra[3];
      var pedida = C.param("direccion");
      var previa = estado.entrega && estado.entrega.direccion ? estado.entrega.direccion.id : null;
      estado.elegida = estado.dirs.filter(function (d) { return d.id === pedida; })[0] || estado.dirs.filter(function (d) { return d.id === previa; })[0] ||
        estado.dirs.filter(function (d) { return d.predeterminada; })[0] || estado.dirs[0] || null;
      pintar();
    } catch (err) {
      main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar el pedido</p><p class="cta-nota">' + esc(C.mensajeError(err)) + '</p><button class="cta-btn auto linea" style="margin-top:16px" type="button" id="reintentar">Reintentar</button></div>';
      document.getElementById("reintentar").addEventListener("click", function () { location.reload(); });
    }
  }
  iniciar();
})();
