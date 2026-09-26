/* ============================================================
   HAUSLINE — Seguimiento público del pedido (sin cuenta)
   hauslineshopni.es/pedido/?c=HS000123 (y /pedido/HS000123 vía 404.html).
   Antes vivía en la app del tracking; ahora esa app es SOLO el panel
   privado. Datos: RPC obtener_pedido_publico (basta el código) y las
   fotos firmadas por el servidor (/api/fotos-pedido del tracking).
   Usa los estilos y utilidades de Mi cuenta (cuenta.css / cuenta.js).
   ============================================================ */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var S = C.salud;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var API_FOTOS = "https://hausline-tracking.vercel.app/api/fotos-pedido";
  var LOCAL_KEY = "hausline.pedidos.recientes";
  var CAJA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  var codigo = limpiar(C.param("c") || C.param("codigo") || "");
  var actual = null; // último pedido pintado (para refrescar solo si cambió)

  function limpiar(v) { return String(v || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8); }
  function valido(v) { return /^HS\d{6}$/.test(v); }

  /* ---------------- Etapas que ve el cliente (espejo del seguimiento anterior) ---------------- */
  var STEPS = ["Pedido recibido", "Pedido confirmado", "Preparación", "Control de calidad", "En tránsito", "Llegó a Nicaragua", "Listo para entregar", "Entregado"];
  // Cualquier estado interno (incluidas etapas viejas de bodega) → índice de etapa.
  var STEP_INDEX = {
    pedido_confirmado: 1, en_preparacion: 2, control_calidad: 3,
    etiqueta_creada: 4, despachado: 4, transito_internacional: 4, recibido_estados_unidos: 4, transito_nicaragua: 4,
    llego_nicaragua: 5, disponible_entrega: 6, empaquetado: 6, pagado: 6, entregado: 7,
  };
  var NOTA = {
    pedido_confirmado: "Recibimos y confirmamos tu orden.", en_preparacion: "Estamos preparando tu pedido.",
    control_calidad: "Tu pedido está pasando por control de calidad.", etiqueta_creada: "Tu pedido fue despachado y va en camino.",
    despachado: "Tu pedido fue despachado y va en camino.", transito_internacional: "Tu pedido está en tránsito internacional.",
    recibido_estados_unidos: "Tu pedido está en tránsito internacional.", transito_nicaragua: "Tu pedido está en tránsito internacional.",
    llego_nicaragua: "Tu pedido llegó al país de destino.", disponible_entrega: "Tu pedido está disponible para entrega.",
    pagado: "Confirmamos el pago de tu pedido.", empaquetado: "Tu pedido está empaquetado y listo para envío.",
    entregado: "Tu pedido fue entregado.", cancelado: "El pedido fue cancelado.",
  };
  var TRANSITO = { etiqueta_creada: 1, despachado: 1, transito_internacional: 1, recibido_estados_unidos: 1, transito_nicaragua: 1 };

  // Etiqueta del historial → una de las etapas públicas (igual que antes).
  function normalizarHistorial(label) {
    var v = String(label || "").toLowerCase();
    if (v.indexOf("confirm") !== -1) return "Orden confirmada";
    if (v.indexOf("prepar") !== -1 || v.indexOf("calidad") !== -1) return "En preparación";
    if (v.indexOf("disponible") !== -1 || v.indexOf("pagad") !== -1) return "Disponible para entrega";
    if (v.indexOf("empaque") !== -1) return "Empaquetado, listo para envío";
    if (v.indexOf("entregado") !== -1) return "Entregado";
    if (v.indexOf("país de destino") !== -1 || v.indexOf("pais de destino") !== -1 || (v.indexOf("nicaragua") !== -1 && (v.indexOf("lleg") !== -1 || (v.indexOf("recibid") !== -1 && v.indexOf("estados unidos") === -1)))) return "País de destino";
    if (/warehouse|enviando|tránsito|transito|estados unidos|etiqueta|despach/.test(v)) return "En tránsito";
    return label;
  }
  var CODIGO_POR_ETIQUETA = {
    "Orden confirmada": "pedido_confirmado", "En preparación": "en_preparacion", "En tránsito": "transito_internacional",
    "País de destino": "llego_nicaragua", "Disponible para entrega": "disponible_entrega", "Pagado": "pagado",
    "Empaquetado, listo para envío": "empaquetado", "Entregado": "entregado",
  };
  // "Incidencia / requiere atención" es interno: el cliente ve el último estado normal, sin nota.
  function ocultarInterno(p) {
    var hist = (p.historial || []).map(function (h) { return Object.assign({}, h, { estado: normalizarHistorial(h.estado) }); });
    if (p.estado_codigo !== "incidencia") return Object.assign({}, p, { historial: hist });
    var visibles = hist.filter(function (h) { return !/incidencia|requiere|atenci/i.test(h.estado); });
    var ultimo = visibles[visibles.length - 1];
    return Object.assign({}, p, {
      estado_codigo: ultimo ? (CODIGO_POR_ETIQUETA[ultimo.estado] || "pedido_confirmado") : "pedido_confirmado",
      notas_publicas: null, historial: visibles,
    });
  }

  /* ---------------- Fechas estimadas (espejo de utils/estimates.ts) ---------------- */
  function aFecha(v) { return new Date(String(v).indexOf("T") !== -1 ? v : v + "T12:00:00"); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function sumarHabiles(desde, dias) {
    var d = new Date(desde); d.setHours(12, 0, 0, 0);
    var n = 0;
    while (n < dias) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n++; }
    return d;
  }
  function trasLlegada(llegada) {
    var e = sumarHabiles(aFecha(llegada), 2), g = 0;
    while (e.getTime() < Date.now() && g++ < 20) e = sumarHabiles(e, 2);
    return iso(e);
  }
  // Nunca mostrar una fecha que ya pasó: se corre de a 3 días (con un mínimo de días a futuro).
  function aFuturo(estimada, minDias) {
    var e = aFecha(estimada); e.setHours(12, 0, 0, 0);
    var piso = new Date(); piso.setHours(0, 0, 0, 0); piso.setDate(piso.getDate() + (minDias || 0));
    var g = 0;
    while (e.getTime() < piso.getTime() && g++ < 200) e.setDate(e.getDate() + 3);
    return iso(e);
  }
  function fechaClave(p) {
    var hist = p.historial || [];
    var buscar = function (et) { for (var i = hist.length - 1; i >= 0; i--) if (hist[i].estado === et) return hist[i]; return null; };
    var entregado = p.fecha_entrega || (buscar("Entregado") || {}).fecha;
    if (entregado) return entregado;
    var est = p.estado_codigo;
    if (est === "disponible_entrega" || est === "empaquetado" || est === "pagado") return p.fecha_estimada;
    var llegada = buscar("País de destino");
    if (llegada && est === "llego_nicaragua") return trasLlegada(llegada.fecha);
    if (p.fecha_estimada) return TRANSITO[est] ? aFuturo(p.fecha_estimada, 3) : aFuturo(p.fecha_estimada, 0);
    return null;
  }
  function diasHasta(v) {
    var t = aFecha(v), hoy = new Date(); hoy.setHours(0, 0, 0, 0); t.setHours(0, 0, 0, 0);
    return Math.round((t.getTime() - hoy.getTime()) / 86400000);
  }

  /* ---------------- Pedidos recordados en este dispositivo ---------------- */
  function recientes() {
    try { var a = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); return Array.isArray(a) ? a.filter(function (x) { return x && valido(x.codigo); }).sort(function (a, b) { return String(b.visto).localeCompare(String(a.visto)); }) : []; }
    catch (e) { return []; }
  }
  function recordar(cod) {
    try {
      var a = recientes().filter(function (x) { return x.codigo !== cod; });
      a.unshift({ codigo: cod, visto: new Date().toISOString() });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(a.slice(0, 30)));
    } catch (e) {}
  }

  /* ---------------- Datos ---------------- */
  async function buscar(cod) {
    if (!C.sb) throw new Error("No cargó el sistema de seguimiento");
    var r = await Promise.all([C.sb.rpc("obtener_pedido_publico", { p_codigo: cod }), fotos(cod)]);
    if (r[0].error) throw r[0].error;
    if (!r[0].data) return null;
    return Object.assign(ocultarInterno(r[0].data), { imagenes: r[1] });
  }
  // Si el servidor de fotos no responde, el seguimiento se muestra igual (sin fotos).
  async function fotos(cod) {
    try {
      var res = await fetch(API_FOTOS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fotosPublicas: true, codigo: cod }) });
      if (!res.ok) { S.error("fotos_error", cod + " · HTTP " + res.status); return []; }
      var j = await res.json();
      return Array.isArray(j.imagenes) ? j.imagenes : [];
    } catch (e) { S.error("fotos_error", cod + " · " + ((e && e.message) || "sin conexión")); return []; }
  }

  /* ---------------- Vistas ---------------- */
  function buscador(valor) {
    return '<form id="buscar" class="seg-buscar" autocomplete="off">' +
      '<input class="cta-input" id="codigo" value="' + esc(valor || "") + '" placeholder="Ej: HS483682" aria-label="Código del pedido" autocapitalize="characters" spellcheck="false" maxlength="8">' +
      '<button class="cta-btn auto" type="submit">Rastrear</button></form>';
  }
  function noEncontrado(cod) {
    return '<div class="seg-alerta"><b>No encontramos un pedido con ' + (cod ? "el código " + esc(cod) : "ese código") + '.</b><span>Verificá que esté bien escrito (HS + 6 números) o escribinos por WhatsApp.</span></div>';
  }
  function inicio(msgError) {
    var rec = recientes().slice(0, 5);
    document.title = "Seguimiento de pedidos · HAUSLINE";
    main.innerHTML =
      '<div class="seg-landing"><p class="cta-eyebrow">Seguimiento de pedidos</p>' +
      '<h1 class="cta-h1">¿Dónde está tu pedido?</h1>' +
      '<p class="cta-sub">Ingresá el código que recibiste al confirmar tu compra y seguí tu pedido paso a paso. Sin cuenta, sin contraseñas.</p>' +
      '<div style="margin-top:22px">' + buscador(codigo) + "</div>" + (msgError || "") +
      '<p class="cta-nota" style="margin-top:10px">Tu código empieza con <b>HS</b> y tiene 6 números.</p></div>' +
      (rec.length ? '<section class="cta-sec"><h2 class="cta-sec-h">Tus pedidos en este teléfono</h2><div class="cta-card">' +
        rec.map(function (x) { return '<a class="seg-fila" href="/pedido/?c=' + encodeURIComponent(x.codigo) + '"><b>' + esc(x.codigo) + '</b><span aria-hidden="true">›</span></a>'; }).join("") + "</div></section>" : "") +
      '<section class="cta-sec"><div class="cta-card cta-pad"><p style="margin:0;font-weight:600">¿Tenés cuenta en HAUSLINE?</p><p class="cta-nota" style="margin-top:4px">Entrá a Mi cuenta para ver todos tus pedidos juntos desde cualquier teléfono.</p><a class="cta-btn linea" style="margin-top:12px" href="/cuenta/">Ir a Mi cuenta</a></div></section>';
    conectarBuscador();
  }
  function conectarBuscador() {
    var f = document.getElementById("buscar");
    var inp = document.getElementById("codigo");
    if (!f) return;
    inp.addEventListener("input", function () { inp.value = limpiar(inp.value); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = limpiar(inp.value);
      if (!valido(c)) { var prev = f.parentNode.parentNode.querySelector(".seg-alerta"); if (prev) prev.remove(); f.insertAdjacentHTML("afterend", noEncontrado(c)); return; }
      location.href = "/pedido/?c=" + encodeURIComponent(c);
    });
  }

  function tarjetaPedido(p) {
    var items = p.productos || [];
    var it = items[0] || {};
    var foto = C.img(it.imagen);
    var det = [it.talla ? "Talla " + it.talla : null, it.cantidad ? "×" + it.cantidad : null, it.color ? String(it.color).toUpperCase() : null].filter(Boolean).join(" · ");
    return '<div class="cta-card cta-pad"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><p class="cta-eyebrow">Pedido</p><span class="seg-chip">' + esc(p.codigo) + "</span></div>" +
      '<div style="display:flex;gap:14px;align-items:center;margin-top:12px"><span class="cta-foto" style="width:72px;height:72px">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA) + "</span>" +
      '<div style="min-width:0;flex:1"><b style="display:block;font-weight:600;font-size:15px">' + esc(items.length > 1 ? items.length + " productos" : it.producto || "Tu pedido") + "</b>" +
      (items.length > 1 ? '<span class="cta-prod" style="margin:0;color:var(--texto-3)">' + esc(items.map(function (o) { return o.producto; }).filter(Boolean).join(", ")) + "</span>"
        : det ? '<span class="cta-prod" style="margin:0;color:var(--texto-3)">' + esc(det) + "</span>" : "") +
      '<span class="cta-prod" style="margin:2px 0 0;color:var(--texto-3);font-size:12px">Pedido realizado: ' + esc(C.fecha(p.fecha_pedido)) + "</span></div></div>" +
      (items.length > 1 ? '<div style="margin-top:12px;border-top:1px solid var(--borde);padding-top:10px">' + items.map(function (o) {
        var f = C.img(o.imagen);
        var d = [o.talla ? "Talla " + o.talla : null, o.color ? String(o.color).toUpperCase() : null, o.cantidad > 1 ? "×" + o.cantidad : null].filter(Boolean).join(" · ");
        return '<div class="cta-item"><span class="cta-foto">' + (f ? '<img src="' + esc(f) + '" alt="" loading="lazy">' : CAJA) + '</span><div style="min-width:0;flex:1"><span class="cta-prod" style="margin:0;white-space:normal;color:var(--texto)">' + esc(o.producto || "") + "</span>" + (d ? '<span class="cta-prod" style="margin:0;color:var(--texto-3)">' + esc(d) + "</span>" : "") + "</div></div>";
      }).join("") + "</div>" : "") + "</div>";
  }

  function tarjetaEstado(p) {
    if (p.estado_codigo === "cancelado") {
      return '<div class="cta-card cta-pad"><h2 class="seg-estado"><i class="rojo"></i>Pedido cancelado</h2><p class="cta-nota" style="margin-top:6px">' + esc(p.notas_publicas || NOTA.cancelado) + " Si tenés dudas, escribinos por WhatsApp.</p></div>";
    }
    var idx = STEP_INDEX[p.estado_codigo] != null ? STEP_INDEX[p.estado_codigo] : 0;
    var entregado = p.estado_codigo === "entregado";
    var num = idx + 1;
    var pct = entregado ? 100 : Math.round((num / STEPS.length) * 100);
    var clave = fechaClave(p);
    var dias = clave && !entregado && idx >= 4 ? diasHasta(clave) : null;
    var sub = entregado ? "¡Gracias por tu compra!" : dias != null ? (dias > 1 ? "Faltan aproximadamente " + dias + " días" : dias === 1 ? "Llega mañana" : dias === 0 ? "Llega hoy" : "En camino, muy pronto") : "La fecha es estimada y puede variar.";
    return '<div class="cta-card cta-pad">' +
      '<div style="display:flex;align-items:center;gap:8px"><h2 class="seg-estado">' + esc(STEPS[idx]) + "</h2>" +
      '<span class="seg-pill' + (entregado ? "" : " vivo") + '">' + (entregado ? "✓ Entregado" : "<i></i>En curso") + "</span></div>" +
      '<p class="cta-nota" style="margin-top:4px">' + esc(p.notas_publicas || NOTA[p.estado_codigo] || "") + "</p>" +
      '<div class="seg-barra" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + Math.max(6, pct) + '%"></i></div>' +
      '<p class="cta-nota" style="margin-top:6px;font-size:12px">Etapa ' + num + " de " + STEPS.length + " · " + pct + "% del proceso</p>" +
      '<div class="seg-fecha"><div><p class="cta-eyebrow" style="color:var(--texto)">' + (entregado ? "Entregado el" : "Entrega estimada") + "</p>" +
      '<b>' + esc(clave ? C.fecha(clave) : "Por confirmar") + "</b><span>" + esc(sub) + "</span></div>" +
      (dias != null && dias >= 0 && !entregado ? '<span class="seg-dias"><b>' + (dias === 0 ? "¡Hoy!" : dias) + "</b>" + (dias > 0 ? "<small>" + (dias === 1 ? "día" : "días") + "</small>" : "") + "</span>" : "") + "</div>" +
      '<p class="cta-nota" style="font-size:11.5px;line-height:1.5;margin-top:10px">El tiempo de entrega incluye unos días de preparación (aprox. 4-5 en envío estándar y 3-4 en rápido; algunos productos tardan más) y el resto es tránsito, que empieza a contar cuando tu pedido sale en camino. Las fechas son aproximadas, no exactas: muchas veces las paqueterías retrasan los envíos.</p>' +
      '<button type="button" class="cta-btn linea" id="compartir" style="margin-top:12px">Compartir seguimiento</button></div>';
  }

  var FOTO_LABEL = { control_calidad: "Control de calidad", recibido_hausline: "Tu producto", producto: "Producto", empaque: "Empaquetado", recibido_local: "Recibido" };
  var FOTO_ORDEN = ["control_calidad", "recibido_hausline", "producto", "empaque", "recibido_local"];
  function galeria(p) {
    var g = [];
    FOTO_ORDEN.forEach(function (t) { (p.imagenes || []).forEach(function (f) { if (f.url && f.tipo === t) g.push({ url: f.url, titulo: FOTO_LABEL[t] }); }); });
    return g;
  }
  function tarjetaFotos(g) {
    if (!g.length) return "";
    return '<section class="cta-sec"><h2 class="cta-sec-h">Fotos de tu pedido</h2><div class="cta-card cta-pad"><p class="cta-nota" style="margin:0 0 10px">Fotos reales de tu producto en control de calidad y cada etapa. Tocá una para verla en grande.</p>' +
      (g.length === 1
        ? '<button type="button" class="seg-foto-unica" data-foto="0" aria-label="Ver foto ampliada"><img src="' + esc(g[0].url) + '" alt="' + esc(g[0].titulo) + '"><span>' + esc(g[0].titulo) + "</span></button>"
        : '<div class="cta-fotos">' + g.map(function (f, i) { return '<button type="button" data-foto="' + i + '" aria-label="Ver foto ampliada"><img src="' + esc(f.url) + '" alt="' + esc(f.titulo) + '" loading="lazy"></button>'; }).join("") + "</div>") +
      "</div></section>";
  }
  function tarjetaEtapas(p) {
    if (p.estado_codigo === "cancelado") return "";
    var idx = STEP_INDEX[p.estado_codigo] != null ? STEP_INDEX[p.estado_codigo] : 0;
    var entregado = p.estado_codigo === "entregado";
    return '<section class="cta-sec"><h2 class="cta-sec-h">Estado del pedido</h2><div class="cta-card cta-pad"><ol class="cta-pasos">' + STEPS.map(function (s, i) {
      var clase = i < idx || (entregado && i === idx) ? "hecho" : i === idx ? "actual" : "";
      return '<li class="cta-paso ' + clase + '"><span class="n" aria-hidden="true">' + (clase === "hecho" ? "✓" : "") + "</span>" + esc(s) + (clase === "actual" ? '<span class="cta-nota" style="margin:0 0 0 auto">En curso</span>' : "") + "</li>";
    }).join("") + "</ol></div></section>";
  }
  function tarjetaDetalle(p) {
    var it = (p.productos || [])[0];
    return '<section class="cta-sec"><h2 class="cta-sec-h">Detalle del pedido</h2><div class="cta-card cta-pad">' +
      (it ? '<div class="cta-kv"><span>Producto</span><b>' + esc(it.producto) + "</b></div>" +
        '<div class="cta-kv"><span>Talla / cantidad</span><b>' + esc([it.talla ? "Talla " + it.talla : null, "×" + (it.cantidad || 1)].filter(Boolean).join(" · ")) + "</b></div>" : "") +
      '<div class="cta-kv"><span>Pedido</span><b>' + esc(p.codigo) + "</b></div>" +
      '<div class="cta-kv"><span>Fecha de compra</span><b>' + esc(C.fecha(p.fecha_pedido)) + "</b></div>" +
      '<div class="cta-kv"><span>Método de pago</span><b>Transferencia</b></div></div></section>';
  }

  function pintar(p) {
    var g = galeria(p);
    var cancelado = p.estado_codigo === "cancelado";
    document.title = "Pedido " + p.codigo + " · HAUSLINE";
    main.innerHTML =
      '<a class="cta-link seg-volver" href="/pedido/">‹ Consultar otro pedido</a>' +
      tarjetaPedido(p) + '<div style="margin-top:12px">' + tarjetaEstado(p) + "</div>" +
      (cancelado ? "" : tarjetaFotos(g)) + tarjetaEtapas(p) + tarjetaDetalle(p) +
      '<section class="cta-sec"><div class="cta-card cta-pad"><p style="margin:0;font-weight:600">Todos tus pedidos en un solo lugar</p><p class="cta-nota" style="margin-top:4px">Opcional: creá tu cuenta gratis con el mismo correo de tu compra y verás todos tus pedidos juntos, desde cualquier teléfono.</p><a class="cta-btn linea" style="margin-top:12px" href="/cuenta/pedido/?id=' + encodeURIComponent(p.codigo) + '">Ir a Mi cuenta</a></div></section>' +
      '<section class="cta-sec"><div class="cta-card cta-pad seg-ayuda"><p style="margin:0;font-weight:600">¿Necesitás ayuda con tu pedido?</p><p class="cta-nota" style="margin-top:4px">Nuestro equipo está listo para ayudarte.</p><a class="cta-btn" style="margin-top:12px" href="' + C.linkWhatsApp("Hola, necesito ayuda con mi pedido " + p.codigo + ".") + '" target="_blank" rel="noopener noreferrer">WhatsApp HAUSLINE</a></div></section>';
    main.querySelectorAll("[data-foto]").forEach(function (b) { b.addEventListener("click", function () { C.visor(g, Number(b.dataset.foto)); }); });
    var bc = document.getElementById("compartir");
    if (bc) bc.addEventListener("click", async function () {
      var url = location.origin + "/pedido/?c=" + encodeURIComponent(p.codigo);
      try {
        if (navigator.share) await navigator.share({ title: "Pedido " + p.codigo + " · HAUSLINE", text: "Seguí mi pedido HAUSLINE", url: url });
        else { await navigator.clipboard.writeText(url); C.aviso("Enlace copiado."); }
      } catch (e) { /* canceló el compartir */ }
    });
  }

  async function cargar(silencioso) {
    try {
      var p = await buscar(codigo);
      if (!p) {
        if (!silencioso) { S.registrar("seguimiento_no_encontrado", { mensaje: codigo }); inicio(noEncontrado(codigo)); }
        return;
      }
      // Solo repinta si algo cambió (las fotos firmadas cambian de URL: se comparan sin ellas).
      var firma = JSON.stringify(Object.assign({}, p, { imagenes: (p.imagenes || []).map(function (f) { return f.storage_path; }) }));
      if (firma === actual) return;
      actual = firma;
      recordar(p.codigo);
      if (!silencioso) S.registrar("vio_seguimiento", { mensaje: codigo });
      if (!document.querySelector(".cta-visor")) pintar(p);
    } catch (err) {
      S.error("seguimiento_error", codigo + " · " + ((err && err.message) || "Error"), { silencioso: !!silencioso });
      if (!silencioso) {
        main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tu pedido</p><p class="cta-nota">Puede ser tu conexión o un problema nuestro. Intentá de nuevo en un momento.</p>' +
          '<button class="cta-btn auto linea" style="margin-top:16px" type="button" id="reintentar">Reintentar</button></div>';
        document.getElementById("reintentar").addEventListener("click", function () { location.reload(); });
      }
    }
  }

  if (!codigo) { inicio(); return; }
  if (!valido(codigo)) { inicio(noEncontrado(codigo)); return; }
  cargar(false).then(function () {
    // Cambios hechos en el panel aparecen solos (cada minuto, con la pestaña visible).
    if (actual) C.autoActualizar(function () { return cargar(true); }, 60000);
  });
})();
