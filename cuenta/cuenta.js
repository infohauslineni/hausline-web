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

  window.HauslineCuenta = {
    sb: sb, SITIO: SITIO, ETAPAS: ETAPAS, etapa: etapa, grupo: grupo,
    esc: esc, img: img, fecha: fecha, monto: monto, param: param, destinoSeguro: destinoSeguro,
    mensajeError: mensajeError, sesion: sesion, exigirSesion: exigirSesion, salir: salir,
    cuenta: cuenta, misPedidos: misPedidos, pedido: pedido, urlsFotos: urlsFotos, aviso: aviso,
  };
})();
