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

  if (!window.supabase || !window.supabase.createClient) {
    document.documentElement.classList.add("cta-sin-sb");
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

  function mensajeError(error) {
    var m = (error && (error.message || error.error_description)) || "";
    if (/invalid login|invalid credentials/i.test(m)) return "Correo o contraseña incorrectos.";
    if (/email not confirmed/i.test(m)) return "Primero confirmá tu correo: te enviamos un enlace al registrarte.";
    if (/already registered|already exists|user already/i.test(m)) return "Ya existe una cuenta con ese correo. Ingresá o recuperá tu contraseña.";
    if (/password/i.test(m) && /(6|8) characters|short|weak/i.test(m)) return "La contraseña es muy débil: usá al menos 8 caracteres.";
    if (/rate limit|too many|security purposes/i.test(m)) return "Demasiados intentos. Esperá un minuto e intentá de nuevo.";
    if (/signups? not allowed|signup is disabled/i.test(m)) return "El registro de cuentas todavía no está habilitado.";
    if (/failed to fetch|network/i.test(m)) return "Sin conexión. Revisá tu internet e intentá de nuevo.";
    return m || "Algo salió mal. Intentá de nuevo.";
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
  async function rpc(nombre, args) {
    var r = await sb.rpc(nombre, args || {});
    if (r.error) throw r.error;
    return r.data;
  }
  async function cuenta() { return rpc("mi_cuenta_cliente"); }
  async function misPedidos() { var d = await rpc("mis_pedidos_cliente"); return Array.isArray(d) ? d : []; }
  async function pedido(codigo) { return rpc("pedido_cliente", { p_codigo: codigo }); }
  async function urlsFotos(rutas) {
    if (!rutas.length) return [];
    var r = await sb.storage.from("pedidos").createSignedUrls(rutas, 3600);
    return (r.data || []).map(function (x) { return x && x.signedUrl ? x.signedUrl : null; });
  }

  /* ---------------- Aviso breve (toast) ---------------- */
  function aviso(texto, tipo) {
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
    if (!id) throw new Error("Tu sesión expiró. Volvé a ingresar.");
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
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Usá una foto JPG, PNG o WebP.");
    if (file.size > 3 * 1024 * 1024) throw new Error("La foto pesa más de 3 MB.");
    var anterior = null;
    try { var c = await cuenta(); anterior = c && c.avatar_path; } catch (e) {}
    var id = await uid();
    if (!id) throw new Error("Tu sesión expiró. Volvé a ingresar.");
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
    if (!s) throw new Error("Tu sesión expiró. Volvé a ingresar.");
    var r = await sb.auth.signInWithPassword({ email: s.user.email, password: password });
    if (r.error) throw r.error;
    var res = await fetch("https://hausline-tracking.vercel.app/api/eliminar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + r.data.session.access_token },
      body: JSON.stringify({ propia: true }),
    });
    var j = await res.json().catch(function () { return {}; });
    if (!res.ok || !j.ok) throw new Error(j.error || "No se pudo eliminar la cuenta. Intentá de nuevo.");
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
    if (r.error) throw new Error(/10 direcciones/.test(r.error.message || "") ? "Podés guardar hasta 10 direcciones." : "No se pudo guardar la dirección.");
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
  };
  // Navegación inferior fija: Inicio | Buscar | Favoritos | Cuenta.
  function navInferior(activo) {
    var items = [["inicio", "/", "Inicio"], ["buscar", "/#buscadorMovil", "Buscar"], ["favoritos", "/cuenta/favoritos/", "Favoritos"], ["cuenta", "/cuenta/", "Cuenta"]];
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

  window.HauslineCuenta = {
    autoActualizar: autoActualizar, visor: visor,
    sb: sb, SITIO: SITIO, ETAPAS: ETAPAS, etapa: etapa, grupo: grupo,
    esc: esc, img: img, fecha: fecha, monto: monto, param: param, destinoSeguro: destinoSeguro,
    mensajeError: mensajeError, sesion: sesion, exigirSesion: exigirSesion, salir: salir,
    cuenta: cuenta, misPedidos: misPedidos, pedido: pedido, urlsFotos: urlsFotos, aviso: aviso,
    actualizarCuenta: actualizarCuenta, urlAvatar: urlAvatar, subirAvatar: subirAvatar, quitarAvatar: quitarAvatar, eliminarCuenta: eliminarCuenta,
    direcciones: direcciones, guardarDireccion: guardarDireccion, eliminarDireccion: eliminarDireccion, hacerPredeterminada: hacerPredeterminada,
    tarifas: tarifas, costoDelivery: costoDelivery, lineasDireccion: lineasDireccion, entrega: entrega, solicitarEntrega: solicitarEntrega,
    mensajeEnvio: mensajeEnvio, linkWhatsApp: linkWhatsApp,
    favLocales: favLocales, sincronizarFavoritos: sincronizarFavoritos, quitarFavorito: quitarFavorito,
    navInferior: navInferior, hoja: hoja, mapa: mapa,
  };
})();
