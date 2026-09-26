/* Mi cuenta · Datos personales: foto, nombre, correo, teléfono + preferencias (idioma, moneda). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var cuenta = null, sesion = null;
  var FLECHA = '<svg viewBox="0 0 24 24" class="flecha" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  var I = {
    persona: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    correo: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
    tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    idioma: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    moneda: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.8 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/></svg>',
    clave: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    salir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  };
  function fila(id, icono, etiqueta, valor, peligro) {
    return '<button type="button" class="cta-fila' + (peligro ? " peligro" : "") + '" id="' + id + '">' + icono + '<span class="t">' + esc(etiqueta) + (valor != null ? "<small>" + esc(valor) + "</small>" : "") + "</span>" + (peligro ? "" : FLECHA) + "</button>";
  }

  function pintar() {
    var av = C.urlAvatar(cuenta.avatar_path);
    main.innerHTML =
      '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:24px;margin:0">Datos personales</h1>' +
      '<section style="display:flex;gap:20px;align-items:center;margin-top:20px">' +
        '<span class="cta-avatar">' + (av ? '<img src="' + esc(av) + '" alt="">' : I.persona) + "</span>" +
        '<div style="min-width:0"><b style="display:block;font-size:22px;font-weight:600">' + esc(cuenta.nombre || "Tu nombre") + '</b><span class="cta-prod" style="margin:0">' + esc(sesion.user.email) + "</span>" +
        '<button type="button" class="cta-btn-borde" id="btnFoto" style="margin-top:10px">Editar foto</button><input type="file" id="foto" accept="image/jpeg,image/png,image/webp" hidden></div>' +
      "</section>" +
      '<h2 class="cta-sec-h" style="margin-top:28px">Información personal</h2><div class="cta-card cta-filas">' +
        fila("fNombre", I.persona, "Nombre completo", cuenta.nombre || "Agregar") +
        fila("fCorreo", I.correo, "Correo electrónico", sesion.user.email) +
        fila("fTel", I.tel, "Teléfono", cuenta.telefono || "Agregar") + "</div>" +
      '<h2 class="cta-sec-h" style="margin-top:24px">Preferencias</h2><div class="cta-card cta-filas">' +
        fila("fIdioma", I.idioma, "Idioma", cuenta.idioma === "en" ? "English" : "Español") +
        fila("fMoneda", I.moneda, "Moneda", cuenta.moneda === "NIO" ? "NIO - Córdoba nicaragüense" : "USD - Dólar estadounidense") + "</div>" +
      '<h2 class="cta-sec-h" style="margin-top:24px">Seguridad</h2><div class="cta-card cta-filas">' +
        fila("fClave", I.clave, "Cambiar contraseña", null) +
        fila("fSalir", I.salir, "Cerrar sesión", null, true) + "</div>" +
      '<button type="button" class="cta-link" id="fEliminar" style="display:block;margin:22px auto 0;color:var(--texto-3);font-size:13px">Eliminar mi cuenta</button>';

    var input = main.querySelector("#foto");
    main.querySelector("#btnFoto").addEventListener("click", function () {
      if (!cuenta.avatar_path) { input.click(); return; }
      var h = C.hoja('<div class="cta-card cta-filas">' +
        '<button type="button" class="cta-fila" id="oNueva"><span class="t">Elegir otra foto</span></button>' +
        '<button type="button" class="cta-fila" id="oAjustar"><span class="t">Ajustar encuadre</span></button>' +
        '<button type="button" class="cta-fila peligro" id="oQuitar"><span class="t">Quitar foto</span></button></div>' +
        '<button type="button" class="cta-link" style="display:block;margin:14px auto 0" id="oCancelar">Cancelar</button>', "Foto de perfil");
      h.panel.querySelector("#oCancelar").addEventListener("click", h.cerrar);
      h.panel.querySelector("#oNueva").addEventListener("click", function () { h.cerrar(); input.click(); });
      h.panel.querySelector("#oAjustar").addEventListener("click", function () { h.cerrar(); editorFoto(C.urlAvatar(cuenta.avatar_path), true); });
      h.panel.querySelector("#oQuitar").addEventListener("click", async function () {
        try { await C.quitarAvatar(cuenta.avatar_path); h.cerrar(); cuenta = await C.cuenta(); pintar(); C.aviso("Foto quitada."); }
        catch (e) { C.aviso(C.mensajeError(e), "error"); }
      });
    });
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      input.value = "";
      if (!f) return;
      if (!/^image\//.test(f.type)) { C.aviso("Elegí una imagen (JPG, PNG o WebP).", "error", true); return; }
      editorFoto(URL.createObjectURL(f), false);
    });
    main.querySelector("#fNombre").addEventListener("click", function () { editarTexto("Nombre completo", "Nombre y apellido", cuenta.nombre || "", "text", "name", guardarNombre); });
    main.querySelector("#fTel").addEventListener("click", function () { editarTexto("Teléfono", "Número de WhatsApp", cuenta.telefono || "", "tel", "tel", guardarTel); });
    main.querySelector("#fCorreo").addEventListener("click", function () { editarTexto("Correo electrónico", "Correo nuevo", sesion.user.email || "", "email", "email", guardarCorreo, "Por seguridad, el cambio se aplica cuando abrás el enlace que te enviamos al correo nuevo."); });
    main.querySelector("#fClave").addEventListener("click", function () { editarTexto("Cambiar contraseña", "Contraseña nueva (mínimo 8)", "", "password", "new-password", guardarClave); });
    main.querySelector("#fIdioma").addEventListener("click", function () {
      elegir("Idioma", "idioma", cuenta.idioma, [["es", "Español", ""], ["en", "English", "Próximamente: por ahora el sitio está en español."]]);
    });
    main.querySelector("#fMoneda").addEventListener("click", function () {
      elegir("Moneda", "moneda", cuenta.moneda, [["USD", "USD - Dólar estadounidense", ""], ["NIO", "NIO - Córdoba nicaragüense", "La tienda te muestra los precios en córdobas."]]);
    });
    main.querySelector("#fSalir").addEventListener("click", C.salir);
    main.querySelector("#fEliminar").addEventListener("click", eliminarCuenta);
  }

  // Editor de encuadre: arrastrá para mover, deslizá para acercar. Guarda un JPEG cuadrado 512px.
  function editorFoto(src, remota) {
    var TAM = 260;
    var h = C.hoja('<div style="display:grid;place-items:center">' +
      '<div id="marco" style="position:relative;width:' + TAM + 'px;height:' + TAM + 'px;border-radius:999px;overflow:hidden;background:#EAE7E1;touch-action:none;cursor:grab">' +
      '<canvas id="lienzo" width="' + TAM * 2 + '" height="' + TAM * 2 + '" style="width:100%;height:100%"></canvas></div>' +
      '<p class="cta-nota" style="text-align:center">Arrastrá la foto para acomodarla.</p>' +
      '<label style="display:flex;align-items:center;gap:10px;width:100%;max-width:280px;margin-top:6px;font-size:13px;color:var(--texto-2)">−<input type="range" id="zoom" min="1" max="3" step="0.01" value="1" style="flex:1;accent-color:#171310">+</label></div>' +
      '<button type="button" class="cta-btn" id="guardarFoto" style="margin-top:18px">Guardar foto</button>' +
      '<button type="button" class="cta-link" style="display:block;margin:12px auto 0" id="cancelarFoto">Cancelar</button>', "Ajustá tu foto");
    var canvas = h.panel.querySelector("#lienzo"), ctx = canvas.getContext("2d"), marco = h.panel.querySelector("#marco");
    var img = new Image(), z = 1, ox = 0, oy = 0, ini = null;
    if (remota) img.crossOrigin = "anonymous";
    function base() { return Math.max(canvas.width / img.width, canvas.height / img.height); }
    function limitar() {
      var w = img.width * base() * z, hh = img.height * base() * z;
      ox = Math.min(0, Math.max(canvas.width - w, ox)); oy = Math.min(0, Math.max(canvas.height - hh, oy));
    }
    function dibujar() {
      limitar();
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, ox, oy, img.width * base() * z, img.height * base() * z);
    }
    img.onload = function () { z = 1; ox = (canvas.width - img.width * base()) / 2; oy = (canvas.height - img.height * base()) / 2; dibujar(); };
    img.onerror = function () { C.aviso("No pudimos abrir esa foto.", "error"); h.cerrar(); };
    img.src = src;
    var escala = function () { return canvas.width / marco.clientWidth; };
    marco.addEventListener("pointerdown", function (e) { ini = { x: e.clientX, y: e.clientY, ox: ox, oy: oy }; marco.setPointerCapture(e.pointerId); });
    marco.addEventListener("pointermove", function (e) { if (!ini) return; ox = ini.ox + (e.clientX - ini.x) * escala(); oy = ini.oy + (e.clientY - ini.y) * escala(); dibujar(); });
    marco.addEventListener("pointerup", function () { ini = null; });
    marco.addEventListener("pointercancel", function () { ini = null; });
    h.panel.querySelector("#zoom").addEventListener("input", function (e) {
      // Acerca respecto al centro del círculo.
      var nz = Number(e.target.value), cx = canvas.width / 2, cy = canvas.height / 2;
      ox = cx - (cx - ox) * (nz / z); oy = cy - (cy - oy) * (nz / z); z = nz; dibujar();
    });
    h.panel.querySelector("#cancelarFoto").addEventListener("click", h.cerrar);
    h.panel.querySelector("#guardarFoto").addEventListener("click", function () {
      var b = h.panel.querySelector("#guardarFoto"); b.disabled = true; b.textContent = "Guardando…";
      var salida = document.createElement("canvas"); salida.width = salida.height = 512;
      salida.getContext("2d").drawImage(canvas, 0, 0, 512, 512);
      salida.toBlob(async function (blob) {
        try {
          if (!blob) throw new Error("No se pudo preparar la foto.");
          await C.subirAvatar(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
          h.cerrar(); cuenta = await C.cuenta(); pintar(); C.aviso("Foto actualizada.");
        } catch (err) { C.aviso(C.mensajeError(err), "error"); b.disabled = false; b.textContent = "Guardar foto"; }
      }, "image/jpeg", 0.88);
    });
  }

  function eliminarCuenta() {
    var h = C.hoja('<p class="cta-sub" style="margin:0;font-size:14px">Se borran <b style="color:var(--texto)">para siempre</b> tu correo, contraseña, teléfono, foto, direcciones y lista de deseos. Tus <b style="color:var(--texto)">pedidos se conservan</b> en HAUSLINE (podés seguirlos con su código).</p>' +
      '<form id="fBorrar"><label class="cta-field" style="margin-top:16px"><span>Confirmá con tu contraseña</span><input class="cta-input" id="pwBorrar" type="password" autocomplete="current-password"></label>' +
      '<button class="cta-btn" id="btnBorrar" style="margin-top:18px;background:var(--rojo);border-color:var(--rojo)">Eliminar mi cuenta</button></form>' +
      '<button type="button" class="cta-link" style="display:block;margin:12px auto 0" id="noBorrar">Cancelar</button>', "¿Eliminar tu cuenta?");
    h.panel.querySelector("#noBorrar").addEventListener("click", h.cerrar);
    h.panel.querySelector("#fBorrar").addEventListener("submit", async function (e) {
      e.preventDefault();
      var pw = h.panel.querySelector("#pwBorrar").value;
      if (!pw) return C.aviso("Escribí tu contraseña.", "error", true);
      var b = h.panel.querySelector("#btnBorrar"); b.disabled = true; b.textContent = "Eliminando…";
      try {
        await C.eliminarCuenta(pw);
        h.cerrar();
        main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600;font-size:17px">Tu cuenta fue eliminada</p><p class="cta-nota" style="font-size:13.5px;margin-top:8px">Gracias por haber sido parte de HAUSLINE. Tus pedidos siguen disponibles con su código.</p><a class="cta-btn auto" style="margin-top:18px" href="/">Volver a la tienda</a></div>';
      } catch (err) { C.aviso(C.mensajeError(err), "error"); b.disabled = false; b.textContent = "Eliminar mi cuenta"; }
    });
  }

  function editarTexto(titulo, etiqueta, valor, tipo, auto, guardar, nota) {
    var h = C.hoja('<form id="fEdit"><label class="cta-field"><span>' + esc(etiqueta) + '</span><input class="cta-input" id="vEdit" type="' + tipo + '" autocomplete="' + auto + '" value="' + esc(valor) + '"></label>' +
      (nota ? '<p class="cta-nota">' + esc(nota) + "</p>" : "") + '<button class="cta-btn" style="margin-top:18px">Guardar</button></form>', titulo);
    var inp = h.panel.querySelector("#vEdit"); inp.focus();
    h.panel.querySelector("#fEdit").addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = h.panel.querySelector("button"); btn.disabled = true; btn.textContent = "Guardando…";
      try { await guardar(inp.value.trim()); h.cerrar(); cuenta = await C.cuenta(); var s = await C.sesion(); if (s) sesion = s; pintar(); }
      catch (err) { C.aviso(C.mensajeError(err), "error"); btn.disabled = false; btn.textContent = "Guardar"; }
    });
  }
  async function guardarNombre(v) { if (v.length < 2) throw C.errorCliente("Escribí tu nombre completo."); await C.actualizarCuenta({ nombre: v }); C.aviso("Guardado."); }
  async function guardarTel(v) { if (!/^[0-9+ ()-]{7,25}$/.test(v)) throw C.errorCliente("Revisá el número (ej. +505 8888 8888)."); await C.actualizarCuenta({ telefono: v }); C.aviso("Guardado."); }
  async function guardarCorreo(v) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw C.errorCliente("Correo inválido.");
    if (v.toLowerCase() === String(sesion.user.email).toLowerCase()) return;
    var r = await C.sb.auth.updateUser({ email: v.toLowerCase() }, { emailRedirectTo: C.SITIO + "/cuenta/datos/" });
    if (r.error) throw r.error;
    C.aviso("Te enviamos un enlace al correo nuevo para confirmar el cambio.");
  }
  async function guardarClave(v) {
    if (v.length < 8) throw C.errorCliente("La contraseña debe tener al menos 8 caracteres.");
    var r = await C.sb.auth.updateUser({ password: v });
    if (r.error) throw r.error;
    C.aviso("Contraseña actualizada.");
  }
  function elegir(titulo, campo, actual, opciones) {
    var h = C.hoja(opciones.map(function (o) {
      return '<button type="button" class="cta-opcion' + (actual === o[0] ? " on" : "") + '" data-v="' + o[0] + '"><span class="radio"></span><span><b style="font-weight:600">' + esc(o[1]) + "</b>" + (o[2] ? '<span class="cta-prod" style="margin:2px 0 0;white-space:normal">' + esc(o[2]) + "</span>" : "") + "</span></button>";
    }).join(""), titulo);
    h.panel.querySelectorAll("[data-v]").forEach(function (b) {
      b.addEventListener("click", async function () {
        try { var c = {}; c[campo] = b.dataset.v; await C.actualizarCuenta(c); h.cerrar(); cuenta = await C.cuenta(); pintar(); C.aviso("Guardado."); }
        catch (e) { C.aviso(C.mensajeError(e), "error"); }
      });
    });
  }

  async function iniciar() {
    sesion = await C.exigirSesion();
    if (!sesion) return;
    C.navInferior("cuenta");
    try { cuenta = await C.cuenta(); pintar(); }
    catch (err) { main.innerHTML = '<div class="cta-card cta-vacio"><p style="font-weight:600">No pudimos cargar tus datos</p><p class="cta-nota">' + esc(C.mensajeError(err)) + "</p></div>"; }
  }
  iniciar();
})();
