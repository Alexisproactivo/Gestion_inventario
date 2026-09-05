const tablaProductos = document.getElementById('tabla-productos');
const statTotal = document.getElementById('stat-total');
const statStock = document.getElementById('stat-stock');
const statValor = document.getElementById('stat-valor');
const badgeContador = document.getElementById('badge-contador');

const modal = document.getElementById('modal-producto');
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelar = document.getElementById('btn-cancelar');
const formNuevo = document.getElementById('form-nuevo-producto');
const inputId = document.getElementById('input-id');
const modalTitulo = modal.querySelector('h3');

let productosLocales = [];

async function cargarProductos() {
  try {
    const respuesta = await fetch('/api/productos');
    productosLocales = await respuesta.json();

    renderizarTabla(productosLocales);
    actualizarMetricas(productosLocales);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-rose-400">
          Error al conectar con la base de datos de Neon.
        </td>
      </tr>
    `;
  }
}

function renderizarTabla(productos) {
  if (productos.length === 0) {
    tablaProductos.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-slate-500">
          No hay productos registrados actualmente.
        </td>
      </tr>
    `;
    badgeContador.textContent = '0 items';
    return;
  }

  badgeContador.textContent = `${productos.length} items`;

  tablaProductos.innerHTML = productos.map(prod => {
    const estadoClass = Number(prod.stock) > 0
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

    const textoEstado = Number(prod.stock) > 0 ? 'Disponible' : 'Agotado';

    return `
      <tr class="border-b border-slate-800/60">
        <td class="py-3 px-4 font-mono text-xs text-slate-400">#${prod.id}</td>
        <td class="py-3 px-4 font-medium text-white">${prod.nombre}</td>
        <td class="py-3 px-4 text-slate-400">${prod.categoria}</td>
        <td class="py-3 px-4 font-semibold text-slate-200">S/ ${parseFloat(prod.precio).toFixed(2)}</td>
        <td class="py-3 px-4 font-mono">${prod.stock}</td>
        <td class="py-3 px-4">
          <span class="inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium ${estadoClass}">
            ${textoEstado}
          </span>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <button onclick="prepararEdicion(${prod.id})" class="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded transition">
            Editar
          </button>
          <button onclick="eliminarProducto(${prod.id})" class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded transition">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function actualizarMetricas(productos) {
  const totalItems = productos.length;
  const unidadesStock = productos.reduce((acc, p) => acc + Number(p.stock), 0);
  const valorTotal = productos.reduce((acc, p) => acc + (Number(p.precio) * Number(p.stock)), 0);

  statTotal.textContent = totalItems;
  statStock.textContent = unidadesStock;
  statValor.textContent = `S/ ${valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Modal
function abrirModal() {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  formNuevo.reset();
  inputId.value = '';
  modalTitulo.textContent = 'Registrar Nuevo Producto';
}

btnAbrirModal.addEventListener('click', abrirModal);
btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);

// Preparar formulario para Editar
window.prepararEdicion = (id) => {
  const producto = productosLocales.find(p => p.id === id);
  if (!producto) return;

  inputId.value = producto.id;
  document.getElementById('input-nombre').value = producto.nombre;
  document.getElementById('input-categoria').value = producto.categoria;
  document.getElementById('input-precio').value = producto.precio;
  document.getElementById('input-stock').value = producto.stock;

  modalTitulo.textContent = `Editar Producto #${id}`;
  abrirModal();
};

// Eliminar producto (DELETE /api/productos/:id)
window.eliminarProducto = async (id) => {
  if (!confirm(`¿Estás seguro de eliminar el producto #${id}?`)) return;

  try {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      cargarProductos();
    } else {
      const err = await res.json();
      alert(`Error: ${err.mensaje}`);
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    alert('No se pudo conectar con el servidor.');
  }
};

// Guardar o Actualizar (POST o PUT)
formNuevo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = inputId.value;
  const esEdicion = Boolean(id);

  const payload = {
    nombre: document.getElementById('input-nombre').value.trim(),
    categoria: document.getElementById('input-categoria').value.trim(),
    precio: parseFloat(document.getElementById('input-precio').value),
    stock: parseInt(document.getElementById('input-stock').value, 10),
    estado: parseInt(document.getElementById('input-stock').value, 10) > 0 ? 'disponible' : 'agotado'
  };

  const url = esEdicion ? `/api/productos/${id}` : '/api/productos';
  const method = esEdicion ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      cerrarModal();
      cargarProductos();
    } else {
      const err = await res.json();
      alert(`Error: ${err.mensaje}`);
    }
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

cargarProductos();