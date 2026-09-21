// ============================================================
// HAUSLINE · Aviso emergente (banner) al abrir la web
// Lee la lista HAUSLINE_BANNERS de config.js y muestra un aviso CHICO (no ocupa
// toda la pantalla) con la imagen de la promo y una X para cerrar. Aparece una
// vez por visita. Si hay varias imágenes, se turnan con puntitos. Tocar la
// imagen lleva al "enlace" del banner (si tiene). Cerrar: X o tocar afuera.
// ============================================================
(function(){
  "use strict";

  // Los banners vienen de la BASE (tabla banners del proyecto del CATÁLOGO, el mismo que edita
  // admin.html — ver catalogo-remoto.js CATALOGO_PANEL). Si no hay ninguno o falla la red, se
  // usa la lista HAUSLINE_BANNERS de config.js como respaldo.
  var CAT = (typeof CATALOGO_PANEL !== "undefined" && CATALOGO_PANEL) ? CATALOGO_PANEL : null;
  var CONFIG_BANNERS = (typeof HAUSLINE_BANNERS !== "undefined" && Array.isArray(HAUSLINE_BANNERS))
    ? HAUSLINE_BANNERS.filter(function(b){ return b && b.imagen; }) : [];
  var BANNERS = [];

  var KEY = "hausline_banner_visto";
  function visto(){ try{ return sessionStorage.getItem(KEY) === "1"; }catch(e){ return false; } }
  function marcar(){ try{ sessionStorage.setItem(KEY, "1"); }catch(e){} }
  // Arma la URL de la imagen. encodeURI para que rutas con espacios (ej. "BANER PROM 1.jpg") funcionen.
  function imgUrl(src){ if(!src) return ""; var u = /^https?:\/\//i.test(src) ? src : "/" + String(src).replace(/^\.?\//, ""); try{ return encodeURI(u); }catch(e){ return u; } }
  function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

  function inyectarCss(){
    if(document.getElementById("bnrCss")) return;
    var st = document.createElement("style"); st.id = "bnrCss";
    st.textContent =
      ".bnr-ov{position:fixed;inset:0;z-index:1400;display:grid;place-items:center;padding:20px;"
      + "background:rgba(18,22,18,.30);animation:bnrf .25s ease}"
      + "@keyframes bnrf{from{opacity:0}to{opacity:1}}"
      + ".bnr-card{position:relative;width:min(360px,86vw);background:#fff;border-radius:18px;overflow:hidden;"
      + "box-shadow:0 24px 60px rgba(0,0,0,.42);animation:bnrp .3s cubic-bezier(.2,.9,.3,1.15)}"
      + "@keyframes bnrp{from{transform:translateY(12px) scale(.96);opacity:0}to{transform:none;opacity:1}}"
      + ".bnr-card a{display:block}"
      + ".bnr-img{display:block;width:100%;height:auto;max-height:72vh;object-fit:cover}"
      + ".bnr-x{position:absolute;top:9px;right:9px;width:34px;height:34px;border-radius:999px;"
      + "background:rgba(0,0,0,.55);color:#fff;border:0;font-size:19px;line-height:1;cursor:pointer;"
      + "display:grid;place-items:center}"
      + ".bnr-x:hover{background:rgba(0,0,0,.78)}"
      + ".bnr-dots{position:absolute;left:0;right:0;bottom:10px;display:flex;gap:6px;justify-content:center}"
      + ".bnr-dots i{width:7px;height:7px;border-radius:999px;background:rgba(255,255,255,.55);"
      + "box-shadow:0 0 3px rgba(0,0,0,.45);cursor:pointer;transition:background .2s}"
      + ".bnr-dots i.on{background:#fff}";
    document.head.appendChild(st);
  }

  function mostrar(){
    if(visto() || document.getElementById("bnrOv")) return;
    inyectarCss();
    var i = 0, rot = null;
    var ov = document.createElement("div"); ov.className = "bnr-ov"; ov.id = "bnrOv"; ov.setAttribute("role","dialog");
    var card = document.createElement("div"); card.className = "bnr-card";
    ov.appendChild(card);

    function cerrar(){ marcar(); if(rot){ clearInterval(rot); rot=null; } ov.remove(); }
    function pintar(){
      var b = BANNERS[i];
      var img = '<img class="bnr-img" src="'+esc(imgUrl(b.imagen))+'" alt="Promoción HAUSLINE">';
      var inner = b.enlace ? '<a href="'+esc(b.enlace)+'">'+img+'</a>' : img;
      var dots = BANNERS.length > 1
        ? '<div class="bnr-dots">'+BANNERS.map(function(_, k){ return '<i class="'+(k===i?"on":"")+'" data-k="'+k+'"></i>'; }).join("")+'</div>'
        : '';
      card.innerHTML = inner + '<button type="button" class="bnr-x" aria-label="Cerrar">&times;</button>' + dots;
      card.querySelector(".bnr-x").addEventListener("click", function(e){ e.preventDefault(); cerrar(); });
      card.querySelectorAll(".bnr-dots i").forEach(function(d){
        d.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); i = Number(d.getAttribute("data-k")) || 0; pintar(); });
      });
    }
    ov.addEventListener("click", function(e){ if(e.target === ov) cerrar(); }); // tocar afuera cierra
    document.body.appendChild(ov);
    pintar();
    if(BANNERS.length > 1) rot = setInterval(function(){ i = (i + 1) % BANNERS.length; pintar(); }, 4500);
  }

  // Carga los banners de la base; si no hay o falla, usa los de config.js. Luego muestra el aviso.
  function cargarYMostrar(){
    if(visto()) return;
    function listo(lista){
      BANNERS = (Array.isArray(lista) && lista.length ? lista : CONFIG_BANNERS).filter(function(b){ return b && b.imagen; });
      if(BANNERS.length) setTimeout(mostrar, 1000); // aparece un poco después de cargar
    }
    if(CAT && CAT.url && CAT.key){
      fetch(CAT.url + "/rest/v1/rpc/banners_activos", { method: "POST", headers: { "Content-Type": "application/json", apikey: CAT.key, Authorization: "Bearer " + CAT.key }, body: "{}" })
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){ listo(d); })
        .catch(function(){ listo(null); });
    } else { listo(null); }
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", cargarYMostrar);
  else cargarYMostrar();
})();
