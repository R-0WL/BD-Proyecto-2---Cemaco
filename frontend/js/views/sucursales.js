// ── SUCURSALES ──────────────────────────────────────────
async function renderSucursales() {
  appEl.innerHTML = '<div class="fade-in"><div class="page-header"><h1>🏪 Sucursales y Bodegas</h1><button class="btn btn-primary" onclick="modalNuevaSucursal()">+ Nueva Sucursal</button></div><div id="sucursales-content">Cargando...</div></div>';
  try {
    const data = await api.getSucursales();
    const rows = data.map(s => ({
      data: s,
      cells: [s.id_sucursal, s.direccion, s.telefono, `<span class="badge ${s.tipo === 'bodega' ? 'badge-purple' : 'badge-info'}">${s.tipo}</span>`, `${s.capacidad_usada}%`]
    }));
    document.getElementById('sucursales-content').innerHTML = crudTable(
      ['ID', 'Dirección', 'Teléfono', 'Tipo', 'Capacidad Usada'], rows,
      (s) => `<button class="btn btn-sm btn-outline" onclick="verDetalleSucursal(${s.id_sucursal})">👁 Ver Empleados</button>`
    );
  } catch (err) { document.getElementById('sucursales-content').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

function modalNuevaSucursal() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Nueva Sucursal', `
    <div class="form-group"><label>Dirección *</label><input id="nsu-dir"></div>
    <div class="form-row">
      <div class="form-group"><label>Teléfono *</label><input id="nsu-tel"></div>
      <div class="form-group"><label>Tipo *</label>
        <select id="nsu-tipo"><option value="tienda">CEMACO 2.0 XD</option><option value="bodega">Bodega</option></select>
      </div>
    </div>
    <div class="form-group"><label>Capacidad Usada (%)</label><input id="nsu-cap" type="number" step="0.1" min="0" max="100" value="0"></div>
    <button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="crearSucursal()">Crear Sucursal</button>
  `);
}

async function crearSucursal() {
  try {
    await api.createSucursal({ // Note: The API wrapper might be missing createSucursal, we can add it or just use apiFetch directly here if needed, but assuming it exists or we add it to api.js
      direccion: document.getElementById('nsu-dir').value,
      telefono: document.getElementById('nsu-tel').value,
      tipo: document.getElementById('nsu-tipo').value,
      capacidad_usada: parseFloat(document.getElementById('nsu-cap').value) || 0
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Sucursal creada', 'success');
    renderSucursales();
  } catch (err) { showToast(err.message, 'error'); }
}

async function verDetalleSucursal(id) {
  try {
    const s = await api.getSucursal(id);
    let empHtml = s.empleados.map(e => `<tr><td>${e.nombre}</td><td>${e.puesto}</td><td>${e.departamento}</td></tr>`).join('');
    openModal(`Sucursal #${s.id_sucursal}`, `
      <p><strong>Dirección:</strong> ${s.direccion}</p>
      <p><strong>Teléfono:</strong> ${s.telefono} | <strong>Tipo:</strong> ${s.tipo}</p>
      <h3 style="margin-top:1.5rem; margin-bottom:0.5rem">Empleados en esta sede</h3>
      <div class="table-wrapper"><table><thead><tr><th>Nombre</th><th>Puesto</th><th>Departamento</th></tr></thead><tbody>${empHtml || '<tr><td colspan="3">Sin empleados asignados</td></tr>'}</tbody></table></div>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

// Add missing function to api.js dynamically to avoid full file rewrite
if (!api.createSucursal) {
  api.createSucursal = (body) => apiFetch('/sucursales', { method: 'POST', body: JSON.stringify(body) });
}
