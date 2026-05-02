// ── EMPLEADOS ───────────────────────────────────────────
async function renderEmpleados() {
  appEl.innerHTML = '<div class="fade-in"><div class="page-header"><h1>👨‍💼 Empleados</h1><button class="btn btn-primary" onclick="modalNuevoEmpleado()">+ Nuevo Empleado</button></div><div id="empleados-content">Cargando...</div></div>';
  try {
    const data = await api.getEmpleados();
    const rows = data.map(e => ({
      data: e,
      cells: [e.dpi, e.nombre, e.puesto, e.departamento, e.sucursal, `<span class="badge ${e.estado==='activo'?'badge-success':'badge-warning'}">${e.estado}</span>`, formatQ(e.sueldo)]
    }));
    document.getElementById('empleados-content').innerHTML = crudTable(
      ['DPI', 'Nombre', 'Puesto', 'Departamento', 'Sucursal', 'Estado', 'Sueldo'], rows,
      (e) => `<button class="btn btn-sm btn-outline" onclick="modalEditarEmpleado('${e.dpi}')">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarEmpleado('${e.dpi}')">🗑</button>`
    );
  } catch (err) { document.getElementById('empleados-content').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

async function modalNuevoEmpleado() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const sucursales = await api.getSucursales();
    // Para simplificar la demo, asumo IDs del 1 al 17 como los que están en el seed.
    let sucOpts = sucursales.map(s => `<option value="${s.id_sucursal}">${s.direccion}</option>`).join('');
    
    openModal('Nuevo Empleado', `
      <div class="form-row">
        <div class="form-group"><label>DPI *</label><input id="ne-dpi"></div>
        <div class="form-group"><label>Nombre *</label><input id="ne-nombre"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Teléfono *</label><input id="ne-tel"></div>
        <div class="form-group"><label>Correo *</label><input id="ne-correo" type="email"></div>
      </div>
      <div class="form-group"><label>Dirección *</label><input id="ne-dir"></div>
      <div class="form-row">
        <div class="form-group"><label>Puesto *</label><input id="ne-puesto"></div>
        <div class="form-group"><label>Sueldo *</label><input id="ne-sueldo" type="number" step="0.01"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Jornada *</label>
          <select id="ne-jornada"><option value="matutina">Matutina</option><option value="vespertina">Vespertina</option><option value="nocturna">Nocturna</option><option value="mixta">Mixta</option></select>
        </div>
        <div class="form-group"><label>Inicio Contrato *</label><input id="ne-inicio" type="date"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Sucursal *</label><select id="ne-sucursal">${sucOpts}</select></div>
        <div class="form-group"><label>ID Depto * (1-17)</label><input id="ne-depto" type="number" value="1"></div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="crearEmpleado()">Crear Empleado</button>
    `);
  } catch(e) { showToast(e.message, 'error'); }
}

async function crearEmpleado() {
  try {
    await api.createEmpleado({
      dpi: document.getElementById('ne-dpi').value,
      nombre: document.getElementById('ne-nombre').value,
      telefono: document.getElementById('ne-tel').value,
      direccion: document.getElementById('ne-dir').value,
      correo: document.getElementById('ne-correo').value,
      puesto: document.getElementById('ne-puesto').value,
      sueldo: parseFloat(document.getElementById('ne-sueldo').value),
      jornada: document.getElementById('ne-jornada').value,
      inicio_contrato: document.getElementById('ne-inicio').value,
      id_sucursal: parseInt(document.getElementById('ne-sucursal').value),
      id_departamento: parseInt(document.getElementById('ne-depto').value)
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Empleado creado', 'success');
    renderEmpleados();
  } catch (err) { showToast(err.message, 'error'); }
}

async function modalEditarEmpleado(dpi) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const e = await api.getEmpleado(dpi);
    const sucursales = await api.getSucursales();
    let sucOpts = sucursales.map(s => `<option value="${s.id_sucursal}" ${s.id_sucursal===e.id_sucursal?'selected':''}>${s.direccion}</option>`).join('');
    
    openModal('Editar Empleado', `
      <div class="form-row">
        <div class="form-group"><label>Nombre</label><input id="ee-nombre" value="${e.nombre}"></div>
        <div class="form-group"><label>Teléfono</label><input id="ee-tel" value="${e.telefono}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Estado</label>
          <select id="ee-estado">
            <option value="activo" ${e.estado==='activo'?'selected':''}>Activo</option>
            <option value="jubilado" ${e.estado==='jubilado'?'selected':''}>Jubilado</option>
            <option value="embarazada" ${e.estado==='embarazada'?'selected':''}>Embarazada</option>
            <option value="despedido" ${e.estado==='despedido'?'selected':''}>Despedido</option>
            <option value="trasladado" ${e.estado==='trasladado'?'selected':''}>Trasladado</option>
          </select>
        </div>
        <div class="form-group"><label>Sueldo</label><input id="ee-sueldo" type="number" step="0.01" value="${e.sueldo}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Sucursal</label><select id="ee-sucursal">${sucOpts}</select></div>
        <div class="form-group"><label>ID Depto</label><input id="ee-depto" type="number" value="${e.id_departamento}"></div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="editarEmpleado('${dpi}')">Guardar</button>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

async function editarEmpleado(dpi) {
  try {
    await api.updateEmpleado(dpi, {
      nombre: document.getElementById('ee-nombre').value,
      telefono: document.getElementById('ee-tel').value,
      estado: document.getElementById('ee-estado').value,
      sueldo: parseFloat(document.getElementById('ee-sueldo').value),
      id_sucursal: parseInt(document.getElementById('ee-sucursal').value),
      id_departamento: parseInt(document.getElementById('ee-depto').value)
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Empleado actualizado', 'success');
    renderEmpleados();
  } catch (err) { showToast(err.message, 'error'); }
}

async function eliminarEmpleado(dpi) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  if (!confirm('¿Eliminar este empleado?')) return;
  try {
    await api.deleteEmpleado(dpi);
    showToast('Empleado eliminado', 'success');
    renderEmpleados();
  } catch (err) { showToast(err.message, 'error'); }
}
