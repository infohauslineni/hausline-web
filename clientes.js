// Clientes y entregas reales de HAUSLINE.
// Para enlazar una foto a Instagram, pega la URL en "instagramUrl".
// Si se deja vacío (""), la foto se muestra igual pero NO es clicable (sin error).
const clientes = [
  { imagen: "imgP/clientes/1.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/2.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/3.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/4.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/5.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/6.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/7.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/8.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/9.jpeg",  instagramUrl: "" },
  { imagen: "imgP/clientes/10.jpeg", instagramUrl: "" }
];

// Fotos editoriales / publicitarias ("Estilo HAUSLINE").
// codigoProducto: código real de un producto para enlazarlo. Si está vacío o no existe,
// el botón se desactiva de forma segura (sin error, sin redirigir a otro producto).
const editoriales = [
  // Ejemplo de estructura (dejar preparado para que agregues fotos reales):
  {
  imagen: "imgP/ZAPATOS MEN/Birkenstock/BK007/1.jpeg",
  titulo: "Completa tu estilo",
  subtitulo: "BIRKENSTOCK",
  codigoProducto: "BK007",
  textoBoton: "Ver producto",
  activo: true
},

];

// Banners del carrusel principal.
// Guarda tus fotos en imgP/banners/ y escribe la ruta en "imagen".
// Si "imagen" está vacía se muestra un fondo limpio (nunca una imagen rota).
// codigoProducto: si lo llenas, el botón abre ese producto dentro de la web.
// Si el código no existe, el botón cae al catálogo de forma segura.
const banners = [
  {
    // IMAGEN DE PRUEBA: reemplázala por tu foto publicitaria.
    // Al poner un codigoProducto, el botón abre ese producto directamente.
    imagen: "imgP/ZAPATOS MEN/Birkenstock/BK007/3.jpeg",
    titulo: "Nueva colección",
    subtitulo: "Estilo que te define",
    textoBoton: "Ver producto",
    codigoProducto: "BK007",
    enlace: "#catalogo",
    activo: true
  },
  {
    imagen: "imgP/ropa/009.4.jfif",
    titulo: "Entrega inmediata",
    subtitulo: "Productos disponibles ahora en Nicaragua",
    textoBoton: "Ver disponibles",
    codigoProducto: "#009R",
    enlace: "#entrega-inmediata",
    activo: true
  },
  {
    imagen: "imgP/clientes/7.jpeg",
    titulo: "Pedidos bajo encargo",
    subtitulo: "Abono del 50% para confirmar tu pedido",
    textoBoton: "Ver catálogo",
    codigoProducto: "",
    enlace: "#catalogo",
    activo: true
  }
];

// Mensajes de la banda infinita. Edítalos libremente.
const mensajesBanda = [
  "Envíos a toda Nicaragua",
  "Pedidos bajo encargo",
  "Abono del 50% para confirmar",
  "Atención personalizada por WhatsApp",
  "Nuevos productos disponibles",
  "Entrega inmediata en productos seleccionados"
];
