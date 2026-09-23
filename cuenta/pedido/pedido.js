/* Mi cuenta · detalle de un pedido. Los datos vienen de pedido_cliente(codigo), que solo
   responde si el pedido es de la cuenta con sesión (si no, devuelve null → "no encontrado"). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var codigo = String(C.param("id") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  var ICONO_CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var esc = C.esc;

  function noEncontrado() {
    main.innerHTML = '<a class="cta-back" href="/cuenta/">← Mis pedidos</a>' +
      '<div class="cta-card cta-vacio" style="margin-top:16px"><p style="font-weight:600;font-size:17px">No encontramos el pedido ' + esc(codigo || "") + ' en tu cuenta</p>' +
      '<p class="cta-nota" style="font-size:13.5px;margin-top:8px">Solo ves los pedidos hechos con el mismo correo de tu cuenta (ya verificado) o comprados con tu sesión abierta. Si es tuyo y usaste otro correo, escribinos y lo asociamos.</p>' +
      '<a class="cta-btn auto" style="margin-top:18px" href="https://wa.me/50578995116?text=' + encodeURIComponent("Hola, quiero asociar mi pedido " + codigo + " a mi cuenta de HAUSLINE.") + '" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>' +
      (/^HS\d{6}$/.test(codigo) ? '<p class="cta-nota" style="font-size:13.5px;margin-top:16px">También podés verlo sin iniciar sesión: <a href="https://hausline-tracking.vercel.app/pedido/' + encodeURIComponent(codigo) + '">seguimiento de ' + esc(codigo) + '</a></p>' : "") + '</div>';
  }

  function linkSeguro(u) { return /^https?:\/\//i.test(String(u || "")) ? String(u) : null; }

  function progreso(estadoCodigo) {
    var e = C.etapa(estadoCodigo);
    if (e.id === "cancelado") return '<p class="cta-sub" style="margin:0">Este pedido fue cancelado. Si tenés dudas, escribinos por WhatsApp.</p>';
    return '<ol class="cta-pasos">' + C.ETAPAS.map(function (paso, i) {
      var clase = i < e.indice || e.id === "entregado" ? "hecho" : i === e.indice ? "actual" : "";
      var marca = clase === "hecho" ? "✓" : "";
      return '<li class="cta-paso ' + clase + '"><span class="n" aria-hidden="true">' + marca + "</span>" + esc(paso.label) + (clase === "actual" ? '<span class="cta-nota" style="margin:0 0 0 auto">Actual</span>' : "") + "</li>";
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

  function pintar(p, urls) {
    var e = C.etapa(p.estado_codigo);
    var productos = p.productos || [];
    var trayectos = (p.trayectos || []).filter(function (t) { return t.tracking; });
    var historial = (p.historial || []).slice().reverse();
    var fotos = (p.fotos || []).map(function (f, i) { return urls[i]; }).filter(Boolean);

    var html = '<a class="cta-back" href="/cuenta/">← Mis pedidos</a>' +
      '<p class="cta-eyebrow" style="margin-top:18px">Pedido</p>' +
      '<h1 class="cta-h1">#' + esc(p.codigo) + "</h1>" +
      '<p class="cta-sub">Realizado el ' + esc(C.fecha(p.fecha_pedido)) + "</p>";

    // Estado actual
    html += '<div class="cta-card cta-pad" style="margin-top:20px">' +
      '<p class="cta-eyebrow">Estado actual</p>' +
      '<p class="cta-estado' + (e.id === "cancelado" ? " cancelado" : "") + '" style="font-size:17px;margin-top:10px"><i></i>' + esc(e.label) + "</p>" +
      (p.notas_publicas ? '<p class="cta-sub" style="font-size:14px">' + esc(p.notas_publicas) + "</p>" : "") +
      "</div>";

    // Productos
    html += '<section class="cta-sec"><h2 class="cta-sec-h">Productos</h2><div class="cta-card cta-pad">' +
      productos.map(function (it) {
        var foto = C.img(it.imagen);
        var det = [it.talla ? "Talla " + it.talla : null, it.color, it.cantidad > 1 ? "×" + it.cantidad : null].filter(Boolean).join(" · ");
        return '<div class="cta-item"><span class="cta-foto">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : ICONO_CAJA) + "</span>" +
          '<div style="min-width:0;flex:1"><b style="display:block;font-weight:600">' + esc(it.marca || "") + "</b>" +
          '<span class="cta-prod" style="margin:0">' + esc(it.producto || "") + "</span>" +
          (det ? '<span class="cta-prod" style="color:var(--texto-3);margin:0">' + esc(det) + "</span>" : "") + "</div></div>";
      }).join("") + "</div></section>";

    // Progreso
    html += '<section class="cta-sec"><h2 class="cta-sec-h">Progreso</h2><div class="cta-card cta-pad">' + progreso(p.estado_codigo) + "</div></section>";

    // Envío: tracking + entrega estimada
    html += '<section class="cta-sec"><h2 class="cta-sec-h">Envío</h2><div class="cta-card cta-pad">' +
      '<div class="cta-kv"><span>Entrega estimada</span><b>' + esc(entregaEstimada(p)) + "</b></div>" +
      (trayectos.length ? trayectos.map(function (t) {
        var url = linkSeguro(t.url_tracking);
        return '<div class="cta-kv"><span>Tracking' + (t.transportista ? " · " + esc(t.transportista) : "") + "</span><b>" +
          (url ? '<a class="cta-guia" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(t.tracking) + " ↗</a>" : '<span class="cta-guia">' + esc(t.tracking) + "</span>") + "</b></div>";
      }).join("") : '<div class="cta-kv"><span>Tracking</span><b style="font-weight:500;color:var(--texto-3)">Disponible al despachar</b></div>') +
      "</div></section>";

    // Fotos (control de calidad, recibido, empaque)
    if (fotos.length) {
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Fotos de tu pedido</h2><div class="cta-card cta-pad"><div class="cta-fotos">' +
        fotos.map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(u) + '" alt="Foto de tu pedido" loading="lazy"></a>'; }).join("") +
        "</div></div></section>";
    }

    // Historial (solo eventos públicos)
    if (historial.length) {
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Historial</h2><div class="cta-card cta-pad"><ol class="cta-hist">' +
        historial.map(function (h) {
          return '<li><time datetime="' + esc(h.fecha) + '">' + esc(C.fecha(h.fecha)) + "</time><span><b style=\"font-weight:600\">" + esc(C.etapa(h.estado_codigo).label) + "</b>" +
            (h.nota ? "<small>" + esc(h.nota) + "</small>" : "") + "</span></li>";
        }).join("") + "</ol></div></section>";
    }

    // Pago (solo lo del cliente: total, pagado, saldo — nunca costos internos)
    if (p.total != null) {
      html += '<section class="cta-sec"><h2 class="cta-sec-h">Resumen de pago</h2><div class="cta-card cta-pad">' +
        '<div class="cta-kv"><span>Total del pedido</span><b>' + esc(C.monto(p.total, p.moneda)) + "</b></div>" +
        '<div class="cta-kv"><span>Pagado</span><b>' + esc(C.monto(p.abono, p.moneda)) + "</b></div>" +
        '<div class="cta-kv"><span>Saldo pendiente</span><b>' + esc(C.monto(p.saldo, p.moneda)) + "</b></div>" +
        "</div></section>";
    }

    html += '<section class="cta-sec"><a class="cta-btn linea" href="https://wa.me/50578995116?text=' + encodeURIComponent("Hola, tengo una consulta sobre mi pedido " + p.codigo + ".") + '" target="_blank" rel="noopener noreferrer">¿Dudas? Escribinos por WhatsApp</a></section>';
    main.innerHTML = html;
    document.title = "Pedido " + p.codigo + " · HAUSLINE";
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    if (!/^HS\d{6}$/.test(codigo)) { noEncontrado(); return; }
    try {
      var p = await C.pedido(codigo);
      if (!p) { noEncontrado(); return; }
      var urls = [];
      try { urls = await C.urlsFotos((p.fotos || []).map(function (f) { return f.storage_path; })); } catch (e) { urls = []; }
      pintar(p, urls);
    } catch (err) {
      main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar el pedido</p><p class="cta-nota">' + esc(C.mensajeError(err)) + '</p><button class="cta-btn auto linea" style="margin-top:16px" type="button" id="reintentar">Reintentar</button></div>';
      document.getElementById("reintentar").addEventListener("click", function () { location.reload(); });
    }
  }
  iniciar();
})();
