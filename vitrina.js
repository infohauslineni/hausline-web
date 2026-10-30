// PORTADA ANIMADA
//   · Vitrina (arriba, en lugar del título): una marca grande a la vez que cambia sola cada 5 s,
//     con barritas de progreso, 3 productos con precio y "Comprar ahora".
//   · "Compre por marca" (más abajo): botones con las marcas; al tocar una aparecen sus productos
//     con botón "Comprar" (abre el producto para elegir talla).
// Usa las funciones de la tienda (productos, marcasCatalogo, precioVigente, imgMini…). renderInicio()
// de app.js llama a renderVitrinaMarcas() cada vez que pinta la portada (también cuando llega el
// catálogo del panel). Los clics en [data-marca] y [data-codigo] los maneja app.js.
(function(){
  "use strict";
  var DURACION = 5000;
  var MAX_MARCAS = 8, MAX_CHIPS = 12;
  var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function marcasConProductos(max){
    if(typeof marcasCatalogo === "undefined" || typeof productos === "undefined") return [];
    return marcasCatalogo.map(function(m){
      var lista = productos.filter(function(p){ return p.marca === m.nombre && p.imagen && !necesitaCotizar(p) && !p.ventaLibre; });
      if(!lista.length) return null;
      // Primero los que están en Entrega inmediata o con oferta; luego los más nuevos.
      lista.sort(function(a, b){
        var pa = (a.entregaInmediata ? 2 : 0) + (ofertaVigente(a) ? 1 : 0), pb = (b.entregaInmediata ? 2 : 0) + (ofertaVigente(b) ? 1 : 0);
        return pb - pa || (b.orden || 0) - (a.orden || 0);
      });
      var precios = lista.map(function(p){ return precioVigente(p, false); }).filter(function(n){ return n > 0; });
      return { nombre: m.nombre, total: lista.length, desde: precios.length ? Math.min.apply(null, precios) : 0, productos: lista, portada: lista[0].imagen };
    }).filter(Boolean).slice(0, max);
  }

  function precioHtml(p){
    var actual = precioVigente(p, false);
    return ofertaVigente(p)
      ? '<span class="vt-precio"><b>' + formatoPrecio(actual) + '</b><s>' + formatoPrecio(p.precio) + '</s></span>'
      : '<span class="vt-precio"><b>' + formatoPrecio(actual) + '</b></span>';
  }

  // ---------------- Vitrina ----------------
  var vt = { marcas: [], actual: 0, inicio: 0, pausa: false, raf: 0 };

  function slideHtml(m, i){
    var minis = m.productos.slice(0, 3).map(function(p){
      return '<a class="vt-mini" href="#" data-codigo="' + esc(p.codigo) + '" aria-label="' + esc(nombreProducto(p)) + '">' +
        '<img ' + imgMini(p.imagen) + ' alt="" loading="lazy" decoding="async">' + precioHtml(p) + '</a>';
    }).join("");
    return '<div class="vt-slide' + (i === 0 ? ' activa' : '') + '" aria-hidden="' + (i === 0 ? 'false' : 'true') + '">' +
      '<img class="vt-fondo" ' + (i === 0 ? 'src' : 'data-src') + '="' + esc(m.portada) + '" alt="" decoding="async"' + (i === 0 ? ' fetchpriority="high"' : '') + '>' +
      '<div class="vt-texto">' +
        '<small>' + m.total + ' ' + (m.total === 1 ? 'producto' : 'productos') + (m.desde ? ' · desde ' + formatoPrecio(m.desde) : '') + '</small>' +
        '<h2>' + esc(m.nombre) + '</h2>' +
        '<p>Encárguelo hoy o lléveselo en Entrega inmediata.</p>' +
        '<a class="vt-btn" href="#" data-marca="' + esc(m.nombre) + '">Comprar ahora <i aria-hidden="true">→</i></a>' +
      '</div>' +
      '<div class="vt-minis">' + minis + '</div>' +
    '</div>';
  }

  function irA(i){
    var cont = document.getElementById("vitrinaMarcas");
    if(!cont || !vt.marcas.length) return;
    var slides = cont.querySelectorAll(".vt-slide"), barras = cont.querySelectorAll(".vt-barras button");
    if(!slides.length) return;
    var viejo = vt.actual;
    vt.actual = (i + vt.marcas.length) % vt.marcas.length;
    if(slides[viejo]){ slides[viejo].classList.remove("activa"); slides[viejo].setAttribute("aria-hidden", "true"); }
    if(barras[viejo]){ barras[viejo].classList.remove("activa"); barras[viejo].style.setProperty("--p", "0%"); barras[viejo].setAttribute("aria-selected", "false"); }
    var s = slides[vt.actual], fondo = s.querySelector(".vt-fondo");
    if(fondo && fondo.dataset.src){ fondo.src = fondo.dataset.src; fondo.removeAttribute("data-src"); }
    s.classList.add("activa"); s.setAttribute("aria-hidden", "false");
    if(barras[vt.actual]){ barras[vt.actual].classList.add("activa"); barras[vt.actual].setAttribute("aria-selected", "true"); }
    // Precarga el fondo de la siguiente.
    var sig = slides[(vt.actual + 1) % slides.length].querySelector(".vt-fondo");
    if(sig && sig.dataset.src){ var pre = new Image(); pre.src = sig.dataset.src; }
    vt.inicio = performance.now();
  }

  function tic(t){
    var cont = document.getElementById("vitrinaMarcas");
    if(!cont || !cont.isConnected){ vt.raf = 0; return; }
    if(vt.pausa || document.hidden){ vt.inicio = t - (vt.progreso || 0) * DURACION; }
    else {
      vt.progreso = Math.min(1, (t - vt.inicio) / DURACION);
      var b = cont.querySelectorAll(".vt-barras button")[vt.actual];
      if(b) b.style.setProperty("--p", (vt.progreso * 100).toFixed(1) + "%");
      if(vt.progreso >= 1){ vt.progreso = 0; irA(vt.actual + 1); }
    }
    vt.raf = requestAnimationFrame(tic);
  }

  function renderVitrina(){
    var hero = document.querySelector(".hl-hero");
    if(!hero) return;
    var marcas = marcasConProductos(MAX_MARCAS);
    if(marcas.length < 2) return;
    var firma = marcas.map(function(m){ return m.nombre + ":" + m.total + ":" + m.portada; }).join("|");
    var cont = document.getElementById("vitrinaMarcas");
    if(cont && cont.dataset.firma === firma) return; // sin cambios: no reinicia la animación
    if(!cont){
      cont = document.createElement("div");
      cont.id = "vitrinaMarcas";
      cont.className = "vitrina";
      cont.setAttribute("role", "region");
      cont.setAttribute("aria-roledescription", "carrusel");
      cont.setAttribute("aria-label", "Marcas destacadas");
      var ceja = hero.querySelector(".hl-hero-eyebrow");
      if(ceja && ceja.nextSibling) hero.insertBefore(cont, ceja.nextSibling); else hero.appendChild(cont);
      eventosVitrina(cont);
    }
    cont.dataset.firma = firma;
    vt.marcas = marcas; vt.actual = 0; vt.progreso = 0;
    cont.innerHTML = '<div class="vt-escena">' + marcas.map(slideHtml).join("") +
      '<button class="vt-flecha vt-prev" type="button" aria-label="Marca anterior">‹</button><button class="vt-flecha vt-next" type="button" aria-label="Siguiente marca">›</button></div>' +
      '<div class="vt-barras" role="tablist">' + marcas.map(function(m, i){
        return '<button type="button" role="tab" aria-selected="' + (i === 0) + '" class="' + (i === 0 ? 'activa' : '') + '" data-vt="' + i + '">' + esc(m.nombre) + '</button>';
      }).join("") + '</div>';
    hero.classList.add("con-vitrina");
    vt.inicio = performance.now();
    if(!quieto && !vt.raf) vt.raf = requestAnimationFrame(tic);
  }

  function eventosVitrina(cont){
    cont.addEventListener("click", function(e){
      var b = e.target.closest("[data-vt]");
      if(b){ e.preventDefault(); irA(Number(b.dataset.vt)); return; }
      if(e.target.closest(".vt-prev")){ irA(vt.actual - 1); return; }
      if(e.target.closest(".vt-next")){ irA(vt.actual + 1); return; }
    });
    // Se pausa mientras el mouse está encima (para alcanzar a tocar) y se puede deslizar con el dedo.
    cont.addEventListener("mouseenter", function(){ vt.pausa = true; });
    cont.addEventListener("mouseleave", function(){ vt.pausa = false; });
    var x0 = null, y0 = null;
    cont.addEventListener("touchstart", function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; vt.pausa = true; }, { passive: true });
    cont.addEventListener("touchend", function(e){
      vt.pausa = false;
      if(x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) irA(vt.actual + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  // ---------------- Comprá por marca ----------------
  var cm = { marcas: [], actual: 0 };

  function pintarMarca(i){
    var sec = document.getElementById("comprarMarca");
    if(!sec || !cm.marcas[i]) return;
    cm.actual = i;
    var m = cm.marcas[i];
    sec.querySelectorAll(".cm-chips button").forEach(function(b, j){ b.classList.toggle("activa", j === i); b.setAttribute("aria-pressed", String(j === i)); });
    var lado = sec.querySelector(".cm-lado"), grid = sec.querySelector(".cm-grid");
    lado.innerHTML = '<img ' + imgMini(m.portada) + ' alt="" loading="lazy" decoding="async">' +
      '<small>' + m.total + ' ' + (m.total === 1 ? 'producto' : 'productos') + '</small><h3>' + esc(m.nombre) + '</h3>' +
      (m.desde ? '<p>Desde ' + formatoPrecio(m.desde) + '</p>' : '') +
      '<a class="vt-btn" href="#" data-marca="' + esc(m.nombre) + '">Ver todo <i aria-hidden="true">→</i></a>';
    grid.innerHTML = m.productos.slice(0, 4).map(function(p){
      var desc = typeof porcentajeDescuento === "function" ? porcentajeDescuento(p) : 0;
      return '<article class="cm-prod">' +
        '<a href="#" data-codigo="' + esc(p.codigo) + '" class="cm-foto" aria-label="' + esc(nombreProducto(p)) + '"><img ' + imgMini(p.imagen) + ' alt="" loading="lazy" decoding="async">' +
          (desc > 0 ? '<span class="cm-desc">-' + desc + '%</span>' : '') + (p.entregaInmediata ? '<span class="cm-ei">Entrega inmediata</span>' : '') + '</a>' +
        '<div class="cm-info"><b>' + esc(nombreProducto(p)) + '</b>' + precioHtml(p) +
        '<button type="button" class="cm-comprar" data-encargar="' + esc(p.codigo) + '">Comprar</button></div>' +
      '</article>';
    }).join("");
  }

  function renderComprarMarca(){
    var sec = document.getElementById("comprarMarca");
    if(!sec) return;
    var marcas = marcasConProductos(MAX_CHIPS);
    if(!marcas.length){ sec.hidden = true; return; }
    var firma = marcas.map(function(m){ return m.nombre + ":" + m.total; }).join("|");
    if(sec.dataset.firma === firma) return;
    sec.dataset.firma = firma;
    var nombreActual = cm.marcas[cm.actual] && cm.marcas[cm.actual].nombre;
    cm.marcas = marcas;
    sec.querySelector(".cm-chips").innerHTML = marcas.map(function(m, i){
      return '<button type="button" data-cm="' + i + '" aria-pressed="false">' + esc(m.nombre) + '<small>' + m.total + '</small></button>';
    }).join("");
    if(!sec.dataset.eventos){
      sec.dataset.eventos = "1";
      sec.querySelector(".cm-chips").addEventListener("click", function(e){ var b = e.target.closest("[data-cm]"); if(b) pintarMarca(Number(b.dataset.cm)); });
    }
    var idx = Math.max(0, marcas.findIndex(function(m){ return m.nombre === nombreActual; }));
    sec.hidden = false;
    pintarMarca(idx);
  }

  window.renderVitrinaMarcas = function(){
    try{ renderVitrina(); }catch(e){ console.error("vitrina", e); }
    try{ renderComprarMarca(); }catch(e){ console.error("comprar por marca", e); }
  };
  // Por si renderInicio() corrió antes de que cargara este archivo.
  if(document.readyState !== "loading") window.renderVitrinaMarcas();
  else document.addEventListener("DOMContentLoaded", window.renderVitrinaMarcas);
})();
