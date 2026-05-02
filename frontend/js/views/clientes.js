// ── CLIENTES ────────────────────────────────────────────
async function renderClientes() {
  appEl.innerHTML = '<div class="fade-in"><div class="page-header"><h1>👥 Clientes</h1><button class="btn btn-primary" onclick="modalNuevoCliente()">+ Nuevo Cliente</button></div><div id="clientes-content">Cargando...</div></div>';
  try {
    const data = await api.getClientes();
    const rows = data.map(c => ({
      data: c,
      cells: [c.dpi, c.nombre, c.telefono, c.correo, c.nit || '—']
    }));
    document.getElementById('clientes-content').innerHTML = crudTable(
      ['DPI','Nombre','Teléfono','Correo','NIT'], rows,
      (c) => `<button class="btn btn-sm btn-outline" onclick="modalEditarCliente('${c.dpi}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarCliente('${c.dpi}')">🗑</button>`
    );
  } catch (err) { document.getElementById('clientes-content').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

function modalNuevoCliente() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Nuevo Cliente', `
    <div class="form-group"><label>DPI *</label><input id="nc-dpi"></div>
    <div class="form-group"><label>Nombre *</label><input id="nc-nombre"></div>
    <div class="form-row"><div class="form-group"><label>Teléfono *</label><input id="nc-tel"></div>
    <div class="form-group"><label>NIT</label><input id="nc-nit"></div></div>
    <div class="form-group"><label>Dirección *</label><input id="nc-dir"></div>
    <div class="form-group"><label>Correo *</label><input id="nc-correo" type="email"></div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem" onclick="crearCliente()">Crear Cliente</button>
  `);
}

async function crearCliente() {
  try {
    await api.createCliente({
      dpi: document.getElementById('nc-dpi').value,
      nombre: document.getElementById('nc-nombre').value,
      telefono: document.getElementById('nc-tel').value,
      direccion: document.getElementById('nc-dir').value,
      correo: document.getElementById('nc-correo').value,
      nit: document.getElementById('nc-nit').value || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Cliente creado', 'success');
    renderClientes();
  } catch (err) { showToast(err.message, 'error'); }
}

async function modalEditarCliente(dpi) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const c = await api.getCliente(dpi);
    openModal('Editar Cliente', `
      <div class="form-group"><label>Nombre</label><input id="ec-nombre" value="${c.nombre}"></div>
      <div class="form-row"><div class="form-group"><label>Teléfono</label><input id="ec-tel" value="${c.telefono}"></div>
      <div class="form-group"><label>NIT</label><input id="ec-nit" value="${c.nit || ''}"></div></div>
      <div class="form-group"><label>Dirección</label><input id="ec-dir" value="${c.direccion}"></div>
      <div class="form-group"><label>Correo</label><input id="ec-correo" value="${c.correo}"></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem" onclick="editarCliente('${dpi}')">Guardar</button>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

async function editarCliente(dpi) {
  try {
    await api.updateCliente(dpi, {
      nombre: document.getElementById('ec-nombre').value,
      telefono: document.getElementById('ec-tel').value,
      direccion: document.getElementById('ec-dir').value,
      correo: document.getElementById('ec-correo').value,
      nit: document.getElementById('ec-nit').value || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Cliente actualizado', 'success');
    renderClientes();
  } catch (err) { showToast(err.message, 'error'); }
}

async function eliminarCliente(dpi) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  if (!confirm('¿Eliminar este cliente?')) return;
  try {
    await api.deleteCliente(dpi);
    showToast('Cliente eliminado', 'success');
    renderClientes();
  } catch (err) { showToast(err.message, 'error'); }
}
