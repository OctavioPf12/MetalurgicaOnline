const supabaseUrl = "https://smreecorhaucshgadzte.supabase.co";
const supabaseKey = "sb_publishable_bvnbP4mZg49V4oDcB37K0Q_6-mFh0FH";

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

let productosMostrados = [];
let paginaActual = 1;

function obtenerProductosPorPagina() {
  return window.innerWidth <= 768 ? 6 : 12;
}

// PRODUCTOS
async function cargarProductos(filtro = "") {
  let query = client
    .from("productos")
    .select("*")
    .order("nombre", { ascending: true });

  if (filtro) {
    query = query.ilike("nombre", `%${filtro}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al cargar productos:", error);
    return;
  }

  paginaActual = 1;
  renderProductos(data);
}

// BUSCADOR
const btnBuscar = document.getElementById("btnBuscar");
if (btnBuscar) {
  btnBuscar.onclick = () => {
    const texto = document.getElementById("buscador").value;
    cargarProductos(texto);
  };
}

// CONTACTO ARRIBA
const btnWhatsTop = document.getElementById("btnWhatsTop");
if (btnWhatsTop) {
  btnWhatsTop.href = "https://wa.me/50587120478";
}

const btnCorreoTop = document.getElementById("btnCorreoTop");
if (btnCorreoTop) {
  btnCorreoTop.href = "mailto:juegomodus@gmail.com";
}

// DETALLE PRODUCTO
async function cargarDetalle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("producto");

  if (!id) return;

  const { data, error } = await client
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const img = document.getElementById("imgProducto");
    const nombre = document.getElementById("nombre");
    const descripcion = document.getElementById("descripcion");
    const origen = document.getElementById("origen");
    const tipo = document.getElementById("tipo");

    if (img) img.src = data.img;
    if (nombre) nombre.innerText = data.nombre;
    if (descripcion) descripcion.innerText = data.descripcion;
    if (origen) origen.innerText = data.origen;
    if (tipo) tipo.innerText = data.tipo;

    const mensaje = `Hola, quiero información sobre ${data.nombre}`;

    // WHATSAPP
    const btnWhats = document.getElementById("btnWhats");
    if (btnWhats) {
      btnWhats.href =
        `https://wa.me/50587120478?text=${encodeURIComponent(mensaje)}`;
    }

    // 🔥 CORREO ARREGLADO (ESTE ES EL CAMBIO CLAVE)
    const btnCorreo = document.getElementById("btnCorreo");
    if (btnCorreo) {
      btnCorreo.onclick = () => {
        const asunto = "Consulta " + data.nombre;

        const url = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=juegomodus@gmail.com&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;

        window.open(url, "_blank");
      };
    }
  }
}

// FILTRO CATEGORIA
async function filtrarCategoria(cat) {
  const { data, error } = await client
    .from("productos")
    .select("*")
    .eq("categoria", cat)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al filtrar categoría:", error);
    return;
  }

  paginaActual = 1;
  renderProductos(data);
}

/* ===== SLIDER DINÁMICO ===== */
const categoriasSlider = [
  {
    nombre: "sillas",
    titulo: "Sillas",
    descripcion: "Diseños modernos y funcionales para distintos espacios."
  },
  {
    nombre: "pupitres",
    titulo: "Pupitres",
    descripcion: "Mobiliario escolar resistente y práctico."
  },
  {
    nombre: "camas",
    titulo: "Camas",
    descripcion: "Estructuras cómodas y duraderas para diferentes necesidades."
  },
  {
    nombre: "tanques",
    titulo: "Tanques",
    descripcion: "Opciones resistentes para almacenamiento y uso industrial."
  },
  {
    nombre: "parques",
    titulo: "Parques",
    descripcion: "Elementos recreativos y estructuras para exteriores."
  },
  {
    nombre: "soldadura",
    titulo: "Soldadura",
    descripcion: "Trabajos metálicos y soluciones personalizadas."
  }
];

let indiceCategoriaActual = 0;
let intervaloSliderCategorias;
let mapaImagenesCategorias = {};

async function cargarImagenesSliderDesdeSupabase() {
  const { data, error } = await client
    .from("productos")
    .select("categoria, img");

  if (error) {
    console.error("Error al cargar imágenes del slider:", error);
    return;
  }

  mapaImagenesCategorias = {};

  categoriasSlider.forEach(cat => {
    mapaImagenesCategorias[cat.nombre] = [];
  });

  data.forEach(producto => {
    const categoria = (producto.categoria || "").toLowerCase().trim();

    if (mapaImagenesCategorias[categoria] && producto.img) {
      mapaImagenesCategorias[categoria].push(producto.img);
    }
  });
}

function obtenerImagenAleatoriaCategoria(nombreCategoria) {
  const imagenes = mapaImagenesCategorias[nombreCategoria] || [];

  if (imagenes.length === 0) {
    return "img/silla1.jpg";
  }

  const indice = Math.floor(Math.random() * imagenes.length);
  return imagenes[indice];
}

function mostrarCategoriaSlider(indice) {
  const categoria = categoriasSlider[indice];

  const titulo = document.getElementById("sliderCategoriaTitulo");
  const descripcion = document.getElementById("sliderCategoriaDescripcion");
  const imagen = document.getElementById("sliderCategoriaImg");
  const btnVerCatalogo = document.getElementById("btnVerCatalogo");

  if (!titulo || !descripcion || !imagen || !btnVerCatalogo) return;

  titulo.textContent = categoria.titulo;
  descripcion.textContent = categoria.descripcion;
  imagen.src = obtenerImagenAleatoriaCategoria(categoria.nombre);
  imagen.alt = categoria.titulo;

  btnVerCatalogo.onclick = () => {
    filtrarCategoria(categoria.nombre);

    const seccionProductos = document.getElementById("productos");
    if (seccionProductos) {
      seccionProductos.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
}

function siguienteCategoriaSlider() {
  indiceCategoriaActual++;
  if (indiceCategoriaActual >= categoriasSlider.length) {
    indiceCategoriaActual = 0;
  }
  mostrarCategoriaSlider(indiceCategoriaActual);
}

function anteriorCategoriaSlider() {
  indiceCategoriaActual--;
  if (indiceCategoriaActual < 0) {
    indiceCategoriaActual = categoriasSlider.length - 1;
  }
  mostrarCategoriaSlider(indiceCategoriaActual);
}

function reiniciarIntervaloSlider() {
  clearInterval(intervaloSliderCategorias);
  intervaloSliderCategorias = setInterval(() => {
    siguienteCategoriaSlider();
  }, 5000);
}

async function iniciarSliderCategorias() {
  const titulo = document.getElementById("sliderCategoriaTitulo");
  const descripcion = document.getElementById("sliderCategoriaDescripcion");
  const imagen = document.getElementById("sliderCategoriaImg");
  const btnVerCatalogo = document.getElementById("btnVerCatalogo");

  if (!titulo || !descripcion || !imagen || !btnVerCatalogo) return;

  await cargarImagenesSliderDesdeSupabase();
  mostrarCategoriaSlider(indiceCategoriaActual);

  const btnAnterior = document.getElementById("btnAnteriorCategoria");
  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      anteriorCategoriaSlider();
      reiniciarIntervaloSlider();
    });
  }

  const btnSiguiente = document.getElementById("btnSiguienteCategoria");
  if (btnSiguiente) {
    btnSiguiente.addEventListener("click", () => {
      siguienteCategoriaSlider();
      reiniciarIntervaloSlider();
    });
  }

  const btnVerTodos = document.getElementById("btnVerTodosProductos");
  if (btnVerTodos) {
    btnVerTodos.addEventListener("click", async () => {
      await cargarProductos();

      const seccionProductos = document.getElementById("productos");
      if (seccionProductos) {
        seccionProductos.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      reiniciarIntervaloSlider();
    });
  }

  intervaloSliderCategorias = setInterval(() => {
    siguienteCategoriaSlider();
  }, 5000);
}
// INICIO
document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  await cargarDetalle();
  await iniciarSliderCategorias();

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("activo");
    });
  }
});

function renderProductos(data) {
  const grid = document.querySelector(".grid");
  const paginacion = document.getElementById("paginacionProductos");

  if (!grid) return;

  productosMostrados = data || [];
  const porPagina = obtenerProductosPorPagina();
  const totalPaginas = Math.ceil(productosMostrados.length / porPagina);

  if (paginaActual > totalPaginas) {
    paginaActual = 1;
  }

  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  const productosPagina = productosMostrados.slice(inicio, fin);

  grid.innerHTML = "";

  if (productosMostrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 30px;">
        <h3>No se encontraron productos.</h3>
      </div>
    `;
    if (paginacion) paginacion.innerHTML = "";
    return;
  }

  productosPagina.forEach((p) => {
    grid.innerHTML += `
      <div class="product-card">
        <div class="card-banner">
          <img src="${p.img}" class="image-contain" alt="${p.nombre}">
        </div>

        <div class="card-content">
          <h3>${p.nombre}</h3>

          <div class="card">
            <div class="loader">
              <p>Ver</p>
              <div class="words">
                <span class="word">Detalles</span>
                <span class="word">Producto</span>
                <span class="word">Ahora</span>
                <span class="word">Comprar</span>
                <span class="word">Info</span>
              </div>
            </div>

            <a href="producto.html?producto=${p.id}" style="text-decoration:none; color:white;">
              <div style="text-align:center; margin-top:10px;">
                👉 Ir al producto
              </div>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  if (paginacion) {
    pintarPaginacion(totalPaginas);
  }
}

// PAGINACIÓN
function pintarPaginacion(totalPaginas) {
  const contenedor = document.getElementById("paginacionProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (totalPaginas <= 1) return;

  contenedor.innerHTML += `
    <button class="btn-pagina nav" onclick="paginaAnterior()" ${paginaActual === 1 ? "disabled" : ""}>
      ← Anterior
    </button>
  `;

  for (let i = 1; i <= totalPaginas; i++) {
    contenedor.innerHTML += `
      <button class="btn-pagina ${i === paginaActual ? "activa" : ""}" onclick="cambiarPagina(${i})">
        ${i}
      </button>
    `;
  }

  contenedor.innerHTML += `
    <button class="btn-pagina nav" onclick="paginaSiguiente()" ${paginaActual === totalPaginas ? "disabled" : ""}>
      Siguiente →
    </button>
  `;
}
function cambiarPagina(numero) {
  paginaActual = numero;
  renderProductos(productosMostrados);

  const seccionProductos = document.getElementById("productos");
  if (seccionProductos) {
    seccionProductos.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function paginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    renderProductos(productosMostrados);

    const seccionProductos = document.getElementById("productos");
    if (seccionProductos) {
      seccionProductos.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }
}

function paginaSiguiente() {
  const porPagina = obtenerProductosPorPagina();
  const totalPaginas = Math.ceil(productosMostrados.length / porPagina);

  if (paginaActual < totalPaginas) {
    paginaActual++;
    renderProductos(productosMostrados);

    const seccionProductos = document.getElementById("productos");
    if (seccionProductos) {
      seccionProductos.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }
}

// movil

function cerrarMenuMobile() {
  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.classList.remove("activo");
  }
}

window.addEventListener("resize", () => {
  paginaActual = 1;
  renderProductos(productosMostrados);
});