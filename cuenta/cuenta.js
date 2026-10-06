/* ============================================================
   HAUSLINE — Mi cuenta (módulo compartido)
   Autenticación REAL con Supabase Auth (misma base del panel de
   tracking = una sola fuente de verdad). La sesión la maneja
   supabase-js (tokens que se renuevan solos); aquí nunca se
   guardan contraseñas. Cada cliente solo puede leer SUS pedidos:
   lo garantiza la base (RPC pedido_cliente / mis_pedidos_cliente
   filtran por la cuenta), no este archivo.
   ============================================================ */
(function () {
  "use strict";

  var SB_URL = "https://epslwaxjemlysqtubbfu.supabase.co";
  var SB_KEY = "sb_publishable_bASR2lpLTORx-1pWbwvgiQ_fsjAuX2r"; // llave PÚBLICA (anon)
  var SITIO = location.origin && /^https?:/.test(location.origin) ? location.origin : "https://hauslineshopni.es";

  // Aviso silencioso al panel ("Salud de clientes") de lo que le falla al cliente.
  var S = window.HauslineSalud || { registrar: function () {}, error: function () {} };
  if (!window.supabase || !window.supabase.createClient) {
    document.documentElement.classList.add("cta-sin-sb");
    S.error("supabase_no_cargo", "No cargó el sistema de cuentas (supabase-js)");
  }
  var sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }) : null;

  /* ---------------- Estados oficiales (lo que ve el cliente) ----------------
     Los 15 estados internos del panel se agrupan en las 8 etapas oficiales. */
  var ETAPAS = [
    { id: "pendiente",   label: "Pendiente" },
    { id: "fabricacion", label: "En fabricación" },
    { id: "calidad",     label: "Control de calidad" },
    { id: "despachado",  label: "Despachado" },
    { id: "transito",    label: "En tránsito" },
    { id: "pais",        label: "Llegó al país" },
    { id: "disponible",  label: "Disponible" },
    { id: "entregado",   label: "Entregado" },
  ];
  var ESTADO_A_ETAPA = {
    pedido_confirmado: "pendiente", en_preparacion: "fabricacion", control_calidad: "calidad",
    etiqueta_creada: "despachado", despachado: "despachado",
    transito_internacional: "transito", recibido_estados_unidos: "transito", transito_nicaragua: "transito",
    llego_nicaragua: "pais", disponible_entrega: "disponible", pagado: "disponible", empaquetado: "disponible",
    entregado: "entregado",
  };
  function etapa(estado) {
    if (estado === "cancelado") return { id: "cancelado", label: "Cancelado", indice: -1 };
    var id = ESTADO_A_ETAPA[estado] || "pendiente";
    for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].id === id) return { id: id, label: ETAPAS[i].label, indice: i };
    return { id: "pendiente", label: "Pendiente", indice: 0 };
  }
  // Grupo para los filtros de "Mis pedidos".
  function grupo(estado) {
    var e = etapa(estado);
    if (e.id === "cancelado") return "cancelado";
    if (e.id === "entregado") return "entregado";
    if (e.indice <= 2) return "proceso";
    return "enviado";
  }

  /* ---------------- Utilidades ---------------- */
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function img(src) {
    var s = String(src || "").trim();
    if (!s) return "";
    if (/^(https?:|data:)/i.test(s)) return s;
    return "/" + s.replace(/^\/+/, "").split("/").map(function (seg) { return /%[0-9a-f]{2}/i.test(seg) ? seg : encodeURIComponent(seg); }).join("/");
  }
  function fecha(v, conHora) {
    if (!v) return "";
    var d = new Date(String(v).length === 10 ? v + "T12:00:00" : v);
    if (isNaN(d)) return "";
    var o = { day: "numeric", month: "short", year: "numeric" };
    if (conHora) { o.hour = "numeric"; o.minute = "2-digit"; }
    return new Intl.DateTimeFormat("es-NI", o).format(d).replace(/\./g, "");
  }
  function monto(v, moneda) {
    if (v == null) return "—";
    var n = Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (moneda === "NIO" ? "C$ " : "US$ ") + n;
  }
  function param(nombre) { try { return new URLSearchParams(location.search).get(nombre); } catch (e) { return null; } }
  // Solo rutas internas de /cuenta (evita redirecciones abiertas a otros sitios).
  function destinoSeguro(v, porDefecto) { return v && /^\/cuenta\//.test(v) && !/^\/\//.test(v) ? v : porDefecto; }

  // Errores que son del cliente (no del sistema): no se anotan como falla.
  var ERROR_DEL_CLIENTE = /invalid login|invalid credentials|email not confirmed|already registered|already exists|user already|characters|weak|rate limit|too many|security purposes/i;
  var ultimoMostrado = "";
  function mensajeError(error) {
    var m = (error && (error.message || error.error_description)) || "";
    if (error && !error.__registrado && esErrorDeRed(error)) { try { error.__registrado = true; } catch (e) {} S.registrar("sin_conexion", { mensaje: m }); }
    if (error && !error.__registrado && !error.validacion && !ERROR_DEL_CLIENTE.test(m)) {
      try { error.__registrado = true; } catch (e) {}
      S.error("error_visto", m || "Error sin mensaje", error.code ? { codigo: String(error.code) } : null);
    }
    ultimoMostrado = textoError(m);
    return ultimoMostrado;
  }
  // Error de validación (lo causó el cliente, no el sistema): mensajeError no lo anota.
  function errorCliente(m) { var e = new Error(m); e.validacion = true; return e; }
  function textoError(m) {
    if (/invalid login|invalid credentials/i.test(m)) return "Correo o contraseña incorrectos.";
    if (/email not confirmed/i.test(m)) return "Primero confirme su correo: le enviamos un enlace al registrarse.";
    if (/already registered|already exists|user already/i.test(m)) return "Ya existe una cuenta con ese correo. Ingrese o recupere su contraseña.";
    if (/password/i.test(m) && /(6|8) characters|short|weak/i.test(m)) return "La contraseña es muy débil: use al menos 8 caracteres.";
    if (/rate limit|too many|security purposes/i.test(m)) return "Demasiados intentos. Espere un minuto e intente de nuevo.";
    if (/signups? not allowed|signup is disabled/i.test(m)) return "El registro de cuentas todavía no está habilitado.";
    if (/failed to fetch|load failed|network|internet connection/i.test(m)) return "Sin conexión. Revise su internet e intente de nuevo.";
    return m || "Algo salió mal. Intente de nuevo.";
  }

  /* ---------------- Sesión ---------------- */
  async function sesion() {
    if (!sb) return null;
    var r = await sb.auth.getSession();
    return r && r.data ? r.data.session : null;
  }
  // Protege una página: sin sesión → a ingresar, y vuelve aquí después.
  async function exigirSesion() {
    var s = await sesion();
    if (!s) {
      location.replace("/cuenta/ingresar/?volver=" + encodeURIComponent(location.pathname + location.search));
      return null;
    }
    // Si la sesión se cierra o vence sin poder renovarse, volvemos al ingreso.
    sb.auth.onAuthStateChange(function (evento) {
      if (evento === "SIGNED_OUT") location.replace("/cuenta/ingresar/?volver=" + encodeURIComponent(location.pathname + location.search));
    });
    return s;
  }
  async function salir() {
    if (sb) { try { await sb.auth.signOut(); } catch (e) {} }
    location.replace("/cuenta/ingresar/");
  }

  /* ---------------- Datos (RPCs con RLS) ---------------- */
  // Si el token venció y supabase-js no lo pudo renovar (típico al volver a la pestaña en el
  // teléfono, sin red todavía), la llamada sale como visitante y la base responde "permission
  // denied" (42501) o JWT vencido (PGRST301/PGRST303). No es falla del sistema: se renueva la
  // sesión y se reintenta una vez; si la sesión ya no existe, se vuelve a ingresar.
  function esErrorDeSesion(e) {
    return !!e && (e.code === "42501" || e.code === "PGRST301" || e.code === "PGRST303" || /jwt expired|permission denied for function/i.test(e.message || ""));
  }
  // Falla de RED (el teléfono perdió señal, cambió de wifi a datos, la app quedó en segundo
  // plano): en iPhone llega como "TypeError: Load failed". No es falla del sistema: se
  // reintenta solo y, si sigue sin red, se anota como evento "sin_conexion" (no como error).
  function esErrorDeRed(e) {
    var m = (e && (e.message || e.details)) || String(e || "");
    return /load failed|failed to fetch|networkerror|network request failed|fetch failed|network connection was lost|internet connection appears|^network:/i.test(m);
  }
  function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function esperarConexion(max) {
    return new Promise(function (r) {
      var hecho = false; function fin() { if (hecho) return; hecho = true; window.removeEventListener("online", fin); r(); }
      window.addEventListener("online", fin); setTimeout(fin, max);
    });
  }
  var yendoAIngresar = false;
  function irAIngresar() {
    if (yendoAIngresar) return;
    yendoAIngresar = true;
    S.registrar("sesion_vencida");
    location.replace("/cuenta/ingresar/?volver=" + encodeURIComponent(location.pathname + location.search));
  }
  async function llamar(nombre, args) {
    var r;
    for (var i = 0; i < 3; i++) {
      try { r = await sb.rpc(nombre, args || {}); } catch (e) { r = { data: null, error: e }; }
      if (!r.error || !esErrorDeRed(r.error)) break;
      if (i < 2) { if (navigator.onLine === false) await esperarConexion(8000); else await esperar(i ? 2500 : 900); }
    }
    if (r.error && esErrorDeRed(r.error)) { try { r.error.red = true; } catch (e) {} return r; }
    if (!r.error || !esErrorDeSesion(r.error)) return r;
    var s = await sb.auth.getSession();
    if (s && s.data && s.data.session) return sb.rpc(nombre, args || {});
    var e;
    if (s && s.error && s.error.name === "AuthRetryableFetchError") {
      // No se pudo renovar por falta de red: la sesión sigue guardada y se renueva sola después.
      e = new Error("network: no se pudo renovar la sesión");
    } else {
      irAIngresar();
      e = new Error("Su sesión expiró. Vuelva a ingresar.");
    }
    e.__registrado = true; e.sesion = true;
    return { data: null, error: e };
  }
  async function rpc(nombre, args) {
    var r = await llamar(nombre, args);
    if (r.error) {
      if (r.error.sesion) throw r.error;
      if (r.error.red) { S.registrar("sin_conexion", { mensaje: nombre }); try { r.error.__registrado = true; } catch (e) {} throw r.error; }
      S.error("rpc_error", (r.error.message || "Error") + " · " + nombre, { funcion: nombre, codigo: r.error.code || null });
      try { r.error.__registrado = true; } catch (e) {}
      throw r.error;
    }
    return r.data;
  }
  async function cuenta() { return rpc("mi_cuenta_cliente"); }
  async function misPedidos() { var d = await rpc("mis_pedidos_cliente"); return Array.isArray(d) ? d : []; }
  async function pedido(codigo) { return rpc("pedido_cliente", { p_codigo: codigo }); }
  // Encargos web todavía sin confirmar (esperando pago / pago en revisión / vencidos recientes).
  // Si falla, no rompe la página: la cuenta sigue mostrando los pedidos igual.
  async function misEncargos() {
    try {
      var r = await llamar("mis_encargos_cliente");
      // PGRST202 = la función todavía no existe en la base (migración sin aplicar): no es falla del cliente.
      if (r.error && r.error.red) { S.registrar("sin_conexion", { mensaje: "mis_encargos_cliente" }); return []; }
      if (r.error) { if (r.error.code !== "PGRST202" && !r.error.sesion) S.error("rpc_error", (r.error.message || "Error") + " · mis_encargos_cliente", { funcion: "mis_encargos_cliente", codigo: r.error.code || null }); return []; }
      return Array.isArray(r.data) ? r.data : [];
    } catch (e) { return []; }
  }

  /* ---------------- Tarjetas de encargos por confirmar ---------------- */
  var CAJA_ENC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>';
  function tarjetaEncargo(e) {
    var prods = e.productos || [];
    var p0 = prods[0] || {};
    var foto = img(p0.imagen);
    var nombre = (prods.length > 1 ? prods.length + " productos · " : "") + [p0.marca, p0.producto].filter(Boolean).join(" · ");
    var enRevision = !!e.pago_reportado;
    var vencida = e.estado === "vencida" && !enRevision;
    var mitad = e.pago_tipo === "50" && Number(e.abono) > 0 && Number(e.abono) < Number(e.total);
    var estadoHtml = enRevision ? '<span class="cta-estado revision"><i></i>Pago en revisión</span>'
      : vencida ? '<span class="cta-estado cancelado"><i></i>Venció el plazo de pago</span>'
      : '<span class="cta-estado espera"><i></i>Esperando su pago</span>';
    // Últimas 3 horas sin pago: aviso en rojo con el tiempo que le queda.
    var minutos = e.vence ? Math.max(0, Math.round((new Date(e.vence).getTime() - Date.now()) / 60000)) : null;
    var porVencer = !enRevision && !vencida && minutos != null && minutos <= 180;
    var queda = minutos == null ? "" : minutos >= 60 ? Math.floor(minutos / 60) + " h" + (minutos % 60 ? " " + (minutos % 60) + " min" : "") : minutos + " min";
    var alerta = porVencer ? '<div class="cta-alerta-vence">⚠️ Su encargo vence en ' + esc(queda) + ". Pague y envíe su comprobante antes, o se cancela solo.</div>" : "";
    var detalle = enRevision
      ? "Recibimos su aviso de pago" + (e.comprobante ? " y su comprobante" : "") + ". Lo estamos revisando: cuando lo confirmemos, su pedido pasa a “Mis pedidos” con su código HS y le avisamos por correo."
      : vencida ? "El plazo para pagar venció y el encargo se canceló. Si ya pagó o desea retomarlo, escríbanos por WhatsApp."
      : "Tiene hasta el " + fecha(e.vence, true) + " para pagar y enviar su comprobante. Si no, el encargo se cancela solo.";
    var boton = enRevision ? ""
      : vencida ? '<a class="cta-btn linea" style="margin-top:12px" href="' + linkWhatsApp("Hola, mi encargo " + e.codigo + " venció. ¿Me ayudan a retomarlo?") + '" target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>'
      : '<a class="cta-btn" style="margin-top:12px" href="/checkout/?c=' + encodeURIComponent(e.codigo) + '">Pagar y enviar comprobante</a>';
    return '<div class="cta-card cta-pad cta-encargo">' +
      '<div style="display:flex;gap:14px;align-items:center"><span class="cta-foto">' + (foto ? '<img src="' + esc(foto) + '" alt="" loading="lazy">' : CAJA_ENC) + "</span>" +
      '<div class="cta-pedido-info"><span class="cta-cod">Encargo #' + esc(e.codigo) + "</span>" +
      '<span class="cta-prod">' + esc(nombre || "Su encargo") + "</span>" +
      '<span class="cta-prod" style="color:var(--texto-3);white-space:normal">' + esc(fecha(e.creado)) + " · Total " + esc(monto(e.total)) + (mitad ? " · paga 50%: " + esc(monto(e.abono)) : "") + "</span>" +
      estadoHtml + "</div></div>" + alerta +
      (porVencer ? "" : '<p class="cta-nota" style="font-size:13px;line-height:1.5;margin:12px 0 0">' + esc(detalle) + "</p>") + boton + "</div>";
  }
  function seccionEncargos(lista) {
    if (!lista || !lista.length) return "";
    return '<section class="cta-sec"><div class="cta-sec-h"><span>Esperando confirmación</span></div>' + lista.map(tarjetaEncargo).join("") + "</section>";
  }
  async function urlsFotos(rutas) {
    if (!rutas.length) return [];
    var r = await sb.storage.from("pedidos").createSignedUrls(rutas, 3600);
    return (r.data || []).map(function (x) { return x && x.signedUrl ? x.signedUrl : null; });
  }

  /* ---------------- Aviso breve (toast) ---------------- */
  // sinRegistro = true para errores del CLIENTE (campo vacío, formato de foto, permiso de
  // ubicación): se muestran en rojo pero no se anotan como falla del sistema en el panel.
  function aviso(texto, tipo, sinRegistro) {
    // Errores que ve el cliente y que no vinieron de mensajeError (esos ya se anotaron allí).
    if (tipo === "error" && !sinRegistro && texto !== ultimoMostrado) S.error("aviso_error", texto);
    var t = document.createElement("div");
    t.className = "cta-toast" + (tipo === "error" ? " es-error" : "");
    t.setAttribute("role", "status");
    t.textContent = texto;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("on"); });
    setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.remove(); }, 300); }, 3800);
  }

  /* ---------------- Perfil ---------------- */
  async function uid() { var s = await sesion(); return s ? s.user.id : null; }
  async function actualizarCuenta(cambios) {
    var id = await uid();
    if (!id) throw new Error("Su sesión expiró. Vuelva a ingresar.");
    var r = await sb.from("cuentas_cliente").update(Object.assign({}, cambios, { updated_at: new Date().toISOString() })).eq("user_id", id);
    if (r.error) throw r.error;
    // La moneda elegida también la usa la tienda para mostrar precios.
    if (cambios.moneda) { try { localStorage.setItem("hausline_moneda", cambios.moneda); } catch (e) {} }
  }
  function urlAvatar(path) {
    if (!path) return null;
    return sb.storage.from("avatares").getPublicUrl(path).data.publicUrl;
  }
  // Recibe la foto YA recortada (Blob JPEG del editor de encuadre).
  async function subirAvatar(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw errorCliente("Use una foto JPG, PNG o WebP.");
    if (file.size > 3 * 1024 * 1024) throw errorCliente("La foto pesa más de 3 MB.");
    var anterior = null;
    try { var c = await cuenta(); anterior = c && c.avatar_path; } catch (e) {}
    var id = await uid();
    if (!id) throw new Error("Su sesión expiró. Vuelva a ingresar.");
    var ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    var path = id + "/avatar-" + Date.now() + "." + ext; // nombre nuevo: evita la foto vieja en caché
    var r = await sb.storage.from("avatares").upload(path, file, { contentType: file.type, upsert: true });
    if (r.error) throw r.error;
    await actualizarCuenta({ avatar_path: path });
    // Borra la foto anterior para no acumular archivos.
    if (anterior && anterior !== path) { try { await sb.storage.from("avatares").remove([anterior]); } catch (e) {} }
    return path;
  }

  async function quitarAvatar(pathActual) {
    await actualizarCuenta({ avatar_path: null });
    if (pathActual) { try { await sb.storage.from("avatares").remove([pathActual]); } catch (e) {} }
  }

  // Elimina la cuenta del cliente (correo, contraseña, teléfono, foto, direcciones y favoritos).
  // Sus pedidos se conservan en HAUSLINE. Pide la contraseña otra vez (inicio de sesión reciente).
  async function eliminarCuenta(password) {
    var s = await sesion();
    if (!s) throw new Error("Su sesión expiró. Vuelva a ingresar.");
    var r = await sb.auth.signInWithPassword({ email: s.user.email, password: password });
    if (r.error) throw r.error;
    var res = await fetch("https://hausline-tracking.vercel.app/api/eliminar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + r.data.session.access_token },
      body: JSON.stringify({ propia: true }),
    });
    var j = await res.json().catch(function () { return {}; });
    if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo eliminar la cuenta. Intente de nuevo.");
    try { await sb.auth.signOut({ scope: "local" }); } catch (e) {}
    try { localStorage.removeItem(FAV_KEY); } catch (e) {}
  }

  /* ---------------- Direcciones y delivery ---------------- */
  async function direcciones() {
    var r = await sb.from("direcciones_cliente").select("*").order("predeterminada", { ascending: false }).order("created_at");
    if (r.error) throw r.error;
    return r.data || [];
  }
  async function guardarDireccion(datos, id) {
    var q = id ? sb.from("direcciones_cliente").update(Object.assign({}, datos, { updated_at: new Date().toISOString() })).eq("id", id)
               : sb.from("direcciones_cliente").insert(datos);
    var r = await q.select("*").single();
    if (r.error) throw new Error(/10 direcciones/.test(r.error.message || "") ? "Puede guardar hasta 10 direcciones." : "No se pudo guardar la dirección.");
    return r.data;
  }
  async function eliminarDireccion(id) { var r = await sb.from("direcciones_cliente").delete().eq("id", id); if (r.error) throw r.error; }
  async function hacerPredeterminada(id) { var r = await sb.from("direcciones_cliente").update({ predeterminada: true }).eq("id", id); if (r.error) throw r.error; }
  async function tarifas() { var r = await sb.from("tarifas_delivery").select("zona,costo,moneda").eq("activo", true); return r.error ? [] : (r.data || []); }
  function sinAcento(v) { return String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase(); }
  // Costo de delivery: el fijado por el admin para ESA dirección; si no, la tarifa de su
  // departamento (Nicaragua). null = "a cotizar por WhatsApp".
  function costoDelivery(dir, lista) {
    if (!dir) return null;
    if (dir.costo_delivery != null) return Number(dir.costo_delivery);
    if (sinAcento(dir.pais) !== "nicaragua") return null;
    var zona = sinAcento(dir.departamento) || sinAcento(dir.ciudad);
    for (var i = 0; i < lista.length; i++) if (sinAcento(lista[i].zona) === zona) return Number(lista[i].costo);
    return null;
  }
  function lineasDireccion(d) {
    var ciudad = [d.ciudad, d.departamento && sinAcento(d.departamento) !== sinAcento(d.ciudad) ? d.departamento : null].filter(Boolean).join(", ");
    return [d.direccion, d.referencia, ciudad + ", " + d.pais, d.codigo_postal ? "CP: " + d.codigo_postal : null].filter(Boolean);
  }
  async function entrega(codigo) { try { return await rpc("entrega_pedido_cliente", { p_codigo: codigo }); } catch (e) { return null; } }
  async function solicitarEntrega(codigo, direccionId) { return rpc("solicitar_entrega_pedido", { p_codigo: codigo, p_direccion_id: direccionId }); }
  var WHATSAPP = "50578995116";
  // Cancelación = SOLICITUD de reembolso que revisa HAUSLINE (la base valida etapa y motivo).
  async function reembolso(codigo) { try { return await rpc("reembolso_pedido_cliente", { p_codigo: codigo }); } catch (e) { return null; } }
  async function solicitarReembolso(codigo, d) {
    var r = await rpc("solicitar_reembolso_pedido", { p_codigo: codigo, p_motivo: d.motivo, p_detalle: d.detalle, p_banco: d.banco, p_numero_cuenta: d.numero, p_titular: d.titular });
    // Aviso por correo al admin (best-effort: la solicitud ya quedó guardada y el panel la muestra igual).
    try {
      var s = await sesion();
      if (s && r && r.id) {
        fetch("https://hausline-tracking.vercel.app/api/notificar-estado", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.access_token },
          body: JSON.stringify({ reembolso: "nuevo", id: r.id }),
        }).catch(function () {});
      }
    } catch (e) {}
    return r;
  }
  async function decidirReembolso(codigo, decision) {
    var r = await rpc("decidir_reembolso_pedido", { p_codigo: codigo, p_decision: decision });
    // Eligió cancelar SIN reembolso: aviso por correo al admin para que cancele el pedido (best-effort).
    try {
      var s = await sesion();
      if (decision === "cancelar_sin_reembolso" && r && r.id && !r.vencido && s) {
        fetch("https://hausline-tracking.vercel.app/api/notificar-estado", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.access_token },
          body: JSON.stringify({ reembolso: "decision", id: r.id }),
        }).catch(function () {});
      }
    } catch (e) {}
    return r;
  }

  function mensajeEnvio(codigo, d, costo) {
    var mapa = d.lat != null && d.lng != null ? "\nUbicación: https://maps.google.com/?q=" + Number(d.lat).toFixed(6) + "," + Number(d.lng).toFixed(6) : "";
    return "Hola, quiero solicitar el envío de mi pedido #" + codigo + " a la dirección registrada. ¿Podrían confirmar la entrega?\n\n📍 " + d.nombre + "\n" +
      lineasDireccion(d).join("\n") + mapa + "\nDelivery: " + (costo != null ? monto(costo) : "a cotizar");
  }
  function linkWhatsApp(texto) { return "https://wa.me/" + WHATSAPP + (texto ? "?text=" + encodeURIComponent(texto) : ""); }

  /* ---------------- Lista de deseos (sincronizada con el corazón de la tienda) ----------------
     La tienda guarda los favoritos en este navegador (hausline_favoritos = códigos). Al entrar a
     Mi cuenta se suben a la cuenta y los de la cuenta bajan al navegador: así el cliente los ve
     en cualquier teléfono. */
  var FAV_KEY = "hausline_favoritos";
  function favLocales() { try { var a = JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); return Array.isArray(a) ? a.map(String) : []; } catch (e) { return []; } }
  function guardarFavLocales(a) { try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch (e) {} }
  async function favoritosCuenta() {
    var r = await sb.from("favoritos_cliente").select("codigo,nombre,marca,precio,imagen,created_at").order("created_at", { ascending: false });
    if (r.error) throw r.error;
    return r.data || [];
  }
  // datosDe(codigo) → { nombre, marca, precio, imagen } o null (catálogo de la tienda).
  async function sincronizarFavoritos(datosDe) {
    var remotos = await favoritosCuenta();
    var locales = favLocales();
    var enCuenta = {};
    remotos.forEach(function (f) { enCuenta[f.codigo] = true; });
    var subir = locales.filter(function (c) { return !enCuenta[c]; }).map(function (c) {
      var d = datosDe ? datosDe(c) : null;
      return d ? { codigo: c, nombre: d.nombre, marca: d.marca || null, precio: d.precio || null, imagen: d.imagen || null } : null;
    }).filter(Boolean);
    if (subir.length) {
      var r = await sb.from("favoritos_cliente").upsert(subir, { onConflict: "user_id,codigo", ignoreDuplicates: true });
      if (!r.error) remotos = await favoritosCuenta();
    }
    var union = locales.slice();
    remotos.forEach(function (f) { if (union.indexOf(f.codigo) === -1) union.push(f.codigo); });
    guardarFavLocales(union);
    return remotos;
  }
  async function quitarFavorito(codigo) {
    var r = await sb.from("favoritos_cliente").delete().eq("codigo", codigo);
    if (r.error) throw r.error;
    guardarFavLocales(favLocales().filter(function (c) { return c !== codigo; }));
  }

  /* ---------------- Interfaz compartida ---------------- */
  var ICONOS = {
    inicio: '<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    favoritos: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    cuenta: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    pedidos: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  };
  // Navegación inferior fija, TODO dentro de Mi cuenta (no manda a la tienda):
  // Inicio | Pedidos | Deseos | Perfil. La tienda se abre desde su propio enlace.
  function navInferior(activo) {
    if (activo === "cuenta") {
      var ruta = location.pathname;
      activo = /\/cuenta\/pedidos?\//.test(ruta) ? "pedidos" : /\/cuenta\/(datos|direccion|direcciones)\//.test(ruta) ? "perfil" : "inicio";
    }
    var items = [["inicio", "/cuenta/", "Inicio"], ["pedidos", "/cuenta/pedidos/", "Pedidos"], ["favoritos", "/cuenta/favoritos/", "Deseos"], ["perfil", "/cuenta/datos/", "Perfil"]];
    var nav = document.createElement("nav");
    nav.className = "cta-nav";
    nav.setAttribute("aria-label", "Navegación");
    nav.innerHTML = '<div class="cta-nav-in">' + items.map(function (it) {
      var on = it[0] === activo;
      return '<a href="' + it[1] + '" class="' + (on ? "on" : "") + '"' + (on ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true"' + (on && it[0] !== "buscar" && it[0] !== "inicio" ? ' class="lleno"' : "") + ">" + ICONOS[it[0]] + "</svg>" + it[2] + "</a>";
    }).join("") + "</div>";
    document.body.appendChild(nav);
    document.body.classList.add("con-nav");
  }
  // Hoja inferior (bottom sheet). Devuelve { cerrar, panel }.
  function hoja(html, titulo) {
    var cont = document.createElement("div");
    cont.className = "cta-hoja";
    cont.setAttribute("role", "dialog");
    cont.setAttribute("aria-modal", "true");
    cont.innerHTML = '<button type="button" class="cta-hoja-fondo" aria-label="Cerrar"></button><div class="cta-hoja-panel"><span class="cta-hoja-asa" aria-hidden="true"></span>' +
      (titulo ? '<h2 class="cta-hoja-t">' + esc(titulo) + "</h2>" : "") + '<div class="cta-hoja-c"></div></div>';
    cont.querySelector(".cta-hoja-c").innerHTML = html;
    document.body.appendChild(cont);
    document.body.style.overflow = "hidden";
    function cerrar() { document.removeEventListener("keydown", esc_); document.body.style.overflow = ""; cont.remove(); }
    function esc_(e) { if (e.key === "Escape") cerrar(); }
    document.addEventListener("keydown", esc_);
    cont.querySelector(".cta-hoja-fondo").addEventListener("click", cerrar);
    return { cerrar: cerrar, panel: cont.querySelector(".cta-hoja-c") };
  }

  /* ---------------- Mapa (tiles de OpenStreetMap, sin librerías) ---------------- */
  var MANAGUA = { lat: 12.1364, lng: -86.2514 };
  var T = 256;
  function lx(lng, z) { return ((lng + 180) / 360) * T * Math.pow(2, z); }
  function ly(lat, z) { var r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * T * Math.pow(2, z); }
  function xl(x, z) { return (x / (T * Math.pow(2, z))) * 360 - 180; }
  function yl(y, z) { var n = Math.PI - (2 * Math.PI * y) / (T * Math.pow(2, z)); return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); }
  // mapa(el, { lat, lng, zoom, interactivo, onCambio }) → { poner(lat,lng,zoom) }
  function mapa(el, o) {
    o = o || {};
    var pos = { lat: o.lat != null ? Number(o.lat) : null, lng: o.lng != null ? Number(o.lng) : null };
    var zoom = o.zoom || (pos.lat != null ? 16 : 13);
    var dx = 0, dy = 0, ini = null;
    el.classList.add("cta-mapa");
    if (o.interactivo) el.classList.add("interactivo");
    el.innerHTML = '<div class="cta-mapa-t"></div>' +
      '<svg class="cta-mapa-pin" viewBox="0 0 24 32" width="26" height="34" aria-hidden="true"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 32 12 32s12-11.2 12-20.1C24 5.3 18.6 0 12 0Z" fill="#171310"/><circle cx="12" cy="11.8" r="4.4" fill="#fff"/></svg>' +
      '<span class="cta-mapa-vacio">Sin ubicación en el mapa</span>' +
      (o.interactivo ? '<div class="cta-mapa-z"><button type="button" data-z="1" aria-label="Acercar">+</button><button type="button" data-z="-1" aria-label="Alejar">−</button></div>' : "") +
      '<span class="cta-mapa-a">© OpenStreetMap</span>';
    var capa = el.querySelector(".cta-mapa-t");
    function pintar() {
      var w = el.clientWidth || 320, h = el.clientHeight || 130;
      var c = { lat: pos.lat != null ? pos.lat : MANAGUA.lat, lng: pos.lng != null ? pos.lng : MANAGUA.lng };
      var cx = lx(c.lng, zoom) - dx, cy = ly(c.lat, zoom) - dy, x0 = cx - w / 2, y0 = cy - h / 2, n = Math.pow(2, zoom), html = "";
      for (var tx = Math.floor(x0 / T); tx <= Math.floor((x0 + w) / T); tx++) {
        for (var ty = Math.floor(y0 / T); ty <= Math.floor((y0 + h) / T); ty++) {
          if (ty < 0 || ty >= n) continue;
          html += '<img alt="" draggable="false" src="https://tile.openstreetmap.org/' + zoom + "/" + (((tx % n) + n) % n) + "/" + ty + '.png" style="left:' + (tx * T - x0) + "px;top:" + (ty * T - y0) + 'px">';
        }
      }
      capa.innerHTML = html;
      el.classList.toggle("sin-ubicacion", pos.lat == null && !o.interactivo);
      return { cx: cx, cy: cy };
    }
    if (o.interactivo) {
      el.addEventListener("pointerdown", function (e) { if (e.target.closest("button")) return; ini = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); el.classList.add("arrastrando"); });
      el.addEventListener("pointermove", function (e) { if (!ini) return; dx = e.clientX - ini.x; dy = e.clientY - ini.y; pintar(); });
      var soltar = function () {
        if (!ini) return;
        ini = null; el.classList.remove("arrastrando");
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          var p = pintar();
          pos = { lat: yl(p.cy, zoom), lng: xl(p.cx, zoom) };
          dx = 0; dy = 0; pintar();
          if (o.onCambio) o.onCambio(pos);
        }
      };
      el.addEventListener("pointerup", soltar);
      el.addEventListener("pointercancel", soltar);
      el.querySelectorAll("[data-z]").forEach(function (b) {
        b.addEventListener("click", function () { zoom = Math.max(5, Math.min(19, zoom + Number(b.dataset.z))); pintar(); });
      });
    }
    pintar();
    window.addEventListener("resize", pintar);
    return {
      poner: function (lat, lng, z) { pos = { lat: lat, lng: lng }; if (z) zoom = z; dx = dy = 0; pintar(); if (o.onCambio) o.onCambio(pos); },
      quitar: function () { pos = { lat: null, lng: null }; pintar(); },
    };
  }

  /* ---------------- Visor de fotos (pantalla completa, anterior/siguiente) ---------------- */
  function visor(fotos, inicio) {
    if (!fotos.length) return;
    var i = inicio || 0;
    var v = document.createElement("div");
    v.className = "cta-visor";
    v.setAttribute("role", "dialog");
    v.setAttribute("aria-modal", "true");
    v.innerHTML = '<button type="button" class="cta-visor-x" aria-label="Cerrar">✕</button>' +
      '<button type="button" class="cta-visor-n prev" aria-label="Anterior">‹</button><figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="cta-visor-n next" aria-label="Siguiente">›</button>';
    document.body.appendChild(v);
    document.body.style.overflow = "hidden";
    var imgEl = v.querySelector("img"), cap = v.querySelector("figcaption");
    function mostrar() {
      imgEl.src = fotos[i].url;
      cap.textContent = (fotos[i].titulo ? fotos[i].titulo + " · " : "") + (i + 1) + " de " + fotos.length;
      v.querySelector(".prev").hidden = v.querySelector(".next").hidden = fotos.length < 2;
    }
    function cerrar() { document.removeEventListener("keydown", tecla); document.body.style.overflow = ""; v.remove(); }
    function mover(d) { i = (i + d + fotos.length) % fotos.length; mostrar(); }
    function tecla(e) { if (e.key === "Escape") cerrar(); if (e.key === "ArrowLeft") mover(-1); if (e.key === "ArrowRight") mover(1); }
    v.querySelector(".cta-visor-x").addEventListener("click", cerrar);
    v.querySelector(".prev").addEventListener("click", function () { mover(-1); });
    v.querySelector(".next").addEventListener("click", function () { mover(1); });
    v.addEventListener("click", function (e) { if (e.target === v) cerrar(); });
    var x0 = null;
    v.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    v.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1); x0 = null; });
    document.addEventListener("keydown", tecla);
    mostrar();
  }

  /* ---------------- Actualización automática ----------------
     Vuelve a consultar cada `ms` (solo con la pestaña visible) y al volver a la pestaña, para
     que un cambio de estado hecho en el panel aparezca sin recargar. `fn` debe repintar solo
     si algo cambió. No corre mientras hay una hoja abierta (para no interrumpir al cliente). */
  function autoActualizar(fn, ms) {
    var ocupado = false;
    async function correr() {
      if (ocupado || document.visibilityState !== "visible" || document.querySelector(".cta-hoja")) return;
      ocupado = true;
      try { await fn(); } catch (e) { /* sin red: se reintenta en la próxima vuelta */ } finally { ocupado = false; }
    }
    setInterval(correr, ms || 20000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") correr(); });
    window.addEventListener("focus", correr);
  }


  // ── Tiempos del pedido (Mi cuenta + link de seguimiento) ──────────────────────────────────
  // Lee del catálogo (admin de la tienda) la preparación aprox. de cada producto (prepMin/prepMax,
  // p. ej. Golden Goose 5 a 7 días) y si "puede tardar más" (demoraExtendida). Devuelve el HTML de:
  //   · "Estamos preparando su pedido · preparación aprox. 5 a 7 días · lleva N días" (en preparación)
  //   · "Este producto tarda más de lo normal" (productos marcados con demora)
  var CATALOGO_URL = "https://xgdijumnmaqfirmckugw.supabase.co", CATALOGO_KEY = "sb_publishable_NwpQth6G3qhpvtnRan3Xfg_8EqPM4Pw";
  var tiemposCache = {};
  async function datosCatalogo(codigos) {
    var faltan = codigos.filter(function (c) { return !(c in tiemposCache); });
    if (faltan.length) {
      faltan.forEach(function (c) { tiemposCache[c] = null; });
      try {
        var r = await fetch(CATALOGO_URL + "/rest/v1/catalogo_web?select=codigo,datos&codigo=in.(" + faltan.map(encodeURIComponent).join(",") + ")", { headers: { apikey: CATALOGO_KEY, Authorization: "Bearer " + CATALOGO_KEY } });
        var filas = r.ok ? await r.json() : [];
        (Array.isArray(filas) ? filas : []).forEach(function (row) {
          var d = (row && row.datos) || {};
          var pmin = Math.round(Number(d.prepMin) || 0), pmax = Math.max(pmin, Math.round(Number(d.prepMax) || 0));
          tiemposCache[String(row.codigo).toUpperCase()] = {
            prep: pmin > 0 ? { min: pmin, max: pmax } : null,
            demora: d.demoraExtendida === true ? { nota: String(d.notaDemora || "").trim() } : null,
          };
        });
      } catch (e) { /* sin catálogo: se usan los tiempos generales */ }
    }
    return codigos.map(function (c) { return tiemposCache[c]; }).filter(Boolean);
  }
  var EN_PREPARACION = { pedido_confirmado: 1, en_preparacion: 1, control_calidad: 1 };
  function esPrep(h) { return h.estado_codigo ? (h.estado_codigo === "en_preparacion" || h.estado_codigo === "control_calidad") : /prepar|calidad/i.test(String(h.estado || "")); }
  function esConfirmado(h) { return h.estado_codigo ? h.estado_codigo === "pedido_confirmado" : /confirm/i.test(String(h.estado || "")); }
  async function avisoTiempos(p) {
    if (!p || p.estado_codigo === "entregado" || p.estado_codigo === "cancelado") return "";
    var codigos = (p.productos || []).map(function (o) { return String(o.codigo || "").trim().toUpperCase(); }).filter(Boolean);
    var datos = codigos.length ? await datosCatalogo(codigos) : [];
    // Días que tomó / lleva la preparación según el historial.
    var ini = null, fin = null;
    (p.historial || []).slice().sort(function (a, b) { return new Date(a.fecha) - new Date(b.fecha); }).forEach(function (h) {
      var t = new Date(h.fecha).getTime();
      if (esPrep(h) && ini == null) ini = t;
      else if (ini != null && fin == null && !esPrep(h) && !esConfirmado(h) && t >= ini) fin = t;
    });
    var dias = ini != null ? Math.max(0, Math.round(((fin != null ? fin : Date.now()) - ini) / 86400000)) : null;
    var html = "";
    if (EN_PREPARACION[p.estado_codigo]) {
      var preps = datos.map(function (d) { return d.prep; }).filter(Boolean);
      var prep = preps.length ? preps.reduce(function (a, b) { return { min: Math.max(a.min, b.min), max: Math.max(a.max, b.max) }; })
        : { min: 4, max: 5 }; // la preparación es la misma en estándar y rápido
      var rango = prep.min === prep.max ? prep.min + (prep.min === 1 ? " día" : " días") : prep.min + " a " + prep.max + " días";
      html += '<div class="cta-card cta-pad cta-tiempo">' +
        '<p class="cta-tiempo-t">Estamos preparando su pedido</p>' +
        '<div class="cta-tiempo-fila"><span>Tiempo de preparación aprox.</span><b>' + rango + "</b></div>" +
        (dias != null && ini != null && fin == null ? '<div class="cta-tiempo-fila"><span>Lleva en preparación</span><b>' + dias + (dias === 1 ? " día" : " días") + "</b></div>" : "") +
        '<p class="cta-nota" style="margin:8px 0 0;font-size:12px;line-height:1.5">Cuando esté listo pasa a control de calidad y le enviamos las fotos para que lo revise.</p></div>';
    }
    var demoras = datos.map(function (d) { return d.demora; }).filter(Boolean);
    if (demoras.length) {
      var linea = dias != null && dias > 0
        ? (ini != null && fin == null ? "Su producto lleva <b>" + dias + " " + (dias === 1 ? "día" : "días") + "</b> en preparación." : "La preparación de su producto tomó <b>" + dias + " " + (dias === 1 ? "día" : "días") + "</b>.")
        : "Su producto requiere más tiempo de preparación que lo normal.";
      var nota = demoras.map(function (d) { return d.nota; }).filter(Boolean)[0];
      html += '<div class="cta-card cta-pad cta-demora">' +
        '<p class="cta-demora-t">⏳ Este producto tarda más de lo normal</p>' +
        '<p class="cta-nota" style="margin:6px 0 0;line-height:1.55">' + linea + " El tiempo en tránsito también puede demorar más de lo estimado." +
        (nota ? " " + esc(nota.replace(/[.\s]+$/, "")) + "." : "") + " Le avisaremos por correo cualquier novedad.</p></div>";
    }
    return html;
  }

  // ── Fotos de producto centradas ─────────────────────────────────────────────────────────
  // Muchas fotos traen el producto corrido (p. ej. Golden Goose abajo a un lado). Se mira la foto
  // en un canvas chiquito, se ubica el producto (lo que no es color de fondo) y se centra en su
  // cuadro con un margen; el cuadro toma el color de fondo de la foto. Se aplica solo a las fotos
  // de .cta-foto y de la vitrina, también a las que se agregan después.
  function encuadreFoto(img) {
    var N = 64, W = img.naturalWidth, H = img.naturalHeight;
    if (!W || !H) return null;
    var k = N / Math.max(W, H), cw = Math.max(1, Math.round(W * k)), ch = Math.max(1, Math.round(H * k));
    var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    var ctx = cv.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, cw, ch);
    var px = ctx.getImageData(0, 0, cw, ch).data;
    var esq = [0, (cw - 1) * 4, ((ch - 1) * cw) * 4, ((ch - 1) * cw + cw - 1) * 4];
    var fr = 0, fg = 0, fb = 0; esq.forEach(function (i) { fr += px[i] / 4; fg += px[i + 1] / 4; fb += px[i + 2] / 4; });
    var x0 = cw, y0 = ch, x1 = -1, y1 = -1;
    for (var y = 0; y < ch; y++) for (var x = 0; x < cw; x++) {
      var i = (y * cw + x) * 4;
      if (px[i + 3] < 30) continue;
      if (Math.abs(px[i] - fr) + Math.abs(px[i + 1] - fg) + Math.abs(px[i + 2] - fb) > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return null;
    var bw = (x1 - x0 + 1) / cw, bh = (y1 - y0 + 1) / ch;
    if (bw > 0.92 && bh > 0.92) return null;
    return { cx: (x0 + x1 + 1) / 2 / cw, cy: (y0 + y1 + 1) / 2 / ch, bw: bw, bh: bh, W: W, H: H, fondo: "rgb(" + Math.round(fr) + "," + Math.round(fg) + "," + Math.round(fb) + ")" };
  }
  function centrarFoto(img) {
    if (img.dataset.centrada) return;
    img.dataset.centrada = "1";
    function aplicar() {
      var e; try { e = encuadreFoto(img); } catch (er) { e = null; }
      if (!e) return;
      // Con object-fit:contain la foto ocupa el cuadro (B) con franjas; se calcula dónde quedó el
      // producto y se escala/traslada para dejarlo al centro ocupando ~84% del cuadro.
      var s0 = Math.min(1 / e.W, 1 / e.H), dw = e.W * s0, dh = e.H * s0, ox = (1 - dw) / 2, oy = (1 - dh) / 2;
      var cx = ox + e.cx * dw, cy = oy + e.cy * dh, lado = Math.max(e.bw * dw, e.bh * dh);
      var k = Math.min(2.6, 0.84 / lado);
      var tx = -k * (cx - 0.5) * 100, ty = -k * (cy - 0.5) * 100;
      img.style.transform = "translate(" + tx.toFixed(2) + "%," + ty.toFixed(2) + "%) scale(" + k.toFixed(3) + ")";
      if (img.parentNode && img.parentNode.style) img.parentNode.style.background = e.fondo;
    }
    if (img.complete && img.naturalWidth) aplicar(); else img.addEventListener("load", aplicar, { once: true });
  }
  function centrarFotosEn(raiz) { (raiz.querySelectorAll ? raiz : document).querySelectorAll(".cta-foto img, .cta-vitrina-foto img").forEach(centrarFoto); }
  try {
    new MutationObserver(function (cambios) { cambios.forEach(function (c) { c.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches(".cta-foto img, .cta-vitrina-foto img")) centrarFoto(n); else centrarFotosEn(n); } }); }); })
      .observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { /* navegador viejo: las fotos quedan completas (contain) */ }

  // ── Extras de Mi cuenta: cupones, encuesta de 1 toque y bajas de precio (2026-10-04) ────────
  // Cupones personales vigentes (p. ej. el de "volver a comprar"). Sin la función (migración
  // 202610040003) devuelve [] y no se muestra nada.
  async function misCupones() {
    try { var r = await sb.rpc("mis_cupones_cliente"); return r.error || !Array.isArray(r.data) ? [] : r.data; } catch (e) { return []; }
  }
  function tarjetaCupon(c) {
    var valor = c.tipo === "porcentaje" ? Number(c.valor) + "%" : "$" + Number(c.valor);
    var vence = c.vence_el ? "Válido hasta el " + fecha(c.vence_el) : "Sin fecha de vencimiento";
    return '<div class="cta-card cta-pad cta-cupon"><div class="cta-cupon-ic">' + valor + '<small>OFF</small></div>' +
      '<div class="cta-cupon-t"><b>Tiene un cupón de ' + esc(valor) + ' de descuento</b><span>' + esc(vence) + '</span>' +
      '<code data-copiar="' + esc(c.codigo) + '" title="Tocar para copiar">' + esc(c.codigo) + "</code></div>" +
      '<a class="cta-btn auto" href="/?cupon=' + encodeURIComponent(c.codigo) + '">Usar</a></div>';
  }
  function conectarCopiar(raiz) {
    (raiz || document).querySelectorAll("[data-copiar]").forEach(function (el) {
      el.addEventListener("click", function () { try { navigator.clipboard.writeText(el.dataset.copiar); aviso("Código copiado: " + el.dataset.copiar); } catch (e) {} });
    });
  }
  // Encuesta de 1 toque: cada estrella lleva a la reseña con esa calificación ya marcada.
  function encuestaEntrega(codigo, producto, titulo) {
    var base = "/resena/?c=" + encodeURIComponent(codigo) + (producto ? "&p=" + encodeURIComponent(producto) : "");
    return '<div class="cta-card cta-pad cta-encuesta"><p class="cta-encuesta-t">' + esc(titulo || "¿Cómo le fue con su pedido?") + '</p>' +
      '<p class="cta-nota" style="margin:2px 0 10px;font-size:12.5px">Toque una estrella. Su opinión ayuda a otros clientes.</p><div class="cta-encuesta-est">' +
      [1, 2, 3, 4, 5].map(function (n) { return '<a href="' + base + "&e=" + n + '" aria-label="' + n + (n === 1 ? " estrella" : " estrellas") + '">★</a>'; }).join("") + "</div></div>";
  }
  // Precio actual de un producto según el catálogo cargado en la página (productos.js + panel).
  function precioActual(codigo) {
    if (typeof productos === "undefined") return null;
    for (var i = 0; i < productos.length; i++) {
      var p = productos[i];
      if (String(p.codigo) !== String(codigo)) continue;
      if (p.cotizar || !(Number(p.precio) > 0)) return null;
      var hoy = new Date().toISOString().slice(0, 10);
      var oferta = Number(p.precioOferta) > 0 && Number(p.precioOferta) < Number(p.precio) && (!p.promocionHasta || String(p.promocionHasta).slice(0, 10) >= hoy);
      return oferta ? Number(p.precioOferta) : Number(p.precio);
    }
    return null;
  }
  // Favoritos que hoy cuestan menos que cuando los guardó.
  function bajasDePrecio(favs) {
    return (favs || []).map(function (f) { var ahora = precioActual(f.codigo); return ahora != null && Number(f.precio) > 0 && ahora < Number(f.precio) - 0.009 ? Object.assign({}, f, { ahora: ahora }) : null; }).filter(Boolean);
  }

  window.HauslineCuenta = {
    avisoTiempos: avisoTiempos,
    misCupones: misCupones, tarjetaCupon: tarjetaCupon, conectarCopiar: conectarCopiar, encuestaEntrega: encuestaEntrega, precioActual: precioActual, bajasDePrecio: bajasDePrecio, favoritosCuenta: favoritosCuenta,
    autoActualizar: autoActualizar, visor: visor,
    sb: sb, SITIO: SITIO, ETAPAS: ETAPAS, etapa: etapa, grupo: grupo,
    esc: esc, img: img, fecha: fecha, monto: monto, param: param, destinoSeguro: destinoSeguro,
    salud: S, errorCliente: errorCliente, mensajeError: mensajeError, sesion: sesion, exigirSesion: exigirSesion, salir: salir,
    cuenta: cuenta, misPedidos: misPedidos, misEncargos: misEncargos, seccionEncargos: seccionEncargos, pedido: pedido, urlsFotos: urlsFotos, aviso: aviso,
    actualizarCuenta: actualizarCuenta, urlAvatar: urlAvatar, subirAvatar: subirAvatar, quitarAvatar: quitarAvatar, eliminarCuenta: eliminarCuenta,
    direcciones: direcciones, guardarDireccion: guardarDireccion, eliminarDireccion: eliminarDireccion, hacerPredeterminada: hacerPredeterminada,
    tarifas: tarifas, costoDelivery: costoDelivery, lineasDireccion: lineasDireccion, entrega: entrega, solicitarEntrega: solicitarEntrega,
    reembolso: reembolso, solicitarReembolso: solicitarReembolso, decidirReembolso: decidirReembolso,
    mensajeEnvio: mensajeEnvio, linkWhatsApp: linkWhatsApp,
    favLocales: favLocales, sincronizarFavoritos: sincronizarFavoritos, quitarFavorito: quitarFavorito,
    navInferior: navInferior, hoja: hoja, mapa: mapa,
  };
})();
