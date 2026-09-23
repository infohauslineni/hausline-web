/* Mi cuenta · Agregar nueva dirección (/cuenta/direccion/) y Editar dirección (?id=…).
   ?volver= regresa al pedido desde donde se abrió (solo rutas internas de /cuenta). */
(function () {
  "use strict";
  var C = window.HauslineCuenta;
  var main = document.getElementById("contenido");
  var esc = C.esc;
  var id = C.param("id");
  var volver = C.destinoSeguro(C.param("volver"), "/cuenta/direcciones/");
  var DEPARTAMENTOS = ["Managua", "Masaya", "Carazo", "Granada", "Rivas", "León", "Chinandega", "Estelí", "Madriz", "Nueva Segovia", "Matagalpa", "Jinotega", "Boaco", "Chontales", "Río San Juan", "RACCN (Costa Caribe Norte)", "RACCS (Costa Caribe Sur)"];
  var PAISES = ["Nicaragua", "Costa Rica", "Honduras", "El Salvador", "Guatemala", "Panamá", "México", "Estados Unidos", "Canadá", "Colombia", "España"];
  var tarifas = [];
  var f = { nombre: "", direccion: "", referencia: "", ciudad: "", departamento: "", pais: "Nicaragua", codigo_postal: "", tipo: "residencial", lat: null, lng: null, predeterminada: false };
  var esNica = function () { return String(f.pais).normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase() === "nicaragua"; };

  function costoTexto() {
    var c = C.costoDelivery({ costo_delivery: null, pais: f.pais, departamento: f.departamento, ciudad: f.ciudad }, tarifas);
    return c != null ? C.monto(c) : "A cotizar por WhatsApp";
  }

  function pintar() {
    main.innerHTML = '<h1 class="cta-h1" style="font-family:var(--font);font-weight:600;font-size:24px;margin:0">' + (id ? "Editar dirección" : "Agregar nueva dirección") + "</h1>" +
      '<form id="form" novalidate style="margin-top:18px">' +
      (id ? '<h2 class="cta-sec-h">Datos de la dirección</h2>' : "") +
      '<label class="cta-field"><span>Nombre de la dirección</span><input class="cta-input" id="nombre" maxlength="60" placeholder="Ej. Casa, Trabajo, etc." value="' + esc(f.nombre) + '"></label>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' + ["Casa", "Trabajo", "Otro"].map(function (n) { return '<button type="button" class="cta-chip" data-rapido="' + n + '">' + n + "</button>"; }).join("") + "</div>" +
      '<label class="cta-field"><span>Dirección completa</span><textarea class="cta-input" id="direccion" rows="2" maxlength="300" placeholder="Calle, número, residencial o barrio" style="resize:none">' + esc(f.direccion) + "</textarea></label>" +
      '<label class="cta-field"><span>Referencia (opcional)</span><input class="cta-input" id="referencia" maxlength="300" placeholder="Ej. portón negro, frente al parque" value="' + esc(f.referencia || "") + '"></label>' +
      '<label class="cta-field"><span>País</span><select class="cta-input cta-select" id="pais">' + PAISES.concat(PAISES.indexOf(f.pais) === -1 && f.pais ? [f.pais] : []).map(function (p) { return "<option" + (p === f.pais ? " selected" : "") + ">" + esc(p) + "</option>"; }).join("") + "</select></label>" +
      '<div class="cta-grid2">' +
        (esNica() ? '<label class="cta-field"><span>Departamento</span><select class="cta-input cta-select" id="departamento"><option value="">Elegí…</option>' + DEPARTAMENTOS.map(function (d) { return "<option" + (d === f.departamento ? " selected" : "") + ">" + esc(d) + "</option>"; }).join("") + "</select></label>" : "") +
        '<label class="cta-field"' + (esNica() ? "" : ' style="grid-column:1/-1"') + "><span>" + (esNica() ? "Ciudad / municipio" : "Ciudad") + '</span><input class="cta-input" id="ciudad" maxlength="100" placeholder="Managua" value="' + esc(f.ciudad) + '"></label>' +
      "</div>" +
      '<div class="cta-grid2">' +
        '<label class="cta-field"><span>Código postal</span><input class="cta-input" id="cp" maxlength="20" inputmode="numeric" placeholder="10000" value="' + esc(f.codigo_postal || "") + '"></label>' +
        '<label class="cta-field"><span>Tipo de dirección</span><select class="cta-input cta-select" id="tipo">' + [["residencial", "Residencial"], ["trabajo", "Trabajo"], ["otro", "Otro"]].map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === f.tipo ? " selected" : "") + ">" + t[1] + "</option>"; }).join("") + "</select></label>" +
      "</div>" +
      '<p class="cta-field" style="margin-bottom:6px"><span>Ubicación en el mapa</span></p><div id="mapa"></div>' +
      '<div style="display:flex;justify-content:space-between;gap:10px;margin-top:8px;align-items:center"><span class="cta-nota" style="margin:0" id="ayudaMapa">' + (f.lat != null ? "Arrastrá el mapa para ajustar el pin." : "Arrastrá el mapa hasta tu casa o usá tu ubicación.") + '</span><button type="button" class="cta-link" id="gps" style="white-space:nowrap">Usar mi ubicación</button></div>' +
      '<div class="cta-kv" style="margin-top:16px"><span>Costo de delivery para esta zona</span><b id="costo">' + esc(costoTexto()) + "</b></div>" +
      '<label class="cta-check"><input type="checkbox" id="pred"' + (f.predeterminada ? " checked" : "") + "> Establecer como dirección predeterminada</label>" +
      '<button class="cta-btn" id="guardar" style="margin-top:22px">Guardar dirección</button>' +
      (id ? '<button type="button" class="cta-link" id="borrar" style="display:block;margin:16px auto 0;color:var(--rojo)">Eliminar dirección</button>' : "") +
      "</form>";

    var $ = function (s) { return main.querySelector(s); };
    var m = C.mapa($("#mapa"), { lat: f.lat, lng: f.lng, interactivo: true, onCambio: function (p) { f.lat = p.lat; f.lng = p.lng; $("#ayudaMapa").textContent = "Arrastrá el mapa para ajustar el pin."; } });
    $("#gps").addEventListener("click", function () {
      if (!navigator.geolocation) return C.aviso("Tu navegador no permite usar la ubicación.", "error");
      $("#gps").textContent = "Buscando…";
      navigator.geolocation.getCurrentPosition(function (pos) {
        $("#gps").textContent = "Usar mi ubicación";
        m.poner(pos.coords.latitude, pos.coords.longitude, 17);
      }, function () {
        $("#gps").textContent = "Usar mi ubicación";
        C.aviso("No pudimos obtener tu ubicación. Revisá el permiso o mové el mapa a mano.", "error");
      }, { enableHighAccuracy: true, timeout: 12000 });
    });
    main.querySelectorAll("[data-rapido]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = b.dataset.rapido;
        $("#nombre").value = n === "Otro" ? "" : n;
        $("#tipo").value = n === "Trabajo" ? "trabajo" : n === "Casa" ? "residencial" : "otro";
        if (n === "Otro") $("#nombre").focus();
      });
    });
    $("#pais").addEventListener("change", function () { leer(); pintar(); });
    var dep = $("#departamento");
    if (dep) dep.addEventListener("change", function () { if (!$("#ciudad").value.trim()) $("#ciudad").value = dep.value.replace(/ \(.*\)$/, ""); leer(); $("#costo").textContent = costoTexto(); });
    $("#ciudad").addEventListener("input", function () { leer(); $("#costo").textContent = costoTexto(); });
    $("#form").addEventListener("submit", guardar);
    var bb = $("#borrar");
    if (bb) bb.addEventListener("click", async function () {
      if (!window.confirm("¿Eliminar esta dirección?")) return;
      try { await C.eliminarDireccion(id); C.aviso("Dirección eliminada."); location.replace("/cuenta/direcciones/"); }
      catch (e) { C.aviso(C.mensajeError(e), "error"); }
    });
  }

  function leer() {
    var v = function (s) { var el = main.querySelector(s); return el ? el.value.trim() : ""; };
    f.nombre = v("#nombre"); f.direccion = v("#direccion"); f.referencia = v("#referencia"); f.pais = v("#pais") || "Nicaragua";
    f.departamento = esNica() ? v("#departamento") : ""; f.ciudad = v("#ciudad"); f.codigo_postal = v("#cp"); f.tipo = v("#tipo") || "residencial";
    var p = main.querySelector("#pred"); f.predeterminada = p ? p.checked : f.predeterminada;
  }

  async function guardar(e) {
    e.preventDefault();
    leer();
    var err = !f.nombre ? "Poné un nombre (ej. Casa, Trabajo)." : f.direccion.length < 3 ? "Escribí la dirección completa." :
      esNica() && !f.departamento ? "Elegí el departamento." : !f.ciudad ? "Escribí la ciudad." : null;
    if (err) return C.aviso(err, "error");
    var btn = main.querySelector("#guardar"); btn.disabled = true; btn.textContent = "Guardando…";
    try {
      await C.guardarDireccion({
        nombre: f.nombre, direccion: f.direccion, referencia: f.referencia || null, ciudad: f.ciudad,
        departamento: esNica() ? f.departamento : null, pais: f.pais, codigo_postal: f.codigo_postal || null,
        tipo: f.tipo, lat: f.lat, lng: f.lng, predeterminada: f.predeterminada,
      }, id || undefined);
      C.aviso(id ? "Dirección actualizada." : "Dirección guardada.");
      location.replace(volver);
    } catch (x) {
      C.aviso(C.mensajeError(x), "error");
      btn.disabled = false; btn.textContent = "Guardar dirección";
    }
  }

  async function iniciar() {
    var s = await C.exigirSesion();
    if (!s) return;
    C.navInferior("cuenta");
    tarifas = await C.tarifas();
    if (id) {
      try {
        var d = (await C.direcciones()).filter(function (x) { return x.id === id; })[0];
        if (!d) { C.aviso("No encontramos esa dirección.", "error"); location.replace("/cuenta/direcciones/"); return; }
        f = { nombre: d.nombre, direccion: d.direccion, referencia: d.referencia || "", ciudad: d.ciudad, departamento: d.departamento || "", pais: d.pais, codigo_postal: d.codigo_postal || "", tipo: d.tipo, lat: d.lat, lng: d.lng, predeterminada: d.predeterminada };
      } catch (x) { C.aviso(C.mensajeError(x), "error"); }
    }
    pintar();
  }
  iniciar();
})();
