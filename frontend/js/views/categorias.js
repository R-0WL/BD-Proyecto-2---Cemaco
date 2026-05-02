// ── CATEGORÍAS ───────────────────────────────────────────
async function renderCategorias() {
  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>🏷️ Categorías</h1>
        <button class="btn btn-primary" onclick="modalNuevaCategoria()">+ Nueva Categoría</button>
      </div>
      <div id="categorias-content">Cargando...</div>
    </div>
  `;
  try {
    const data = await api.getCategorias();
    const rows = data.map(c => ({
      data: c,
      cells: [
        c.id_categoria,
        c.tipo_categoria,
        c.descripcion || '—',
        c.subtipo
          ? `<span class="badge badge-info">${c.subtipo.replace('_', ' ')}</span>`
          : '—'
      ]
    }));
    document.getElementById('categorias-content').innerHTML = crudTable(
      ['ID', 'Tipo de Categoría', 'Descripción', 'Subtipo Tecnología'], rows,
      (c) => `
        <button class="btn btn-sm btn-outline" onclick="modalEditarCategoria(${c.id_categoria})">✏️</button>
        <button class="btn btn-sm btn-danger"  onclick="eliminarCategoria(${c.id_categoria})">🗑</button>
      `
    );
  } catch (err) {
    document.getElementById('categorias-content').innerHTML =
      `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

function modalNuevaCategoria() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Nueva Categoría', `
    <div class="form-group">
      <label>Tipo de Categoría *</label>
      <input id="nc-tipo" placeholder="Ej: tecnología, ropa, comida…">
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea id="nc-desc" rows="2" placeholder="Descripción opcional"></textarea>
    </div>
    <div class="form-group">
      <label>Subtipo Tecnología (solo si aplica)</label>
      <select id="nc-subtipo">
        <option value="">— No aplica —</option>
        <option value="telefonos">Teléfonos</option>
        <option value="monitores_tv">Monitores y TV's</option>
        <option value="computadoras">Computadoras</option>
        <option value="tablets">Tablets</option>
      </select>
    </div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem"
      onclick="crearCategoria()">Crear Categoría</button>
  `);
}

async function crearCategoria() {
  try {
    const subtipo = document.getElementById('nc-subtipo').value;
    await api.createCategoria({
      tipo_categoria: document.getElementById('nc-tipo').value,
      descripcion:    document.getElementById('nc-desc').value || null,
      subtipo:        subtipo || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Categoría creada', 'success');
    renderCategorias();
  } catch (err) { showToast(err.message, 'error'); }
}

async function modalEditarCategoria(id) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const cats = await api.getCategorias();
    const c = cats.find(x => x.id_categoria === id);
    if (!c) return showToast('Categoría no encontrada', 'error');
    openModal('Editar Categoría', `
      <div class="form-group">
        <label>Tipo de Categoría</label>
        <input id="ec-tipo" value="${c.tipo_categoria}">
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea id="ec-desc" rows="2">${c.descripcion || ''}</textarea>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem"
        onclick="editarCategoria(${id})">Guardar Cambios</button>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

async function editarCategoria(id) {
  try {
    await api.updateCategoria(id, {
      tipo_categoria: document.getElementById('ec-tipo').value,
      descripcion:    document.getElementById('ec-desc').value || null,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Categoría actualizada', 'success');
    renderCategorias();
  } catch (err) { showToast(err.message, 'error'); }
}

async function eliminarCategoria(id) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  if (!confirm('¿Eliminar esta categoría? Se desvinculará de los productos.')) return;
  try {
    await api.deleteCategoria(id);
    showToast('Categoría eliminada', 'success');
    renderCategorias();
  } catch (err) { showToast(err.message, 'error'); }
}
