// ============================================================
// SECCIONES DE INICIO (mejoras nov-2026)
//   · "Compre para": selector Hombre / Dama con accesos visuales (foto + cantidad)
//     a cada tipo de producto: Sneakers, Ropa, Super-Star, Flats, Stilettos, Ofertas…
//     Se arma solo con lo que hay publicado (no hay que configurarlo).
//   · pistaFila(): barrita bajo una fila deslizable que muestra que hay más productos
//     hacia la derecha (se usa en "Entrega inmediata").
// Usa las funciones de app.js (productos, abrirColeccion, tipoProducto, subcategoriaDe…).
// renderInicio() llama a renderComprarPara() cada vez que pinta la portada.
// ============================================================
(function(){
  "use strict";

  var CLAVE_GENERO = "hausline_compre_para";
  var genero = "Hombre";
  try{ var g = localStorage.getItem(CLAVE_GENERO); if(g === "Dama" || g === "Hombre") genero = g; }catch(e){}

  function baseGenero(gen){
    return productos.filter(function(p){
      return !p.ventaLibre && (p.categoria === gen || p.categoria === "Unisex");
    });
  }

  // Foto que va cambiando cada día (no siempre la misma) entre los primeros con imagen.
  function fotoDe(lista, paso){
    var conFoto = lista.filter(function(p){ return p.imagen; });
    if(!conFoto.length) return "";
    var dia = Math.floor(Date.now() / 86400000);
    return conFoto[(dia + (paso || 0)) % Math.min(conFoto.length, 10)].imagen;
  }

  // Arma los accesos de un género. Cada acceso: { titulo, sub, lista, accion }.
  function accesos(gen){
    var base = baseGenero(gen);
    if(!base.length) return [];
    var out = [];
    var calzado = base.filter(function(p){ return subcategoriaDe(p) === "Calzado"; });
    var ropa = base.filter(function(p){ return subcategoriaDe(p) === "Ropa"; });

    if(gen === "Hombre"){
      if(calzado.length) out.push({ titulo: "Sneakers", lista: calzado, accion: { sub: "Calzado" } });
      if(ropa.length) out.push({ titulo: "Ropa", lista: ropa, accion: { sub: "Ropa" } });
    }
    // Modelos/tipos con más productos (Super-Star, Flats, Stilettos, Louis Junior, Camiseta…).
    var tipos = new Map();
    base.forEach(function(p){
      var t = tipoProducto(p);
      if(!t || /^(otros|calzado|ropa)$/i.test(t)) return;
      if(!tipos.has(t)) tipos.set(t, []);
      tipos.get(t).push(p);
    });
    // 6 accesos en total: los fijos + modelos + "En oferta" + "Ver todo".
    var hayOferta = base.some(ofertaVigente);
    var lugar = Math.max(1, 6 - out.length - 1 - (hayOferta ? 1 : 0));
    Array.from(tipos.entries())
      .filter(function(e){ return e[1].length >= 4; })
      .sort(function(a, b){ return b[1].length - a[1].length; })
      .slice(0, lugar)
      .forEach(function(e){ out.push({ titulo: e[0], lista: e[1], accion: { tipo: e[0] } }); });

    var ofertas = base.filter(ofertaVigente);
    if(ofertas.length){
      var max = Math.max.apply(null, ofertas.map(porcentajeDescuento));
      out.push({ titulo: "En oferta", sub: "Hasta -" + max + "%", lista: ofertas, accion: { filtro: "oferta" }, clase: "cp-oferta" });
    }
    // Siempre termina con "Ver todo" para un total de 6 accesos (cuadrícula pareja).
    out = out.slice(0, 5);
    out.push({ titulo: "Ver todo " + gen, lista: base, accion: {}, clase: "cp-todo" });
    return out;
  }

  function render(){
    var sec = document.getElementById("comprarPara");
    var grid = document.getElementById("cpGrid");
    if(!sec || !grid || typeof productos === "undefined" || typeof tipoProducto !== "function") return;
    var lista = accesos(genero);
    if(!lista.length){
      // Si el género elegido no tiene nada, prueba con el otro.
      var otro = genero === "Hombre" ? "Dama" : "Hombre";
      if(accesos(otro).length){ genero = otro; lista = accesos(genero); }
    }
    if(!lista.length){ sec.hidden = true; return; }
    sec.hidden = false;
    sec.querySelectorAll("[data-cp]").forEach(function(b){
      var on = b.dataset.cp === genero;
      b.classList.toggle("activo", on); b.setAttribute("aria-selected", String(on));
      var n = baseGenero(b.dataset.cp).length;
      b.innerHTML = esc(b.dataset.cp) + (n ? "<small>" + n + "</small>" : "");
    });
    sec.dataset.genero = genero;
    grid.innerHTML = lista.map(function(a, i){
      var foto = fotoDe(a.lista, i);
      var n = a.lista.length;
      return '<button type="button" class="cp-tile ' + (a.clase || "") + '" data-cp-i="' + i + '">' +
        (foto ? '<img ' + imgMini(foto) + ' alt="" loading="lazy" decoding="async">' : "") +
        '<span class="cp-txt"><b>' + esc(a.titulo) + '</b><small>' + (a.sub ? esc(a.sub) + " · " + n : n + (n === 1 ? " producto" : " productos")) + '</small></span>' +
      '</button>';
    }).join("");
    grid._accesos = lista;
  }

  function abrir(a){
    abrirColeccion("categoria", genero, genero);
    var acc = a.accion || {};
    if(acc.sub){ filtroSub = acc.sub; if(typeof renderSubcategorias === "function") renderSubcategorias(); }
    if(acc.tipo) filtroTipo = acc.tipo;
    if(acc.filtro){
      filtrosActivos.clear(); filtrosActivos.add(acc.filtro);
      document.querySelectorAll("[data-filtro]").forEach(function(c){ c.classList.toggle("activo", filtrosActivos.has(c.dataset.filtro)); });
    }
    if(acc.tipo){
      var t = document.getElementById("coleccionTitulo");
      if(t) t.textContent = acc.tipo + " · " + genero;
    } else if(acc.filtro === "oferta"){
      var t2 = document.getElementById("coleccionTitulo");
      if(t2) t2.textContent = "Ofertas · " + genero;
    }
    paginaActual = 1;
    renderColeccion();
  }

  document.addEventListener("click", function(e){
    var sw = e.target.closest("#comprarPara [data-cp]");
    if(sw){
      genero = sw.dataset.cp;
      try{ localStorage.setItem(CLAVE_GENERO, genero); }catch(err){}
      render();
      return;
    }
    var tile = e.target.closest("#comprarPara [data-cp-i]");
    if(tile){
      var grid = document.getElementById("cpGrid");
      var a = grid && grid._accesos && grid._accesos[Number(tile.dataset.cpI)];
      if(a){ e.preventDefault(); e.stopPropagation(); abrir(a); }
    }
  }, true);

  // ---- Barrita de "hay más a la derecha" bajo una fila deslizable ----
  function pistaFila(filaSel, pistaSel){
    var fila = document.querySelector(filaSel), pista = document.querySelector(pistaSel);
    if(!fila || !pista) return;
    var barra = pista.firstElementChild;
    function act(){
      var total = fila.scrollWidth, vista = fila.clientWidth;
      if(total <= vista + 4){ pista.hidden = true; return; }
      pista.hidden = false;
      var ancho = Math.max(18, vista / total * 100);
      var izq = fila.scrollLeft / (total - vista) * (100 - ancho);
      barra.style.width = ancho + "%";
      barra.style.transform = "translateX(" + (izq / ancho * 100) + "%)";
    }
    if(!fila.dataset.pista){
      fila.dataset.pista = "1";
      fila.addEventListener("scroll", act, { passive: true });
      window.addEventListener("resize", act);
    }
    requestAnimationFrame(act);
    setTimeout(act, 600);
  }

  window.renderComprarPara = function(){ try{ render(); }catch(e){ console.error("compre para", e); } };
  window.pistaFila = pistaFila;
  function arrancar(){ window.renderComprarPara(); pistaFila("#filaInmediata", "#eiPista"); }
  if(document.readyState !== "loading") arrancar();
  else document.addEventListener("DOMContentLoaded", arrancar);
})();
