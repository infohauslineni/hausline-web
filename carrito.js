// Carrito de compras multi-producto con localStorage.
// Cada línea guarda una variante (código + talla + color).

const CARRITO_KEY = "hausline_carrito";
const WHATSAPP_NUMERO = "50578995116";

function leerCarrito(){
  try{ return JSON.parse(localStorage.getItem(CARRITO_KEY)) || []; }
  catch(e){ return []; }
}

function guardarCarrito(items){
  localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  actualizarContadorCarrito();
  document.dispatchEvent(new CustomEvent("carrito:cambio"));
}

function claveVariante(codigo, talla, color){
  return [codigo, talla || "", color || ""].join("|");
}

// item: { codigo, nombre, marca, categoria, imagen, talla, color, precioUnitario, envioRapido, entregaInmediata }
function agregarAlCarrito(item, cantidad){
  cantidad = cantidad || 1;
  const items = leerCarrito();
  const clave = claveVariante(item.codigo, item.talla, item.color);
  const existente = items.find(i => claveVariante(i.codigo, i.talla, i.color) === clave);

  if(existente){
    existente.cantidad += cantidad;
  } else {
    items.push({
      codigo: item.codigo,
      nombre: item.nombre,
      marca: item.marca || "",
      categoria: item.categoria || "",
      imagen: item.imagen || "",
      talla: item.talla || "",
      color: item.color || "",
      precioUnitario: Number(item.precioUnitario) || 0,
      envioRapido: !!item.envioRapido,
      entregaInmediata: !!item.entregaInmediata,
      cantidad: cantidad
    });
  }
  guardarCarrito(items);
}

function cambiarCantidad(clave, delta){
  const items = leerCarrito();
  const it = items.find(i => claveVariante(i.codigo, i.talla, i.color) === clave);
  if(!it) return;
  it.cantidad += delta;
  if(it.cantidad <= 0){
    guardarCarrito(items.filter(i => i !== it));
  } else {
    guardarCarrito(items);
  }
}

function eliminarDelCarrito(clave){
  guardarCarrito(leerCarrito().filter(i => claveVariante(i.codigo, i.talla, i.color) !== clave));
}

function vaciarCarrito(){
  guardarCarrito([]);
}

function subtotalItem(item){
  return item.precioUnitario * item.cantidad;
}

function totalCarrito(){
  return leerCarrito().reduce((acc, i) => acc + subtotalItem(i), 0);
}

function contarCarrito(){
  return leerCarrito().reduce((acc, i) => acc + i.cantidad, 0);
}

function actualizarContadorCarrito(){
  const n = contarCarrito();
  document.querySelectorAll("[data-contador-carrito]").forEach(el => {
    el.textContent = n;
    el.classList.toggle("vacio", n === 0);
  });
}

function moneda(n){
  return "$" + Number(n).toLocaleString("en-US");
}

// Construye el mensaje profesional para WhatsApp con todo el pedido.
function mensajeCarritoWhatsApp(){
  const items = leerCarrito();
  if(items.length === 0) return "";

  let msg = "Hola, quiero realizar el siguiente pedido en HAUSLINE:\n\n";

  items.forEach((it, idx) => {
    msg += `${idx + 1}. CÓDIGO: ${it.codigo}\n`;
    msg += `Producto: ${it.nombre}\n`;
    if(it.marca) msg += `Marca: ${it.marca}\n`;
    if(it.talla) msg += `Talla: ${it.talla}\n`;
    if(it.color) msg += `Color: ${it.color}\n`;
    msg += `Cantidad: ${it.cantidad}\n`;
    msg += `Precio unitario: ${moneda(it.precioUnitario)}\n`;
    msg += `Subtotal: ${moneda(subtotalItem(it))}\n`;
    if(it.envioRapido) msg += `Envío rápido: sí\n`;
    if(it.entregaInmediata) msg += `Entrega inmediata: sí\n`;
    msg += `\n`;
  });

  const total = totalCarrito();
  msg += `Total estimado: ${moneda(total)}\n`;

  // El abono del 50% solo aplica a lo que va por encargo.
  // Los productos de entrega inmediata se pagan al recibir, sin abono.
  const totalEncargo = items
    .filter(i => !i.entregaInmediata)
    .reduce((acc, i) => acc + subtotalItem(i), 0);

  if(totalEncargo > 0){
    msg += `Abono para confirmar (50%): ${moneda(Math.round(totalEncargo * 0.5))}\n`;
    if(totalEncargo !== total){
      msg += `(el abono aplica solo a los productos por encargo)\n`;
    }
  }

  msg += `\nNombre del cliente:\n`;
  msg += "Ciudad o departamento:\n";
  msg += "Método de entrega:\n\n";
  msg += totalEncargo > 0
    ? "Quedo atento para confirmar disponibilidad y realizar el abono."
    : "Quedo atento para coordinar la entrega.";

  return msg;
}

function enviarPedidoWhatsApp(){
  const msg = mensajeCarritoWhatsApp();
  if(!msg){
    alert("Tu carrito está vacío.");
    return;
  }
  window.open(
    "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(msg),
    "_blank"
  );
}
