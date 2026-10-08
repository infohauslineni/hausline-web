// ============================================================
// HAUSLINE · "¿Quiso decir …?" en los campos de correo
// Si el cliente escribe un dominio mal (gmail.con, gmial.com, hotmail.co…), debajo del campo
// aparece la sugerencia con un botón para corregirlo de un toque. Así no se crean cuentas con
// el correo mal escrito (después nunca le llega la confirmación ni el seguimiento).
// Funciona sola en todos los <input type="email"> de la página, también los que se dibujan
// después (checkout, Mi cuenta), gracias a un MutationObserver.
// ============================================================
(function(){
  "use strict";
  var DOMINIOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];
  // Dominios reales parecidos a los de arriba que NO hay que corregir.
  var VALIDOS = ["hotmail.es", "yahoo.es", "outlook.es", "live.es", "yahoo.com.mx", "hotmail.com.mx", "live.com.mx", "outlook.com.mx", "me.com", "msn.com", "mac.com", "aol.com", "gmx.com", "mail.com", "proton.me", "protonmail.com", "ymail.com", "hotmail.co.uk", "yahoo.co.uk"];

  function distancia(a, b){
    var d = [], i, j;
    for(i = 0; i <= a.length; i++){ d[i] = [i]; }
    for(j = 1; j <= b.length; j++){ d[0][j] = j; }
    for(i = 1; i <= a.length; i++) for(j = 1; j <= b.length; j++){
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    }
    return d[a.length][b.length];
  }
  function sugerencia(correo){
    var partes = String(correo || "").trim().toLowerCase().split("@");
    if(partes.length !== 2 || !partes[0] || !partes[1]) return null;
    var dom = partes[1];
    if(DOMINIOS.indexOf(dom) >= 0 || VALIDOS.indexOf(dom) >= 0) return null;
    var mejor = null, dist = 99;
    DOMINIOS.forEach(function(d){ var k = distancia(dom, d); if(k < dist){ dist = k; mejor = d; } });
    return mejor && dist <= 2 ? partes[0] + "@" + mejor : null;
  }
  window.hauslineSugerenciaCorreo = sugerencia;

  function revisar(input){
    var aviso = input.nextElementSibling && input.nextElementSibling.classList && input.nextElementSibling.classList.contains("hl-sug-correo") ? input.nextElementSibling : null;
    var s = sugerencia(input.value);
    if(!s){ if(aviso) aviso.remove(); return; }
    if(!aviso){
      aviso = document.createElement("div");
      aviso.className = "hl-sug-correo";
      aviso.setAttribute("role", "status");
      aviso.style.cssText = "margin-top:6px;font-size:13px;line-height:1.4;color:#9a5b00;background:#fff6e5;border:1px solid #f3d9a4;border-radius:10px;padding:8px 10px;display:flex;flex-wrap:wrap;align-items:center;gap:8px";
      input.insertAdjacentElement("afterend", aviso);
    }
    aviso.innerHTML = "";
    var t = document.createElement("span"); t.textContent = "¿Quiso decir " + s + "?";
    var b = document.createElement("button"); b.type = "button"; b.textContent = "Sí, corregir";
    b.style.cssText = "font:inherit;font-weight:700;border:0;border-radius:999px;padding:4px 12px;background:#171310;color:#fff;cursor:pointer";
    b.addEventListener("click", function(){ input.value = s; input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); aviso.remove(); input.focus(); });
    aviso.appendChild(t); aviso.appendChild(b);
  }
  function conectar(input){
    if(input.dataset.hlSug) return;
    input.dataset.hlSug = "1";
    input.addEventListener("blur", function(){ revisar(input); });
    input.addEventListener("input", function(){ var a = input.nextElementSibling; if(a && a.classList && a.classList.contains("hl-sug-correo") && !sugerencia(input.value)) a.remove(); });
  }
  function escanear(raiz){ (raiz.querySelectorAll ? raiz : document).querySelectorAll('input[type="email"], input[autocomplete="email"], input[name="correo"], input[id*="orreo"]').forEach(conectar); }
  function iniciar(){
    escanear(document);
    try{ new MutationObserver(function(){ escanear(document); }).observe(document.body, { childList: true, subtree: true }); }catch(e){}
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
