// ── DEVOLUCIONES ─────────────────────────────────────────
async function renderDevoluciones() {
  appEl.innerHTML = '<div class="fade-in"><div class="page-header"><h1>🔄 Devoluciones y Garantías</h1><button class="btn btn-primary" onclick="modalNuevaDevolucion()">Registrar Devolución</button></div><div id="devoluciones-content">Cargando...</div></div>';
  try {
    const data = await api.getDevoluciones();
    const rows = data.map(d => {
      let estadoHtml = '';
      if (!d.resultado) estadoHtml = `<span class="badge badge-warning">En Proceso</span>`;
      else if (d.resultado === 'reparado') estadoHtml = `<span class="badge badge-info">Reparado</span>`;
      else if (d.resultado === 'reemplazado') estadoHtml = `<span class="badge badge-success">Reemplazado</span>`;
      else if (d.resultado === 'remunerado') estadoHtml = `<span class="badge badge-purple">Remunerado</span>`;

      return {
        data: d,
        cells: [d.id_devolucion, formatDate(d.fecha_declarada), `Factura #${d.id_factura}`, d.cliente, d.motivo, estadoHtml, d.estado_garantia]
      };
    });
    document.getElementById('devoluciones-content').innerHTML = crudTable(
      ['ID', 'Fecha Reclamo', 'Factura', 'Cliente', 'Motivo', 'Estado', 'Garantía al Comprar'], rows,
      (d) => !d.resultado ? `<button class="btn btn-sm btn-outline" onclick="modalResolverDevolucion(${d.id_devolucion})">Resolver</button>` : '—'
    );
  } catch (err) { document.getElementById('devoluciones-content').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

function modalNuevaDevolucion() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Registrar Devolución', `
    <div class="form-group"><label>ID Factura *</label><input type="number" id="nd-factura"></div>
    <div class="form-group"><label>Motivo *</label><input id="nd-motivo" placeholder="Ej: Defecto de fábrica"></div>
    <div class="form-group"><label>Descripción del Problema *</label><textarea id="nd-desc" rows="3"></textarea></div>
    <button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="crearDevolucion()">Verificar y Registrar</button>
  `);
}

async function crearDevolucion() {
  try {
    await api.createDevolucion({
      id_factura: parseInt(document.getElementById('nd-factura').value),
      motivo: document.getElementById('nd-motivo').value,
      descripcion_problema: document.getElementById('nd-desc').value
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Devolución registrada correctamente', 'success');
    renderDevoluciones();
  } catch (err) { showToast(err.message, 'error'); }
}

function modalResolverDevolucion(id) {
  openModal('Resolver Devolución', `
    <p style="margin-bottom:1rem">Seleccione el resultado de la gestión:</p>
    <div class="form-group">
      <select id="rd-resultado">
        <option value="reparado">Reparado (Garantía Cubierta)</option>
        <option value="reemplazado">Reemplazado por Nuevo</option>
        <option value="remunerado">Dinero Devuelto (Remunerado)</option>
      </select>
    </div>
    <button class="btn btn-success" style="width:100%;margin-top:1rem" onclick="resolverDevolucion(${id})">Guardar Resolución</button>
  `);
}

async function resolverDevolucion(id) {
  try {
    await api.resolverDevolucion(id, { resultado: document.getElementById('rd-resultado').value });
    document.querySelector('.modal-overlay').remove();
    showToast('Devolución resuelta', 'success');
    renderDevoluciones();
  } catch (err) { showToast(err.message, 'error'); }
}
