// Favoritos y "vistos recientemente" con localStorage.

const FAV_KEY = "hausline_favoritos";
const VISTOS_KEY = "hausline_vistos";
const MAX_VISTOS = 12;

function leerFavoritos(){
  try{ return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch(e){ return []; }
}

function guardarFavoritos(lista){
  localStorage.setItem(FAV_KEY, JSON.stringify(lista));
}

function esFavorito(codigo){
  return leerFavoritos().includes(codigo);
}

function alternarFavorito(codigo){
  const lista = leerFavoritos();
  const i = lista.indexOf(codigo);
  let activo;
  if(i === -1){ lista.push(codigo); activo = true; }
  else { lista.splice(i, 1); activo = false; }
  guardarFavoritos(lista);
  actualizarContadorFavoritos();
  document.dispatchEvent(new CustomEvent("favoritos:cambio", { detail: { codigo, activo } }));
  return activo;
}

function contarFavoritos(){
  return leerFavoritos().length;
}

function actualizarContadorFavoritos(){
  const n = contarFavoritos();
  document.querySelectorAll("[data-contador-favoritos]").forEach(el => {
    el.textContent = n;
    el.classList.toggle("vacio", n === 0);
  });
}

// ---- Vistos recientemente ----

function leerVistos(){
  try{ return JSON.parse(localStorage.getItem(VISTOS_KEY)) || []; }
  catch(e){ return []; }
}

function registrarVisto(codigo){
  let lista = leerVistos().filter(c => c !== codigo);
  lista.unshift(codigo);
  lista = lista.slice(0, MAX_VISTOS);
  localStorage.setItem(VISTOS_KEY, JSON.stringify(lista));
  document.dispatchEvent(new CustomEvent("vistos:cambio"));
}
