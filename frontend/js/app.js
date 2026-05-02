// ============================================================
// APP.JS — SPA Router + Views
// ============================================================

const appEl = document.getElementById('app');

function updateNav(route) {
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('data-route') === route);
  });
  const u = getUsuario();
  const authEl = document.getElementById('nav-auth');
  if (u) {
    authEl.innerHTML = `<span style="color:var(--text-secondary);font-size:0.85rem">👤 ${u.nombre}</span>
      <button class="btn btn-outline btn-sm" onclick="doLogout()">Salir</button>`;
  } else {
    authEl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="location.hash='#/login'">Iniciar Sesión</button>`;
  }
}

async function doLogout() {
  // [COMENTADO - ya no se revoca token JWT en el servidor]
  // try { await api.logout(); } catch (e) { }
  clearAuth();
  showToast('Sesión cerrada', 'info');
  window.location.hash = '#/';
}

// Modal helper
function openModal(title, contentHTML) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal"><div class="modal-header"><h2>${title}</h2>
    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button></div>
    <div class="modal-body">${contentHTML}</div></div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  return overlay;
}

// ── ROUTES ──────────────────────────────────────────────
const routes = {
  '/': renderHome,
  '/login': renderLogin,
  '/productos': renderProductos,
  '/clientes': renderClientes,
  '/empleados': renderEmpleados,
  '/proveedores': renderProveedores,
  '/categorias': renderCategorias,
  '/sucursales': renderSucursales,
  '/inventario': renderInventario,
  '/ventas': renderVentas,
  '/facturas': renderFacturas,
  '/devoluciones': renderDevoluciones,
  '/reportes': renderReportes,
};

function router() {
  const hash = window.location.hash.slice(1) || '/';
  const route = hash.split('?')[0];
  updateNav(route);
  const handler = routes[route];
  if (handler) {
    handler();
  } else {
    appEl.innerHTML = '<div class="hero"><h1>404</h1><p>Página no encontrada</p></div>';
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// ── HOME ────────────────────────────────────────────────
function renderHome() {
  appEl.innerHTML = `<div class="hero slide-up">
    <h1>🛒 CEMACO 2.0 XDGT</h1>
    <p>Sistema integral de gestión de inventario y ventas para retail. Administra productos, clientes, empleados, facturación y reportes en tiempo real.</p>
    <div class="features-grid">
      <div class="card feature-card"><div class="icon">📦</div><h3>Inventario</h3><p>Control de stock por sucursal en tiempo real</p></div>
      <div class="card feature-card"><div class="icon">🧾</div><h3>Facturación</h3><p>Registro de ventas con transacciones seguras</p></div>
      <div class="card feature-card"><div class="icon">📊</div><h3>Reportes</h3><p>Análisis de ventas, rankings y exportar CSV</p></div>
      <div class="card feature-card"><div class="icon">👥</div><h3>Gestión</h3><p>Clientes, empleados y proveedores</p></div>
      <div class="card feature-card"><div class="icon">🔒</div><h3>Seguridad</h3><p>Autenticación JWT con roles</p></div>
      <div class="card feature-card"><div class="icon">🔄</div><h3>Devoluciones</h3><p>Garantías y seguimiento de casos</p></div>
    </div></div>`;
}

// ── LOGIN ───────────────────────────────────────────────
function renderLogin() {
  appEl.innerHTML = `<div class="login-container slide-up">
    <div class="card"><h2 style="text-align:center;margin-bottom:1.5rem">Iniciar Sesión</h2>
    <div class="form-group"><label>DPI</label><input id="login-dpi" placeholder="Ej: 1001200010033"></div>
    <div class="form-group"><label>Contraseña</label><input id="login-pass" type="password" placeholder="••••••••"></div>
    <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="handleLogin()">Ingresar</button>
    <p style="text-align:center;margin-top:1rem;color:var(--text-muted);font-size:0.8rem">Demo: DPI <code>1001200010033</code> / Pass <code>password123</code></p>
    </div></div>`;
}

async function handleLogin() {
  const dpi = document.getElementById('login-dpi').value;
  const password = document.getElementById('login-pass').value;
  if (!dpi || !password) return showToast('Completa todos los campos', 'error');
  try {
    const data = await api.login({ dpi, password });
    // [COMENTADO - ya no guardamos token JWT]
    // setAuth(data.token, data.usuario);
    setAuth(null, data.usuario);  // Solo guardamos el usuario
    showToast(`Bienvenido, ${data.usuario.nombre}!`, 'success');
    window.location.hash = '#/';
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── CRUD HELPER ─────────────────────────────────────────
function crudTable(headers, rows, actions) {
  if (rows.length === 0) return '<p style="color:var(--text-muted);text-align:center;padding:2rem">No hay datos disponibles</p>';
  let html = '<div class="table-wrapper"><table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  if (actions) html += '<th>Acciones</th>';
  html += '</tr></thead><tbody>';
  rows.forEach(r => {
    html += '<tr>';
    r.cells.forEach(c => html += `<td>${c}</td>`);
    if (actions) html += `<td>${actions(r.data)}</td>`;
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}
