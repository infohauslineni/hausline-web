// ============================================================
//  BUSCADOR — desplegable de sugerencias de HAUSLINE
//  - Botón "X" para borrar lo escrito.
//  - Al enfocar (vacío): camioncito HAUSLINE + últimos 3 productos vistos
//    (historial en PRODUCTOS, no el texto escrito).
//  - Al escribir: productos relacionados en vivo (acotados a la categoría en
//    la que se está navegando, para no cruzar calzado con ropa).
//  - Tocar una sugerencia abre ese producto; "Ver todos" va a los resultados.
//  Reutiliza las funciones globales de app.js (no es un módulo aparte).
// ============================================================
(function () {
  "use strict";

  const INPUTS = ["#buscador", "#buscadorMovil"];
  let inputActivo = null;
  let box = null;

  function el(sel) { return document.querySelector(sel); }

  // Camioncito de reparto HAUSLINE (SVG), con acento verde de la marca.
  const TRUCK = '' +
    '<svg class="suge-camion" viewBox="0 0 64 32" aria-hidden="true">' +
    '<path d="M2 22h34V8H2z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M36 13h11l6 6v3H36z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<circle cx="15" cy="24" r="4" fill="#050505" stroke="currentColor" stroke-width="2.4"/>' +
    '<circle cx="45" cy="24" r="4" fill="#050505" stroke="currentColor" stroke-width="2.4"/>' +
    '<path d="M8 13h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
    '</svg>';

  // Inserta el botón "X" dentro de cada caja de búsqueda.
  function montarBotonesX() {
    INPUTS.forEach(sel => {
      const input = el(sel);
      if (!input) return;
      const caja = input.closest(".buscador-caja");
      if (!caja || caja.querySelector(".buscador-x")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "buscador-x";
      btn.setAttribute("aria-label", "Borrar búsqueda");
      btn.hidden = !input.value;
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      btn.addEventListener("mousedown", e => e.preventDefault()); // no perder el foco del input
      btn.addEventListener("click", () => limpiarBusqueda(input));
      caja.appendChild(btn);
    });
  }

  function actualizarBotonesX() {
    document.querySelectorAll(".buscador-caja").forEach(caja => {
      const input = caja.querySelector("input");
      const btn = caja.querySelector(".buscador-x");
      if (input && btn) btn.hidden = !input.value;
    });
  }

  function limpiarBusqueda(input) {
    INPUTS.forEach(sel => { const i = el(sel); if (i) i.value = ""; });
    actualizarBotonesX();
    if (typeof manejarBusqueda === "function") manejarBusqueda(""); // vuelve al inicio si estaba en resultados
    render("");                 // vuelve al estado "historial"
    if (input) input.focus();
  }

  // ---- Desplegable ----
  function crearBox() {
    if (box) return box;
    box = document.createElement("div");
    box.id = "sugeBox";
    box.className = "suge";
    box.hidden = true;
    box.addEventListener("mousedown", e => e.preventDefault()); // el click no debe quitar el foco antes de tiempo
    document.body.appendChild(box);
    return box;
  }

  function posicionar() {
    if (!box || !inputActivo) return;
    const caja = inputActivo.closest(".buscador-caja");
    const r = (caja || inputActivo).getBoundingClientRect();
    box.style.left = r.left + "px";
    box.style.top = (r.bottom + 6) + "px";
    box.style.width = Math.max(r.width, 260) + "px";
  }

  function abrir() {
    crearBox();
    box.hidden = false;
    posicionar();
  }

  function cerrar() {
    if (box) box.hidden = true;
  }

  function precio(p) {
    try {
      if (typeof formatoPrecio === "function" && typeof precioVigente === "function")
        return formatoPrecio(precioVigente(p));
    } catch (e) {}
    return "";
  }

  function nombre(p) {
    return (typeof nombreProducto === "function") ? nombreProducto(p) : (p.nombre || p.codigo);
  }
  function marca(p) {
    return (typeof marcaProducto === "function") ? marcaProducto(p) : (p.marca || "");
  }
  function escapar(s) {
    return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s);
  }

  function fila(p) {
    const img = escapar(p.imagen || (p.imagenes && p.imagenes[0]) || "");
    const meta = [marca(p), p.codigo].filter(Boolean).map(escapar).join(" · ");
    return '<button type="button" class="suge-item" data-suge="' + escapar(p.codigo) + '">' +
      '<span class="suge-img"><img src="' + img + '" alt="" loading="lazy"></span>' +
      '<span class="suge-info"><span class="suge-nom">' + escapar(nombre(p)) + '</span>' +
      '<span class="suge-meta">' + meta + '</span></span>' +
      '<span class="suge-precio">' + escapar(precio(p)) + '</span>' +
      '</button>';
  }

  // Estado "historial": últimos productos vistos (o populares si aún no vio nada).
  function historial() {
    let vistos = [];
    try { if (typeof productosVistos === "function") vistos = productosVistos(); } catch (e) {}
    let etiqueta = "Vistos recientemente";
    if (!vistos.length) {
      etiqueta = "Popular ahora";
      try {
        const orden = (typeof ordenarNuevos === "function" && typeof esNuevo === "function")
          ? ordenarNuevos(productos.filter(esNuevo)) : productos;
        vistos = orden.slice(0, 3);
      } catch (e) { vistos = (typeof productos !== "undefined" ? productos.slice(0, 3) : []); }
    }
    return { etiqueta: etiqueta, items: vistos.slice(0, 3) };
  }

  function render(valor) {
    crearBox();
    const t = String(valor == null ? "" : valor).trim();

    if (!t) {
      const h = historial();
      if (!h.items.length) { cerrar(); return; }
      box.innerHTML =
        '<div class="suge-cab">' + TRUCK + '<span>' + escapar(h.etiqueta) + '</span></div>' +
        '<div class="suge-lista">' + h.items.map(fila).join("") + '</div>';
      return;
    }

    let items = [];
    try { if (typeof sugerenciasBusqueda === "function") items = sugerenciasBusqueda(t, 6); } catch (e) {}

    let listaHtml;
    if (items.length) {
      listaHtml = '<div class="suge-lista">' + items.map(fila).join("") +
        '<button type="button" class="suge-todos" data-suge-todos="1">' +
        'Ver todos los resultados de “' + escapar(t) + '”</button></div>';
    } else {
      listaHtml = '<div class="suge-vacio">Sin coincidencias para “' + escapar(t) + '”.</div>';
    }
    box.innerHTML =
      '<div class="suge-cab suge-cab--buscando">' + TRUCK +
      '<span>Buscando “' + escapar(t) + '”…</span></div>' + listaHtml;
  }

  // ---- Eventos ----
  function wire() {
    montarBotonesX();
    crearBox();

    INPUTS.forEach(sel => {
      const input = el(sel);
      if (!input) return;

      input.addEventListener("focus", () => {
        inputActivo = input;
        abrir();
        render(input.value);
      });

      input.addEventListener("input", () => {
        inputActivo = input;
        actualizarBotonesX();
        abrir();
        render(input.value);
      });

      // Enter: ir directo a los resultados y cerrar el desplegable.
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          if (typeof manejarBusqueda === "function") manejarBusqueda(input.value);
          cerrar();
          input.blur();
        } else if (e.key === "Escape") {
          cerrar();
        }
      });
    });

    // Click dentro del desplegable.
    box.addEventListener("click", e => {
      const item = e.target.closest("[data-suge]");
      if (item) {
        cerrar();
        if (inputActivo) inputActivo.blur();
        if (typeof abrirProducto === "function") abrirProducto(item.dataset.suge);
        return;
      }
      if (e.target.closest("[data-suge-todos]")) {
        cerrar();
        if (inputActivo) {
          if (typeof manejarBusqueda === "function") manejarBusqueda(inputActivo.value);
          inputActivo.blur();
        }
      }
    });

    // Cerrar al tocar fuera.
    document.addEventListener("click", e => {
      if (!box || box.hidden) return;
      if (e.target.closest(".buscador-caja") || e.target.closest("#sugeBox")) return;
      cerrar();
    });

    window.addEventListener("scroll", () => { if (box && !box.hidden) posicionar(); }, { passive: true });
    window.addEventListener("resize", () => { if (box && !box.hidden) posicionar(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
