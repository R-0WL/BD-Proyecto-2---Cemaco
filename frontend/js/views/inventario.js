// ── INVENTARIO ──────────────────────────────────────────
async function renderInventario() {
  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>📦 Control de Inventario</h1>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3 style="margin-bottom: 1rem">Stock Total Consolidado (VIEW)</h3>
          <div id="inv-total">Cargando...</div>
        </div>
        <div class="card">
          <h3 style="margin-bottom: 1rem">Distribución por Sucursal</h3>
          <div id="inv-sucursales">Cargando...</div>
        </div>
      </div>
    </div>
  `;

  try {
    const [total, sucursales] = await Promise.all([
      api.getInventario(),
      api.getInventarioPorSucursal()
    ]);

    // Render Total
    const rowsTotal = total.map(t => ({
      data: t,
      cells: [t.producto, t.marca, `<span class="badge ${t.stock_general < 15 ? 'badge-danger' : 'badge-success'}">${t.stock_general}</span>`, t.stock_distribuido, t.sucursales_con_stock]
    }));
    document.getElementById('inv-total').innerHTML = crudTable(['Producto', 'Marca', 'Stock Gral.', 'En Sucursales', 'Cant. Sucursales'], rowsTotal);

    // Render Sucursales
    const rowsSuc = sucursales.map(s => ({
      data: s,
      cells: [`<span class="badge badge-purple">${s.tipo}</span> ${s.sucursal}`, s.producto, s.stock_especifico, s.ubicacion || 'N/A']
    }));
    document.getElementById('inv-sucursales').innerHTML = crudTable(['Sucursal', 'Producto', 'Stock Local', 'Ubicación'], rowsSuc);

  } catch (err) {
    showToast('Error cargando inventario: ' + err.message, 'error');
  }
}
