/* Protección contra "clickjacking": la tienda no se deja meter (invisible) dentro de otra página
   para engañar al cliente y que toque botones sin saberlo. GitHub Pages no permite la cabecera
   X-Frame-Options / frame-ancestors, así que se hace aquí. Va primero en el <head> de cada página.
   Dentro de nuestro propio sitio (mismo dominio) sí se permite. */
(function(){
  try{
    if(window.top === window.self) return;
    try{ if(window.top.location.hostname === location.hostname) return; }catch(e){}
    document.documentElement.style.visibility = "hidden";
    window.top.location.replace(location.href);
  }catch(e){
    document.documentElement.style.visibility = "hidden";
  }
})();
