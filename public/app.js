// Referencias al DOM
// Al inicio de app.js obtenemos el usuario autenticado
const usuarioSesion = JSON.parse(localStorage.getItem("usuario") || "{}");

const tablaProductos = document.getElementById("tabla-productos");
const statTotal = document.getElementById("stat-total");
const statStock = document.getElementById("stat-stock");
const statValor = document.getElementById("stat-valor");
const badgeContador = document.getElementById("badge-contador");

const inputBusqueda = document.getElementById("input-busqueda");
const selectCategoria = document.getElementById("select-categoria");

const spanPaginaActual = document.getElementById("span-pagina-actual");
const spanTotalPaginas = document.getElementById("span-total-paginas");
const btnAnt = document.getElementById("btn-ant");
const btnSig = document.getElementById("btn-sig");

const modal = document.getElementById("modal-producto");
const btnAbrirModal = document.getElementById("btn-abrir-modal");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnCancelar = document.getElementById("btn-cancelar");
const formNuevo = document.getElementById("form-nuevo-producto");
const inputId = document.getElementById("input-id");
const modalTitulo = modal.querySelector("h3");

// ==========================================
// CONTROL DE ACCESO POR ROL (RBAC)
// ==========================================
// Si el usuario no es admin, ocultamos el botón de crear producto
if (usuarioSesion.rol !== "admin") {
  if (btnAbrirModal) {
    btnAbrirModal.classList.add("hidden");
  }
}
// Estado de paginación
let paginaActual = 1;
const limitePorPagina = 5;
let productosPagina = [];

// 1. Cargar datos con búsqueda y filtros aplicados en el Backend (Neon)
async function cargarProductos() {
  try {
    const texto = inputBusqueda.value.trim();
    const cat = selectCategoria.value;

    const queryParams = new URLSearchParams({
      pagina: paginaActual,
      limite: limitePorPagina,
      busqueda: texto,
      categoria: cat,
    });

    const res = await fetch(`/api/productos?${queryParams}`);
    const respuesta = await res.json();

    productosPagina = respuesta.datos;
    const { totalItems, totalPaginas } = respuesta.paginacion;

    // Actualizar números de paginación
    spanPaginaActual.textContent = paginaActual;
    spanTotalPaginas.textContent = totalPaginas || 1;
    btnAnt.disabled = paginaActual <= 1;
    btnSig.disabled = paginaActual >= totalPaginas || totalPaginas === 0;

    if (respuesta.categorias) {
      poblarCategorias(respuesta.categorias);
    }

    renderizarTabla(productosPagina, totalItems);

    // Actualizar métricas GLOBALES de toda la base de datos
    if (respuesta.stats) {
      statTotal.textContent = respuesta.stats.total;
      statStock.textContent = respuesta.stats.stock;
      statValor.textContent = `S/ ${respuesta.stats.valor.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  } catch (error) {
    console.error("Error al obtener datos:", error);
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-rose-400">
          Error al conectar con la base de datos de Neon.
        </td>
      </tr>
    `;
  }
}

// 2. Llenar el dropdown de categorías desde la BD
function poblarCategorias(categorias) {
  const seleccionada = selectCategoria.value;
  selectCategoria.innerHTML =
    '<option value="todas">Todas las categorías</option>';

  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    selectCategoria.appendChild(opt);
  });

  if (categorias.includes(seleccionada)) {
    selectCategoria.value = seleccionada;
  }
}

// 3. Renderizar Filas
function renderizarTabla(productos, totalFiltrados = 0) {
  if (productos.length === 0) {
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-500">
          No se encontraron productos con ese criterio.
        </td>
      </tr>
    `;
    badgeContador.textContent = "0 items";
    return;
  }

  badgeContador.textContent = `${totalFiltrados} items encontrados`;

  tablaProductos.innerHTML = productos
    .map((prod) => {
      const estadoClass =
        Number(prod.stock) > 0
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-400 border-rose-500/20";

      const textoEstado = Number(prod.stock) > 0 ? "Disponible" : "Agotado";

      // 1. EVALUAR EL ROL PARA DEFINIR QUÉ BOTONES MOSTRAR
      const accionesHTML =
        usuarioSesion.rol === "admin"
          ? `
        <button onclick="prepararEdicion(${prod.id})" class="text-xs bg-white/5 hover:bg-white/10 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 transition">
          Editar
        </button>
        <button onclick="eliminarProducto(${prod.id})" class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg transition">
          Eliminar
        </button>
      `
          : `<span class="text-xs text-slate-500 italic">Solo lectura</span>`;

      // 2. INYECTAR accionesHTML EN LA ÚLTIMA COLUMNA DE LA FILA
      return `
      <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td class="py-3 px-4 font-mono text-xs text-slate-500">#${prod.id}</td>
        <td class="py-3 px-4 font-medium text-white">${prod.nombre}</td>
        <td class="py-3 px-4 text-slate-400">${prod.categoria}</td>
        <td class="py-3 px-4 font-semibold text-slate-200">S/ ${parseFloat(prod.precio).toFixed(2)}</td>
        <td class="py-3 px-4 font-mono text-slate-300">${prod.stock}</td>
        <td class="py-3 px-4">
          <span class="inline-block text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${estadoClass}">
            ${textoEstado}
          </span>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          ${accionesHTML}
        </td>
      </tr>
    `;
    })
    .join("");
}

// Eventos de Paginación
btnAnt.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--;
    cargarProductos();
  }
});

btnSig.addEventListener("click", () => {
  paginaActual++;
  cargarProductos();
});

// Eventos de búsqueda y filtros (resetean a página 1 y consultan toda la base de datos)
inputBusqueda.addEventListener("input", () => {
  paginaActual = 1;
  cargarProductos();
});

selectCategoria.addEventListener("change", () => {
  paginaActual = 1;
  cargarProductos();
});

// Modal
function abrirModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function cerrarModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  formNuevo.reset();
  inputId.value = "";
  modalTitulo.textContent = "Registrar Nuevo Producto";
}

btnAbrirModal.addEventListener("click", abrirModal);
btnCerrarModal.addEventListener("click", cerrarModal);
btnCancelar.addEventListener("click", cerrarModal);

// Editar producto
window.prepararEdicion = (id) => {
  const producto = productosPagina.find((p) => p.id === id);
  if (!producto) return;

  inputId.value = producto.id;
  document.getElementById("input-nombre").value = producto.nombre;
  document.getElementById("input-categoria").value = producto.categoria;
  document.getElementById("input-precio").value = producto.precio;
  document.getElementById("input-stock").value = producto.stock;

  modalTitulo.textContent = `Editar Producto #${id}`;
  abrirModal();
};

// Eliminar producto con registro de auditoría
window.eliminarProducto = async (id) => {
  if (!confirm(`¿Estás seguro de eliminar el producto #${id}?`)) return;

  try {
    // 1. Obtener la sesión activa del usuario
    const usuarioSesion = JSON.parse(localStorage.getItem("usuario") || "{}");
    const usuarioId = usuarioSesion.id || "";

    // 2. Enviar el ID del usuario en la URL como query param (?usuarioId=...)
    const res = await fetch(`/api/productos/${id}?usuarioId=${usuarioId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      cargarProductos();
    } else {
      const err = await res.json();
      alert(`Error: ${err.mensaje}`);
    }
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo conectar con el servidor.");
  }
};

// Guardar/Actualizar
formNuevo.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = inputId.value;
  const esEdicion = Boolean(id);

  const payload = {
    nombre: document.getElementById("input-nombre").value.trim(),
    categoria: document.getElementById("input-categoria").value.trim(),
    precio: parseFloat(document.getElementById("input-precio").value),
    stock: parseInt(document.getElementById("input-stock").value, 10),
    estado:
      parseInt(document.getElementById("input-stock").value, 10) > 0
        ? "disponible"
        : "agotado",
    usuarioId: usuarioSesion.id,
  };

  const url = esEdicion ? `/api/productos/${id}` : "/api/productos";
  const method = esEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      cerrarModal();
      cargarProductos();
    } else {
      const err = await res.json();
      alert(`Error: ${err.mensaje}`);
    }
  } catch (error) {
    console.error("Error al procesar solicitud:", error);
    alert("No se pudo conectar con el servidor.");
  }
});

// Inicio
cargarProductos();

// ==========================================
// AUDITORÍA / CAMBIOS HECHOS (SOLO ADMIN)
// ==========================================
const btnCambiosHechos = document.getElementById("btn-cambios-hechos");
const modalHistorial = document.getElementById("modal-historial");
const btnCerrarHistorial = document.getElementById("btn-cerrar-historial");
const listaCambios = document.getElementById("lista-cambios");

// 1. Mostrar el botón en el menú solo si el rol es admin
if (usuarioSesion && usuarioSesion.rol === "admin" && btnCambiosHechos) {
  btnCambiosHechos.classList.remove("hidden");
  btnCambiosHechos.classList.add("flex");
}

// 2. Evento para abrir el modal y consultar la API
if (btnCambiosHechos) {
  btnCambiosHechos.addEventListener("click", async () => {
    try {
      listaCambios.innerHTML =
        '<p class="text-xs text-slate-400 text-center py-6">Consultando registros...</p>';
      modalHistorial.classList.remove("hidden");
      modalHistorial.classList.add("flex");

      const res = await fetch("/api/productos/auditoria/historial");
      const registros = await res.json();

      if (!registros || registros.length === 0) {
        listaCambios.innerHTML =
          '<p class="text-xs text-slate-500 text-center py-6">Aún no hay cambios registrados en la base de datos.</p>';
        return;
      }

      listaCambios.innerHTML = registros
        .map((item) => {
          let badgeColor =
            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
          if (item.accion === "CREACION")
            badgeColor =
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          if (item.accion === "ELIMINACION")
            badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

          // Garantiza que el texto sea interpretado en formato UTC ISO antes de convertirlo
          const fechaStr = item.creado_en.endsWith("Z")
            ? item.creado_en
            : item.creado_en + "Z";

          const fecha = new Date(fechaStr).toLocaleString("es-PE", {
            timeZone: "America/Lima",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return `
          <div class="flex items-start justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeColor}">
                  ${item.accion}
                </span>
                <span class="text-slate-200 font-semibold text-xs">${item.usuario_nombre || "Usuario"}</span>
                <span class="text-[10px] text-slate-500 font-mono">(${item.usuario_email || "Sin correo"})</span>
              </div>
              <p class="text-xs text-slate-300">${item.detalles}</p>
            </div>
            <span class="text-[10px] text-slate-500 whitespace-nowrap ml-3 font-mono">${fecha}</span>
          </div>
        `;
        })
        .join("");
    } catch (error) {
      console.error("Error al cargar la bitácora:", error);
      listaCambios.innerHTML =
        '<p class="text-xs text-rose-400 text-center py-6">Error al conectar con la bitácora de auditoría.</p>';
    }
  });
}

// 3. Cerrar modal
if (btnCerrarHistorial) {
  btnCerrarHistorial.addEventListener("click", () => {
    modalHistorial.classList.add("hidden");
    modalHistorial.classList.remove("flex");
  });
}
