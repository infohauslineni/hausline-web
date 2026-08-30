// Menú de accesos rápidos del botón flotante de WhatsApp. Va en archivo aparte
// porque la CSP del sitio bloquea scripts inline (script-src 'self').
(function(){
  "use strict";
  var fab = document.getElementById("waFab");
  if(!fab) return;
  var toggle = document.getElementById("waToggle");
  var menu = document.getElementById("waMenu");

  function abrir(estado){
    menu.hidden = !estado;
    toggle.setAttribute("aria-expanded", estado ? "true" : "false");
  }
  toggle.addEventListener("click", function(e){
    e.stopPropagation();
    abrir(menu.hidden);
  });
  // Cerrar al tocar fuera o al elegir una opción.
  document.addEventListener("click", function(e){
    if(!fab.contains(e.target)) abrir(false);
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") abrir(false); });
  menu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ abrir(false); });
  });
})();
