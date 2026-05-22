const supabaseUrl = "https://smreecorhaucshgadzte.supabase.co";
const supabaseKey = "sb_publishable_bvnbP4mZg49V4oDcB37K0Q_6-mFh0FH";

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

// MAPA CATEGORIAS
function obtenerIdCategoria(nombre) {
  const mapa = {
    "sillas": 1,
    "pupitres": 2,
    "soldadura": 3,
    "tanques": 4,
    "parques": 5,
    "camas": 6
  };
  return mapa[nombre.toLowerCase().trim()] || null;
}

function obtenerNombreCategoria(id) {
  const mapa = {
    1: "Sillas",
    2: "Pupitres",
    3: "Soldadura",
    4: "Tanques",
    5: "Parques",
    6: "Camas"
  };
  return mapa[id] || "Sin categoría";
}

// UI
function mostrarFormulario() {
  document.getElementById("vistaProductos").style.display = "none";
  document.getElementById("vistaFormulario").style.display = "block";
}

function volverProductos() {
  document.getElementById("vistaProductos").style.display = "block";
  document.getElementById("vistaFormulario").style.display = "none";
}

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) return alert("Error al iniciar sesión");

  verificarSesion();
}

// LOGOUT
async function logout() {
  await client.auth.signOut();
  location.reload();
}

// SESION
async function verificarSesion() {
  const { data } = await client.auth.getSession();

  if (data.session) {
    document.getElementById("login").style.display = "none";
    document.getElementById("panel").style.display = "block";
    cargarProductos();
  } else {
    document.getElementById("login").style.display = "block";
    document.getElementById("panel").style.display = "none";
  }
}

// LISTA
let productosAdmin = [];
async function cargarProductos() {
  const { data, error } = await client.from("productos").select("*");

  if (error) {
    console.error("ERROR CARGAR:", error);
    return;
  }

  productosAdmin = data;
  mostrarProductosAdmin(productosAdmin);
}

function mostrarProductosAdmin(lista) {
  const listaHTML = document.getElementById("listaProductos");
  listaHTML.innerHTML = "";

  if (!lista || lista.length === 0) {
    listaHTML.innerHTML = `<p style="text-align:center;">No hay productos para mostrar.</p>`;
    return;
  }

  lista.forEach(p => {
    listaHTML.innerHTML += `
      <div class="producto admin-producto">
        <img src="${p.img}" alt="${p.nombre}">

        <div class="producto-info">
          <h4>${p.nombre}</h4>
          <p><strong>Categoría:</strong> ${p.categoria || "Sin categoría"}</p>
          <p><strong>Tipo:</strong> ${p.tipo || "No definido"}</p>
          <p><strong>Origen:</strong> ${p.origen || "No definido"}</p>
          <p><strong>Descripción:</strong> ${p.descripcion || "Sin descripción"}</p>
          <p><strong>Fecha inicio:</strong> ${p.fecha_inicio || "—"}</p>
          <p><strong>Fecha fin:</strong> ${p.fecha_fin || "—"}</p>
        </div>

        <div class="acciones">
          <button onclick="editarProducto(${p.id})">✏️</button>
          <button onclick="eliminarProducto(${p.id})">🗑️</button>
        </div>
      </div>
    `;
  });
}

// filtro
function filtrarCategoriaAdmin(cat) {
  const filtrados = productosAdmin.filter(p => 
    p.categoria?.toLowerCase() === cat.toLowerCase()
  );

  mostrarProductosAdmin(filtrados);
}

// EDITAR
window.editarProducto = async function(id) {
  const { data, error } = await client
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return console.error(error);

  document.getElementById("idProducto").value = data.id;
  document.getElementById("nombre").value = data.nombre;
  document.getElementById("descripcion").value = data.descripcion;
  document.getElementById("origen").value = data.origen;
  document.getElementById("tipo").value = data.tipo;
  document.getElementById("categoria").value = data.categoria || "";
  document.getElementById("fecha_inicio").value = data.fecha_inicio || "";
  document.getElementById("fecha_fin").value = data.fecha_fin || "";
  mostrarFormulario();
};

// ELIMINAR
window.eliminarProducto = async function(id) {
  if (!confirm("¿Eliminar producto?")) return;

  await client.from("productos").delete().eq("id", id);
  cargarProductos();
};

// GUARDAR
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formProducto");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("idProducto").value;
    const file = document.getElementById("img").files[0];
    if (file && !file.type.startsWith("image/")) {
  alert("Solo se permiten imágenes");
  return;
}
    let imageUrl = "https://via.placeholder.com/300";

    // SUBIR IMAGEN
    if (file) {
      const fileName = Date.now() + "-" + file.name;

      const { error } = await client.storage
        .from("productos")
        .upload(fileName, file);

      if (error) {
        console.error(error);
        alert("Error subiendo imagen");
        return;
      }

      imageUrl = `${supabaseUrl}/storage/v1/object/public/productos/${fileName}`;
    }

    const categoriaValor = document.getElementById("categoria").value;

    const producto = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      img: imageUrl, // 🔥 CORRECTO
      origen: document.getElementById("origen").value,
      tipo: document.getElementById("tipo").value,
      categoria_id: obtenerIdCategoria(categoriaValor),
      fecha_inicio: document.getElementById("fecha_inicio").value,
      fecha_fin: document.getElementById("fecha_fin").value
    };

    let respuesta;

    if (id) {
      respuesta = await client.from("productos").update(producto).eq("id", id);
    } else {
      respuesta = await client.from("productos").insert([producto]);
    }

    if (respuesta.error) {
      console.error(respuesta.error);
      alert("Error: " + respuesta.error.message);
      return;
    }

    alert("Guardado correctamente ✅");

    form.reset();
    cargarProductos();
    volverProductos();
  });

});

// INICIO
verificarSesion();