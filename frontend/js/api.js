// ============================================================
// API.JS — Fetch wrapper para comunicación con el backend
// ============================================================

const API_BASE = '/api';

// ── Sesión simple (sin JWT) ──────────────────────────────
// [COMENTADO - manejo de token JWT desactivado]
// function getToken() {
//   return localStorage.getItem('token');
// }

function setAuth(token, usuario) {
  // [COMENTADO - ya no almacenamos token JWT]
  // localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function clearAuth() {
  // [COMENTADO - ya no borramos token JWT]
  // localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

function getUsuario() {
  const u = localStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  // [COMENTADO - ya no verificamos token]
  // return !!getToken();
  return !!getUsuario();
}

async function apiFetch(endpoint, options = {}) {
  // [COMENTADO - ya no adjuntamos Bearer token en cabeceras]
  // const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  // [COMENTADO - sin Authorization header]
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // [COMENTADO - sin manejo de 401 por token expirado]
  // if (res.status === 401) {
  //   clearAuth();
  //   showToast('Sesión expirada. Inicia sesión nuevamente.', 'error');
  //   window.location.hash = '#/login';
  //   throw new Error('No autorizado');
  // }

  // CSV download
  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

const api = {
  // Auth
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  logout:   ()     => apiFetch('/auth/logout',   { method: 'POST' }),
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Productos
  getProductos:    ()          => apiFetch('/productos'),
  getProducto:     (id)        => apiFetch(`/productos/${id}`),
  createProducto:  (body)      => apiFetch('/productos',     { method: 'POST', body: JSON.stringify(body) }),
  updateProducto:  (id, body)  => apiFetch(`/productos/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteProducto:  (id)        => apiFetch(`/productos/${id}`, { method: 'DELETE' }),
  getPrecios:      (id)        => apiFetch(`/productos/${id}/precios`),

  // Clientes
  getClientes:    ()           => apiFetch('/clientes'),
  getCliente:     (dpi)        => apiFetch(`/clientes/${dpi}`),
  createCliente:  (body)       => apiFetch('/clientes',      { method: 'POST', body: JSON.stringify(body) }),
  updateCliente:  (dpi, body)  => apiFetch(`/clientes/${dpi}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteCliente:  (dpi)        => apiFetch(`/clientes/${dpi}`, { method: 'DELETE' }),

  // Empleados
  getEmpleados:   ()           => apiFetch('/empleados'),
  getEmpleado:    (dpi)        => apiFetch(`/empleados/${dpi}`),
  createEmpleado: (body)       => apiFetch('/empleados',     { method: 'POST', body: JSON.stringify(body) }),
  updateEmpleado: (dpi, body)  => apiFetch(`/empleados/${dpi}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteEmpleado: (dpi)        => apiFetch(`/empleados/${dpi}`, { method: 'DELETE' }),

  // Proveedores
  getProveedores:   ()          => apiFetch('/proveedores'),
  createProveedor:  (body)      => apiFetch('/proveedores',    { method: 'POST', body: JSON.stringify(body) }),
  updateProveedor:  (nit, body) => apiFetch(`/proveedores/${nit}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteProveedor:  (nit)       => apiFetch(`/proveedores/${nit}`, { method: 'DELETE' }),

  // Categorías
  getCategorias:   ()          => apiFetch('/categorias'),
  createCategoria: (body)      => apiFetch('/categorias',    { method: 'POST', body: JSON.stringify(body) }),
  updateCategoria: (id, body)  => apiFetch(`/categorias/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteCategoria: (id)        => apiFetch(`/categorias/${id}`, { method: 'DELETE' }),

  // Sucursales
  getSucursales: ()            => apiFetch('/sucursales'),
  getSucursal:   (id)          => apiFetch(`/sucursales/${id}`),

  // Facturas
  getFacturas:   ()            => apiFetch('/facturas'),
  getFactura:    (id)          => apiFetch(`/facturas/${id}`),
  createFactura: (body)        => apiFetch('/facturas',      { method: 'POST', body: JSON.stringify(body) }),

  // Devoluciones
  getDevoluciones:    ()          => apiFetch('/devoluciones'),
  createDevolucion:   (body)      => apiFetch('/devoluciones',  { method: 'POST', body: JSON.stringify(body) }),
  resolverDevolucion: (id, body)  => apiFetch(`/devoluciones/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Inventario
  getInventario:          () => apiFetch('/inventario'),
  getInventarioPorSucursal: () => apiFetch('/inventario/por-sucursal'),

  // Reportes
  getVentasEmpleado:      () => apiFetch('/reportes/ventas-empleado'),
  getTopProductos:        () => apiFetch('/reportes/top-productos'),
  getVentasMensual:       () => apiFetch('/reportes/ventas-mensual'),
  getStockBajo:           () => apiFetch('/reportes/stock-bajo'),
  getMejoresClientes:     () => apiFetch('/reportes/mejores-clientes'),
  getCategoriasPopulares: () => apiFetch('/reportes/categorias-populares'),
  exportCSV:              () => apiFetch('/reportes/export/csv'),

  // Reseñas
  getResenas:    (idProducto) => apiFetch(`/resenas/producto/${idProducto}`),
  createResena:  (body)       => apiFetch('/resenas', { method: 'POST', body: JSON.stringify(body) }),
};

// Toast notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Utility: format currency
function formatQ(amount) {
  return `Q${parseFloat(amount).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
}

// Utility: format date
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' });
}
