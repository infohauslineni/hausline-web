// Fotos que aparecen suaves: marca cada <img> cuando terminó de cargar (o falló) para que
// premium.css la muestre con un fundido, con un brillo suave mientras tanto.
// Si este archivo no corre, las fotos se ven normal (la clase fotos-suaves la pone él).
(function(){
  var raiz = document.documentElement;
  raiz.classList.add("fotos-suaves");
  function marcar(img){ img.classList.add("cargada"); }
  function revisar(img){ if(img.complete && img.naturalWidth) marcar(img); }
  function barrer(n){ if(n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll("img:not(.cargada)"), revisar); }
  document.addEventListener("load", function(e){ if(e.target && e.target.tagName === "IMG") marcar(e.target); }, true);
  document.addEventListener("error", function(e){ if(e.target && e.target.tagName === "IMG") marcar(e.target); }, true);
  new MutationObserver(function(ms){
    ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType !== 1) return; if(n.tagName === "IMG") revisar(n); else barrer(n); }); });
  }).observe(raiz, { childList:true, subtree:true });
  document.addEventListener("DOMContentLoaded", function(){ barrer(document); });
  // Seguro: cualquier foto ya terminada (aunque se haya escapado del aviso) se muestra.
  setInterval(function(){ Array.prototype.forEach.call(document.querySelectorAll("img:not(.cargada)"), function(img){ if(img.complete) marcar(img); }); }, 1500);
})();
