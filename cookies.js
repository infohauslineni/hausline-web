/* Banner de consentimiento de cookies de HAUSLINE.
   Guarda la elección del usuario en localStorage:
   - "essential" = solo cookies necesarias (rechazó el rastreo)
   - "all"       = aceptó también el rastreo/analítica
   No carga scripts de terceros por sí solo; sirve como base para condicionar
   cualquier rastreo a futuro con window.hauslineTrackingAllowed(). */
(function () {
  "use strict";
  var KEY = "hausline_cookie_consent";

  function leer() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "all" || v === "essential" ? v : null;
    } catch (e) { return null; }
  }
  function guardar(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* modo privado */ }
  }

  // Expuesto por si a futuro se agrega analítica: solo activarla si devuelve true.
  window.hauslineTrackingAllowed = function () { return leer() === "all"; };

  if (leer() !== null) return; // ya eligió: no mostramos nada

  function inyectarEstilos() {
    if (document.getElementById("hl-cookie-style")) return;
    var css =
      ".hl-cookie{position:fixed;left:0;right:0;bottom:0;z-index:2000;display:flex;justify-content:center;padding:14px;pointer-events:none;}" +
      ".hl-cookie__box{pointer-events:auto;display:flex;align-items:flex-start;gap:14px;width:100%;max-width:820px;background:#151515;border:1px solid #292929;border-radius:16px;padding:16px 18px;box-shadow:0 20px 70px rgba(0,0,0,.5);}" +
      ".hl-cookie__ico{flex:none;font-size:22px;line-height:1;}" +
      ".hl-cookie__txt{flex:1;min-width:0;}" +
      ".hl-cookie__t{color:#fff;font-weight:700;font-size:15px;margin:0 0 4px;}" +
      ".hl-cookie__p{color:#a5a5a5;font-size:13px;line-height:1.55;margin:0;}" +
      ".hl-cookie__p a{color:#b7ff00;}" +
      ".hl-cookie__btns{display:flex;gap:8px;flex:none;align-self:center;}" +
      ".hl-cookie__btn{border:0;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;}" +
      ".hl-cookie__btn--no{background:transparent;border:1px solid #3a3a3a;color:#a5a5a5;}" +
      ".hl-cookie__btn--no:hover{color:#fff;border-color:#5a5a5a;}" +
      ".hl-cookie__btn--si{background:#b7ff00;color:#050505;}" +
      ".hl-cookie__btn--si:hover{background:#c5ff35;}" +
      "@media(max-width:640px){.hl-cookie__box{flex-wrap:wrap;}.hl-cookie__btns{width:100%;}.hl-cookie__btn{flex:1;}}";
    var s = document.createElement("style");
    s.id = "hl-cookie-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function mostrar() {
    inyectarEstilos();
    var wrap = document.createElement("div");
    wrap.className = "hl-cookie";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-label", "Aviso de cookies");

    var box = document.createElement("div");
    box.className = "hl-cookie__box";

    var ico = document.createElement("div");
    ico.className = "hl-cookie__ico";
    ico.textContent = "🍪";

    var txt = document.createElement("div");
    txt.className = "hl-cookie__txt";
    var t = document.createElement("p");
    t.className = "hl-cookie__t";
    t.textContent = "Usamos cookies";
    var p = document.createElement("p");
    p.className = "hl-cookie__p";
    p.innerHTML = "Usamos cookies necesarias para que el sitio funcione. Con tu permiso también usaríamos " +
      "cookies de rastreo para entender cómo se usa la página. " +
      '<a href="/privacidad.html">Más información</a>.';
    txt.appendChild(t);
    txt.appendChild(p);

    var btns = document.createElement("div");
    btns.className = "hl-cookie__btns";
    var no = document.createElement("button");
    no.type = "button";
    no.className = "hl-cookie__btn hl-cookie__btn--no";
    no.textContent = "Rechazar";
    var si = document.createElement("button");
    si.type = "button";
    si.className = "hl-cookie__btn hl-cookie__btn--si";
    si.textContent = "Aceptar";
    btns.appendChild(no);
    btns.appendChild(si);

    box.appendChild(ico);
    box.appendChild(txt);
    box.appendChild(btns);
    wrap.appendChild(box);
    document.body.appendChild(wrap);

    function cerrar(valor) {
      guardar(valor);
      wrap.remove();
    }
    no.addEventListener("click", function () { cerrar("essential"); });
    si.addEventListener("click", function () { cerrar("all"); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mostrar);
  } else {
    mostrar();
  }
})();
