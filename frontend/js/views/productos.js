// ── PRODUCTOS ───────────────────────────────────────────
async function renderProductos() {
  appEl.innerHTML = '<div class="fade-in"><div class="page-header"><h1>📦 Productos</h1><button class="btn btn-primary" onclick="modalNuevoProducto()">+ Nuevo Producto</button></div><div id="productos-content">Cargando...</div></div>';
  try {
    const data = await api.getProductos();
    const rows = data.map(p => ({
      data: p,
      cells: [p.id_producto, p.nombre, p.marca, formatQ(p.precio_actual), p.stock_general,
              p.proveedor, `<span class="stars">${'★'.repeat(Math.round(p.rating_promedio))}${'☆'.repeat(5-Math.round(p.rating_promedio))}</span> (${p.total_resenas})`]
    }));
    document.getElementById('productos-content').innerHTML = crudTable(
      ['ID','Nombre','Marca','Precio','Stock','Proveedor','Rating'], rows,
      (p) => `<button class="btn btn-sm btn-outline" onclick="verProducto(${p.id_producto})">👁</button>
              <button class="btn btn-sm btn-outline" onclick="modalEditarProducto(${p.id_producto})">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id_producto})">🗑</button>`
    );
  } catch (err) { document.getElementById('productos-content').innerHTML = `<p style="color:var(--danger)">${err.message}</p>`; }
}

async function verProducto(id) {
  try {
    const p = await api.getProducto(id);
    const precios = await api.getPrecios(id);
    let sub = '';
    if (p.gamma) sub = `<span class="badge badge-purple">Tecnológico — ${p.gamma}</span>`;
    else if (p.talla) sub = `<span class="badge badge-info">Ropa — Talla ${p.talla}</span>`;
    else if (p.fecha_caducidad) sub = `<span class="badge badge-warning">Comida — Cad: ${formatDate(p.fecha_caducidad)}</span>`;

    let cats = p.categorias.map(c => `<span class="badge badge-info">${c.tipo_categoria}</span>`).join(' ');
    let precioHtml = precios.map(h => `<tr><td>${formatDate(h.fecha)}</td><td>${formatQ(h.precio)}</td></tr>`).join('');

    openModal(p.nombre, `
      <p><strong>Marca:</strong> ${p.marca} | <strong>Proveedor:</strong> ${p.proveedor}</p>
      <p><strong>Precio:</strong> ${formatQ(p.precio_actual)} | <strong>Stock:</strong> ${p.stock_general}</p>
      <p>${sub}</p><p><strong>Categorías:</strong> ${cats || 'Ninguna'}</p>
      <p>${p.descripcion || ''}</p>
      <h3 style="margin-top:1rem">Historial de Precios</h3>
      <div class="table-wrapper"><table><thead><tr><th>Fecha</th><th>Precio</th></tr></thead><tbody>${precioHtml || '<tr><td colspan="2">Sin historial</td></tr>'}</tbody></table></div>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

function modalNuevoProducto() {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  openModal('Nuevo Producto', `
    <div class="form-row"><div class="form-group"><label>Nombre *</label><input id="np-nombre"></div>
    <div class="form-group"><label>Marca *</label><input id="np-marca"></div></div>
    <div class="form-row"><div class="form-group"><label>Precio *</label><input id="np-precio" type="number" step="0.01"></div>
    <div class="form-group"><label>Stock</label><input id="np-stock" type="number" value="0"></div></div>
    <div class="form-group"><label>NIT Proveedor *</label><input id="np-prov"></div>
    <div class="form-group"><label>Descripción</label><textarea id="np-desc" rows="2"></textarea></div>
    <div class="form-group"><label>Tipo subclase</label><select id="np-tipo" onchange="toggleSubclase()">
      <option value="">Otros</option><option value="tecnologico">Tecnológico</option>
      <option value="ropa">Ropa</option><option value="comida">Comida</option></select></div>
    <div id="np-sub"></div>
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem" onclick="crearProducto()">Crear Producto</button>
  `);
}

function toggleSubclase() {
  const tipo = document.getElementById('np-tipo').value;
  const el = document.getElementById('np-sub');
  if (tipo === 'tecnologico') el.innerHTML = '<div class="form-group"><label>Gamma</label><input id="np-gamma"></div>';
  else if (tipo === 'ropa') el.innerHTML = '<div class="form-group"><label>Talla</label><input id="np-talla"></div>';
  else if (tipo === 'comida') el.innerHTML = '<div class="form-group"><label>Fecha Caducidad</label><input id="np-cad" type="date"></div>';
  else el.innerHTML = '';
}

async function crearProducto() {
  try {
    const body = {
      nombre: document.getElementById('np-nombre').value,
      marca: document.getElementById('np-marca').value,
      precio_actual: parseFloat(document.getElementById('np-precio').value),
      stock_general: parseInt(document.getElementById('np-stock').value) || 0,
      nit_proveedor: document.getElementById('np-prov').value,
      descripcion: document.getElementById('np-desc').value,
      tipo_subclase: document.getElementById('np-tipo').value,
      gamma: document.getElementById('np-gamma')?.value,
      talla: document.getElementById('np-talla')?.value,
      fecha_caducidad: document.getElementById('np-cad')?.value,
    };
    await api.createProducto(body);
    document.querySelector('.modal-overlay').remove();
    showToast('Producto creado exitosamente', 'success');
    renderProductos();
  } catch (err) { showToast(err.message, 'error'); }
}

async function modalEditarProducto(id) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  try {
    const p = await api.getProducto(id);
    openModal('Editar Producto', `
      <div class="form-row"><div class="form-group"><label>Nombre</label><input id="ep-nombre" value="${p.nombre}"></div>
      <div class="form-group"><label>Marca</label><input id="ep-marca" value="${p.marca}"></div></div>
      <div class="form-row"><div class="form-group"><label>Precio</label><input id="ep-precio" type="number" step="0.01" value="${p.precio_actual}"></div>
      <div class="form-group"><label>Stock</label><input id="ep-stock" type="number" value="${p.stock_general}"></div></div>
      <div class="form-group"><label>Descripción</label><textarea id="ep-desc" rows="2">${p.descripcion || ''}</textarea></div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:1rem" onclick="editarProducto(${id})">Guardar Cambios</button>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

async function editarProducto(id) {
  try {
    await api.updateProducto(id, {
      nombre: document.getElementById('ep-nombre').value,
      marca: document.getElementById('ep-marca').value,
      precio_actual: parseFloat(document.getElementById('ep-precio').value),
      stock_general: parseInt(document.getElementById('ep-stock').value),
      descripcion: document.getElementById('ep-desc').value,
    });
    document.querySelector('.modal-overlay').remove();
    showToast('Producto actualizado', 'success');
    renderProductos();
  } catch (err) { showToast(err.message, 'error'); }
}

async function eliminarProducto(id) {
  if (!isLoggedIn()) return showToast('Inicia sesión primero', 'error');
  if (!confirm('¿Eliminar este producto?')) return;
  try {
    await api.deleteProducto(id);
    showToast('Producto eliminado', 'success');
    renderProductos();
  } catch (err) { showToast(err.message, 'error'); }
}
