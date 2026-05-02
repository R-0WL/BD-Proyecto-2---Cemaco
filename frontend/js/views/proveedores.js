// ── PROVEEDORES ──────────────────────────────────────────
async function renderProveedores() {
  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>🏭 Proveedores</h1>
        <button class="btn btn-primary" onclick="modalNuevoProveedor()">+ Nuevo Proveedor</button>
      </div>
      <div id="proveedores-content">Cargando...</div>
    </div>
  `;
  try {
    const data = await api.getProveedores();
    const rows = data.map(p => ({
      data: p,
      cells: [
        p.nit_empresa,
        p.nombre_empresa,
        p.correo,
        p.tel_principal,
        p.tel_secundario || '—',
        p.sitio_web
          ? `<a href="${p.sitio_web}" target="_blank" style="color:var(--accent)">🔗 Ver</a>`
          : '—'
      ]
    }));
    document.getElementById('proveedores-content').innerHTML = crudTable(
      ['NIT', 'Empresa', 'Correo', 'Tel. Principal', 'Tel. Secundario', 'Sitio Web'], rows,
      (p) => `
        <button class="btn btn-sm btn-outline" onclick="modalEditarProveedor('${p.nit_empresa}')">✏️</button>
        <button class="btn btn-sm btn-danger"  onclick="eliminarProveedor('${p.nit_empresa}')">🗑</button>
      `
    );
  } catch (err) {
    document.getElementById('proveedores-content').innerHTML =
      `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function modalNuevoProveedor() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Nuevo Proveedor', `
    <div class="form-row">
      <div class="form-group">
        <label>NIT Empresa *</label>
        <input id="np-nit" placeholder="Ej: 1234567-8">
      </div>
      <div class="form-group">
        <label>Nombre Empresa *</label>
        <input id="np-nombre" placeholder="Ej: Samsung Guatemala S.A.">
      </div>
    </div>
    <div class="form-group">
      <label>Dirección Principal *</label>
      <input id="np-dir" placeholder="Ej: Zona 10, Guatemala City">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Correo *</label>
        <input id="np-correo" type="email" placeholder="contacto@empresa.com">
      </div>
      <div class="form-group">
        <label>Sitio Web</label>
        <input id="np-web" placeholder="https://...">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Teléfono Principal *</label>
        <input id="np-tel1" placeholder="22223333">
      </div>
      <div class="form-group">
        <label>Teléfono Secundario</label>
        <input id="np-tel2" placeholder="55556666">
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem"
      onclick="crearProveedor()">Registrar Proveedor</button>
  `);
}

async function crearProveedor() {
  try {
    await api.createProveedor({
      nit_empresa:    document.getElementById('np-nit').value,
      nombre_empresa: document.getElementById('np-nombre').value,
      direccion:      document.getElementById('np-dir').value,
      correo:         document.getElementById('np-correo').value,
      sitio_web:      document.getElementById('np-web').value || null,
      tel_principal:  document.getElementById('np-tel1').value,
      tel_secundario: document.getElementById('np-tel2').value || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Proveedor registrado', 'success');
    renderProveedores();
  } catch (err) { showToast(err.message, 'error'); }
}

async function modalEditarProveedor(nit) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const proveedores = await api.getProveedores();
    const p = proveedores.find(x => x.nit_empresa === nit);
    if (!p) return showToast('Proveedor no encontrado', 'error');
    openModal('Editar Proveedor', `
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">NIT: <strong>${p.nit_empresa}</strong></p>
      <div class="form-group">
        <label>Nombre Empresa</label>
        <input id="ep-nombre" value="${p.nombre_empresa}">
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input id="ep-dir" value="${p.direccion}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Correo</label>
          <input id="ep-correo" value="${p.correo}">
        </div>
        <div class="form-group">
          <label>Sitio Web</label>
          <input id="ep-web" value="${p.sitio_web || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tel. Principal</label>
          <input id="ep-tel1" value="${p.tel_principal}">
        </div>
        <div class="form-group">
          <label>Tel. Secundario</label>
          <input id="ep-tel2" value="${p.tel_secundario || ''}">
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem"
        onclick="editarProveedor('${nit}')">Guardar Cambios</button>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

async function editarProveedor(nit) {
  try {
    await api.updateProveedor(nit, {
      nombre_empresa: document.getElementById('ep-nombre').value,
      direccion:      document.getElementById('ep-dir').value,
      correo:         document.getElementById('ep-correo').value,
      sitio_web:      document.getElementById('ep-web').value || null,
      tel_principal:  document.getElementById('ep-tel1').value,
      tel_secundario: document.getElementById('ep-tel2').value || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Proveedor actualizado', 'success');
    renderProveedores();
  } catch (err) { showToast(err.message, 'error'); }
}

async function eliminarProveedor(nit) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  if (!confirm('¿Eliminar este proveedor? Los productos asociados perderán su referencia.')) return;
  try {
    await api.deleteProveedor(nit);
    showToast('Proveedor eliminado', 'success');
    renderProveedores();
  } catch (err) { showToast(err.message, 'error'); }
}
