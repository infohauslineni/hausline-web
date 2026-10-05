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
  // Notas guardadas antes del cambio a "usted" ("Tu pedido…") se muestran de usted.
  function deUsted(t) { return t ? String(t).replace(/\bTu\b/g, "Su").replace(/\btu\b/g, "su").replace(/\bte\b/g, "le") : t; }
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
    pedido_confirmado: "Recibimos y confirmamos su orden.", en_preparacion: "Estamos preparando su pedido.",
    control_calidad: "Su pedido está pasando por control de calidad.", etiqueta_creada: "Su pedido fue despachado y va en camino.",
    despachado: "Su pedido fue despachado y va en camino.", transito_internacional: "Su pedido está en tránsito internacional.",
    recibido_estados_unidos: "Su pedido está en tránsito internacional.", transito_nicaragua: "Su pedido está en tránsito internacional.",
    llego_nicaragua: "Su pedido llegó al país de destino.", disponible_entrega: "Su pedido está disponible para entrega.",
    pagado: "Confirmamos el pago de su pedido.", empaquetado: "Su pedido está empaquetado y listo para envío.",
    entregado: "Su pedido fue entregado.", cancelado: "El pedido fue cancelado.",
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
  // En "País de destino": llegada + 2 días hábiles. Si llega ESE día (o ya pasó) y el pedido
  // sigue sin pasar a "Disponible para entrega", la entrega se corre 3 días más (y así cada vez).
  function trasLlegada(llegada) { return posponer(iso(sumarHabiles(aFecha(llegada), 2))); }
  // Desde las 12 a. m. del día de la entrega (o si ya pasó) se corre de a 3 días hasta quedar a futuro.
  function posponer(fecha) {
    var e = aFecha(String(fecha).slice(0, 10)), g = 0;
    e.setHours(12, 0, 0, 0);
    var hoy = new Date(); hoy.setHours(12, 0, 0, 0);
    while (e.getTime() <= hoy.getTime() && g++ < 60) e.setDate(e.getDate() + 3);
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
    // País de destino: manda la fecha de la base (la corre +3 días a las 12 a. m. si llegó el día
    // sin pasar a Disponible). Aquí se aplica la misma regla por si la página se abre antes de
    // que corra la tarea. Sin fecha guardada: llegada + 2 días hábiles.
    if (est === "llego_nicaragua") {
      if (p.fecha_estimada) return posponer(p.fecha_estimada);
      var llegada = buscar("País de destino");
      return llegada ? trasLlegada(llegada.fecha) : null;
    }
    // Sin el registro de llegada: la fecha guardada, pero nunca "hoy" si sigue en País de destino.
    if (p.fecha_estimada) return TRANSITO[est] ? aFuturo(p.fecha_estimada, 3) : aFuturo(p.fecha_estimada, est === "llego_nicaragua" ? 1 : 0);
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
  // "Load failed" (iPhone), "Failed to fetch" (Chrome), "NetworkError" (Firefox): se cortó la conexión.
  function esDeRed(e) { return /load failed|failed to fetch|networkerror|network request failed|fetch failed/i.test(String((e && e.message) || e || "")); }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  // Un corte breve (teléfono recién desbloqueado, cambio de wifi a datos) no debe verse como error:
  // se reintenta solo antes de rendirse.
  async function conReintento(fn, esperas) {
    for (var i = 0; ; i++) {
      try { return await fn(); }
      catch (e) { if (!esDeRed(e) || i >= esperas.length) throw e; await esperar(esperas[i]); }
    }
  }

  async function buscar(cod, silencioso) {
    if (!C.sb) throw new Error("No cargó el sistema de seguimiento");
    var esperas = silencioso ? [] : [1500, 4000];
    var r = await Promise.all([
      conReintento(async function () { var x = await C.sb.rpc("obtener_pedido_publico", { p_codigo: cod }); if (x.error) throw x.error; return x; }, esperas),
      fotos(cod, silencioso, esperas),
    ]);
    if (!r[0].data) return null;
    // En la actualización automática, si las fotos no cargaron se deja la pantalla como está
    // (si no, se repintaría el pedido sin sus fotos).
    if (r[1] === null) { if (silencioso) throw new Error("Load failed (fotos)"); r[1] = []; }
    return Object.assign(ocultarInterno(r[0].data), { imagenes: r[1] });
  }
  // Si el servidor de fotos no responde, el seguimiento se muestra igual (sin fotos). null = no cargaron.
  async function fotos(cod, silencioso, esperas) {
    try {
      var res = await conReintento(function () {
        return fetch(API_FOTOS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fotosPublicas: true, codigo: cod }) });
      }, esperas);
      if (!res.ok) { S.error("fotos_error", cod + " · HTTP " + res.status); return null; }
      var j = await res.json();
      return Array.isArray(j.imagenes) ? j.imagenes : [];
    } catch (e) {
      // En segundo plano un corte de red no se anota: el cliente no vio nada y se reintenta en un minuto.
      if (!(silencioso && esDeRed(e))) S.error("fotos_error", cod + " · " + ((e && e.message) || "sin conexión"));
      return null;
    }
  }

  /* ---------------- Vistas ---------------- */
  function buscador(valor) {
    return '<form id="buscar" class="seg-buscar" autocomplete="off">' +
      '<input class="cta-input" id="codigo" value="' + esc(valor || "") + '" placeholder="Ej: HS483682" aria-label="Código del pedido" autocapitalize="characters" spellcheck="false" maxlength="8">' +
      '<button class="cta-btn auto" type="submit">Rastrear</button></form>';
  }
  function noEncontrado(cod) {
    return '<div class="seg-alerta"><b>No encontramos un pedido con ' + (cod ? "el código " + esc(cod) : "ese código") + '.</b><span>Verifique que esté bien escrito (HS + 6 números) o escríbanos por WhatsApp.</span></div>';
  }
  function inicio(msgError) {
    var rec = recientes().slice(0, 5);
    document.title = "Seguimiento de pedidos · HAUSLINE";
    main.innerHTML =
      '<div class="seg-landing"><p class="cta-eyebrow">Seguimiento de pedidos</p>' +
      '<h1 class="cta-h1">¿Dónde está su pedido?</h1>' +
      '<p class="cta-sub">Ingrese el código que recibió al confirmar su compra y siga su pedido paso a paso. Sin cuenta, sin contraseñas.</p>' +
      '<div style="margin-top:22px">' + buscador(codigo) + "</div>" + (msgError || "") +
      '<p class="cta-nota" style="margin-top:10px">Su código empieza con <b>HS</b> y tiene 6 números.</p></div>' +
      (rec.length ? '<section class="cta-sec"><h2 class="cta-sec-h">Sus pedidos en este teléfono</h2><div class="cta-card">' +
        rec.map(function (x) { return '<a class="seg-fila" href="/pedido/?c=' + encodeURIComponent(x.codigo) + '"><b>' + esc(x.codigo) + '</b><span aria-hidden="true">›</span></a>'; }).join("") + "</div></section>" : "") +
      '<section class="cta-sec"><div class="cta-card cta-pad"><p style="margin:0;font-weight:600">¿Tiene cuenta en HAUSLINE?</p><p class="cta-nota" style="margin-top:4px">Entre a Mi cuenta para ver todos sus pedidos juntos desde cualquier teléfono.</p><a class="cta-btn linea" style="margin-top:12px" href="/cuenta/">Ir a Mi cuenta</a></div></section>';
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
      '<div style="min-width:0;flex:1"><b style="display:block;font-weight:600;font-size:15px">' + esc(items.length > 1 ? items.length + " productos" : it.producto || "Su pedido") + "</b>" +
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
      return '<div class="cta-card cta-pad"><h2 class="seg-estado"><i class="rojo"></i>Pedido cancelado</h2><p class="cta-nota" style="margin-top:6px">' + esc(deUsted(p.notas_publicas) || NOTA.cancelado) + " Si tiene dudas, escríbanos por WhatsApp.</p></div>";
    }
    var idx = STEP_INDEX[p.estado_codigo] != null ? STEP_INDEX[p.estado_codigo] : 0;
    var entregado = p.estado_codigo === "entregado";
    var num = idx + 1;
    var pct = entregado ? 100 : Math.round((num / STEPS.length) * 100);
    var clave = fechaClave(p);
    var dias = clave && !entregado && idx >= 4 ? diasHasta(clave) : null;
    var sub = entregado ? "¡Gracias por su compra!" : dias != null ? (dias > 1 ? "Faltan aproximadamente " + dias + " días" : dias === 1 ? "Llega mañana" : dias === 0 ? "Llega hoy" : "En camino, muy pronto") : "La fecha es estimada y puede variar.";
    return '<div class="cta-card cta-pad">' +
      '<div style="display:flex;align-items:center;gap:8px"><h2 class="seg-estado">' + esc(STEPS[idx]) + "</h2>" +
      '<span class="seg-pill' + (entregado ? "" : " vivo") + '">' + (entregado ? "✓ Entregado" : "<i></i>En curso") + "</span></div>" +
      '<p class="cta-nota" style="margin-top:4px">' + esc(deUsted(p.notas_publicas) || NOTA[p.estado_codigo] || "") + "</p>" +
      '<div class="seg-barra" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + Math.max(6, pct) + '%"></i></div>' +
      '<p class="cta-nota" style="margin-top:6px;font-size:12px">Etapa ' + num + " de " + STEPS.length + " · " + pct + "% del proceso</p>" +
      '<div class="seg-fecha"><div><p class="cta-eyebrow" style="color:var(--texto)">' + (entregado ? "Entregado el" : "Entrega estimada") + "</p>" +
      '<b>' + esc(clave ? C.fecha(clave) : "Por confirmar") + "</b><span>" + esc(sub) + "</span></div>" +
      (dias != null && dias >= 0 && !entregado ? '<span class="seg-dias"><b>' + (dias === 0 ? "¡Hoy!" : dias) + "</b>" + (dias > 0 ? "<small>" + (dias === 1 ? "día" : "días") + "</small>" : "") + "</span>" : "") + "</div>" +
      '<p class="cta-nota" style="font-size:11.5px;line-height:1.5;margin-top:10px">El tiempo de entrega incluye unos días de preparación (aprox. 4-5 en envío estándar y 3-4 en rápido; algunos productos tardan más) y el resto es tránsito, que empieza a contar cuando su pedido sale en camino. Las fechas son aproximadas, no exactas: muchas veces las paqueterías retrasan los envíos.</p>' +
      '<button type="button" class="cta-btn linea" id="compartir" style="margin-top:12px">Compartir seguimiento</button></div>';
  }

  // Tiempos (preparación aprox. por producto y aviso de demora): función compartida de Mi cuenta.
  async function avisoDemora(p) {
    var cont = document.getElementById("segDemora");
    if (!cont || !C.avisoTiempos) return;
    var html = await C.avisoTiempos(p);
    if (html && document.body.contains(cont)) cont.innerHTML = '<div style="margin-top:12px;display:grid;gap:12px">' + html + "</div>";
  }

  var FOTO_LABEL = { control_calidad: "Control de calidad", recibido_hausline: "Su producto", producto: "Producto", empaque: "Empaquetado", recibido_local: "Recibido" };
  var FOTO_ORDEN = ["control_calidad", "recibido_hausline", "producto", "empaque", "recibido_local"];
  function galeria(p) {
    var g = [];
    FOTO_ORDEN.forEach(function (t) { (p.imagenes || []).forEach(function (f) { if (f.url && f.tipo === t) g.push({ url: f.url, titulo: FOTO_LABEL[t] }); }); });
    return g;
  }
  function tarjetaFotos(g) {
    if (!g.length) return "";
    return '<section class="cta-sec"><h2 class="cta-sec-h">Fotos de su pedido</h2><div class="cta-card cta-pad"><p class="cta-nota" style="margin:0 0 10px">Fotos reales de su producto en control de calidad y cada etapa. Toque una para verla en grande.</p>' +
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
      tarjetaPedido(p) + '<div style="margin-top:12px">' + tarjetaEstado(p) + "</div>" + '<div id="segDemora"></div>' +
      (cancelado ? "" : tarjetaFotos(g)) + tarjetaEtapas(p) + tarjetaDetalle(p) +
      '<section class="cta-sec"><div class="cta-card cta-pad"><p style="margin:0;font-weight:600">Todos sus pedidos en un solo lugar</p><p class="cta-nota" style="margin-top:4px">Opcional: cree su cuenta gratis con el mismo correo de su compra y verá todos sus pedidos juntos, desde cualquier teléfono.</p><a class="cta-btn linea" style="margin-top:12px" href="/cuenta/pedido/?id=' + encodeURIComponent(p.codigo) + '">Ir a Mi cuenta</a></div></section>' +
      '<section class="cta-sec"><div class="cta-card cta-pad seg-ayuda"><p style="margin:0;font-weight:600">¿Necesita ayuda con su pedido?</p><p class="cta-nota" style="margin-top:4px">Nuestro equipo está listo para ayudarle.</p><a class="cta-btn" style="margin-top:12px" href="' + C.linkWhatsApp("Hola, necesito ayuda con mi pedido " + p.codigo + ".") + '" target="_blank" rel="noopener noreferrer">WhatsApp HAUSLINE</a></div></section>';
    void avisoDemora(p)
    main.querySelectorAll("[data-foto]").forEach(function (b) { b.addEventListener("click", function () { C.visor(g, Number(b.dataset.foto)); }); });
    var bc = document.getElementById("compartir");
    if (bc) bc.addEventListener("click", async function () {
      var url = location.origin + "/pedido/?c=" + encodeURIComponent(p.codigo);
      try {
        if (navigator.share) await navigator.share({ title: "Pedido " + p.codigo + " · HAUSLINE", text: "Siga mi pedido HAUSLINE", url: url });
        else { await navigator.clipboard.writeText(url); C.aviso("Enlace copiado."); }
      } catch (e) { /* canceló el compartir */ }
    });
  }

  async function cargar(silencioso) {
    try {
      var p = await buscar(codigo, silencioso);
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
      if (silencioso && esDeRed(err)) return; // actualización en segundo plano: el cliente no vio nada
      S.error("seguimiento_error", codigo + " · " + ((err && err.message) || "Error"), { silencioso: !!silencioso });
      if (!silencioso) {
        main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar su pedido</p><p class="cta-nota">Puede ser su conexión o un problema nuestro. Intente de nuevo en un momento.</p>' +
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
