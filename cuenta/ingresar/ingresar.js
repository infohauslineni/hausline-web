/* Mi cuenta · Ingresar / Crear cuenta / Recuperar contraseña (Supabase Auth). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var $ = function (id) { return document.getElementById(id); };
  var destino = C.destinoSeguro(C.param("volver"), "/cuenta/");
  var modo = C.param("recuperar") ? "nueva" : C.param("crear") ? "crear" : "ingresar";
  var ocupado = false;
  var S = C.salud;
  // Motivo corto de un fallo de ingreso/registro (sin datos del cliente) para el panel.
  function motivo(err) {
    var m = (err && (err.message || err.error_description)) || "";
    if (/invalid login|invalid credentials/i.test(m)) return "credenciales";
    if (/email not confirmed/i.test(m)) return "sin_confirmar";
    if (/already registered|already exists|user already/i.test(m)) return "ya_registrado";
    if (/rate limit|too many|security purposes/i.test(m)) return "demasiados_intentos";
    if (/password/i.test(m) && /(6|8) characters|short|weak/i.test(m)) return "clave_debil";
    return "sistema";
  }

  var TEXTOS = {
    ingresar: { t: "Bienvenido", s: "Tus pedidos, su estado y su historial en un solo lugar.", b: "Ingresar" },
    crear: { t: "Creá tu cuenta", s: "Seguí cada pedido en tiempo real y recibí avisos por correo.", b: "Crear cuenta" },
    recuperar: { t: "Recuperá tu contraseña", s: "Te enviamos un enlace para crear una contraseña nueva.", b: "Enviar enlace" },
    nueva: { t: "Nueva contraseña", s: "Escribí la contraseña nueva de tu cuenta.", b: "Guardar contraseña" },
  };

  function mensaje(texto, tipo) {
    var m = $("mensaje");
    if (!texto) { m.hidden = true; return; }
    m.hidden = false; m.className = "cta-msg " + (tipo || "ok"); m.textContent = texto;
  }
  function pintar() {
    var t = TEXTOS[modo];
    $("titulo").textContent = t.t; $("subtitulo").textContent = t.s; $("enviar").textContent = t.b;
    $("tabs").hidden = !(modo === "ingresar" || modo === "crear");
    document.querySelectorAll(".cta-tab").forEach(function (b) { b.classList.toggle("on", b.dataset.modo === modo); });
    document.querySelectorAll("[data-en]").forEach(function (el) { el.hidden = el.dataset.en.split(" ").indexOf(modo) === -1; });
    $("lblClave").textContent = modo === "nueva" ? "Contraseña nueva" : "Contraseña";
    $("clave").autocomplete = modo === "ingresar" ? "current-password" : "new-password";
  }
  function cambiar(m) { modo = m; mensaje(""); pintar(); }

  document.querySelectorAll(".cta-tab").forEach(function (b) { b.addEventListener("click", function () { cambiar(b.dataset.modo); }); });
  $("irRecuperar").addEventListener("click", function () { cambiar("recuperar"); });
  $("irIngresar").addEventListener("click", function () { cambiar("ingresar"); });
  $("verClave").addEventListener("click", function () { var i = $("clave"); i.type = i.type === "password" ? "text" : "password"; });

  $("form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (ocupado || !C.sb) { if (!C.sb) mensaje("No se pudo cargar el sistema de cuentas. Recargá la página.", "err"); return; }
    var correo = $("correo").value.trim().toLowerCase();
    var clave = $("clave").value;
    var nombre = $("nombre").value.trim();
    var telefono = $("telefono").value.trim();
    var validoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (modo !== "nueva" && !validoCorreo) return mensaje("Escribí un correo válido.", "err");
    if (modo === "crear" && nombre.length < 2) return mensaje("Escribí tu nombre completo.", "err");
    if (modo === "crear" && !/^[0-9+ ()-]{7,25}$/.test(telefono)) return mensaje("Escribí tu teléfono (ej. +505 8888 8888).", "err");
    if ((modo === "crear" || modo === "nueva") && clave.length < 8) return mensaje("La contraseña debe tener al menos 8 caracteres.", "err");
    if (modo === "ingresar" && !clave) return mensaje("Escribí tu contraseña.", "err");

    ocupado = true; $("enviar").disabled = true; $("enviar").textContent = "Un momento…"; mensaje("");
    try {
      if (modo === "ingresar") {
        var r1 = await C.sb.auth.signInWithPassword({ email: correo, password: clave });
        if (r1.error) throw r1.error;
        S.registrar("login_ok");
        location.replace(destino);
        return;
      }
      if (modo === "crear") {
        var r2 = await C.sb.auth.signUp({
          email: correo, password: clave,
          // tipo=cliente → la base crea la cuenta de CLIENTE (nunca acceso al panel interno).
          options: { data: { tipo: "cliente", nombre: nombre, telefono: telefono }, emailRedirectTo: C.SITIO + "/cuenta/ingresar/?verificado=1&volver=" + encodeURIComponent(destino) },
        });
        if (r2.error) throw r2.error;
        // Supabase no revela si el correo ya existía (protección): sin identidades = ya registrado.
        if (r2.data && r2.data.user && Array.isArray(r2.data.user.identities) && r2.data.user.identities.length === 0) {
          throw new Error("already registered");
        }
        S.registrar("registro_ok", { detalle: { requiere_confirmar: !(r2.data && r2.data.session) } });
        if (r2.data && r2.data.session) { location.replace(destino); return; }
        $("form").reset(); cambiar("ingresar");
        mensaje("¡Listo! Te enviamos un correo a " + correo + ". Abrí el enlace para verificar tu cuenta y después ingresá.", "ok");
        return;
      }
      if (modo === "recuperar") {
        var r3 = await C.sb.auth.resetPasswordForEmail(correo, { redirectTo: C.SITIO + "/cuenta/ingresar/?recuperar=1" });
        if (r3.error) throw r3.error;
        S.registrar("recuperar_enviado");
        mensaje("Si existe una cuenta con " + correo + ", te llegará un enlace para crear una contraseña nueva. Revisá también spam.", "ok");
        return;
      }
      if (modo === "nueva") {
        var s = await C.sesion();
        if (!s) throw new Error("El enlace venció. Pedí uno nuevo desde “¿Olvidaste tu contraseña?”.");
        var r4 = await C.sb.auth.updateUser({ password: clave });
        if (r4.error) throw r4.error;
        S.registrar("clave_nueva_ok");
        C.aviso("Contraseña actualizada.");
        location.replace("/cuenta/");
      }
    } catch (err) {
      // login_fallido / crear_fallido / recuperar_fallido / nueva_fallido. Solo los errores del
      // sistema (no "clave incorrecta") salen como falla para revisarlos en el panel.
      var mot = motivo(err);
      S.registrar((modo === "ingresar" ? "login" : modo) + "_fallido", { tipo: mot === "sistema" ? "error" : "evento", mensaje: mot === "sistema" ? (err && err.message) || "Error" : mot, detalle: { motivo: mot } });
      try { err.__registrado = true; } catch (e) {}
      mensaje(C.mensajeError(err), "err");
    } finally {
      ocupado = false; $("enviar").disabled = false; $("enviar").textContent = TEXTOS[modo].b;
    }
  });

  async function iniciar() {
    pintar();
    if (!C.sb) { mensaje("No se pudo cargar el sistema de cuentas. Revisá tu conexión y recargá.", "err"); return; }
    S.registrar("vio_ingresar", { detalle: { modo: modo } });
    // El enlace del correo (verificación / recuperación) trae la sesión en la URL: supabase-js
    // la detecta. Recuperación → formulario de contraseña nueva.
    C.sb.auth.onAuthStateChange(function (evento) { if (evento === "PASSWORD_RECOVERY") cambiar("nueva"); });
    var s = await C.sesion();
    if (modo === "nueva") { if (!s) mensaje("Abrí esta página desde el enlace que te enviamos por correo.", "err"); return; }
    if (s) {
      if (C.param("verificado")) { S.registrar("correo_verificado"); C.aviso("¡Correo verificado! Bienvenido a HAUSLINE."); }
      location.replace(destino);
      return;
    }
    if (C.param("verificado")) { S.registrar("correo_verificado"); mensaje("¡Correo verificado! Ingresá con tu contraseña.", "ok"); }
    var hashErr = /error_description=([^&]+)/.exec(location.hash);
    if (hashErr) S.error("enlace_invalido", decodeURIComponent(hashErr[1].replace(/\+/g, " ")));
    if (hashErr) mensaje("El enlace no es válido o ya venció. " + decodeURIComponent(hashErr[1].replace(/\+/g, " ")), "err");
  }
  iniciar();
})();
