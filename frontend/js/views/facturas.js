// ── FACTURAS ─────────────────────────────────────────────
async function renderFacturas() {
  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>🧾 Historial de Facturas</h1>
      </div>
      <!-- Resumen cards -->
      <div id="facturas-resumen" style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem"></div>
      <!-- Tabla -->
      <div class="card">
        <h3 style="margin-bottom:1rem">Todas las Facturas
          <span class="badge badge-info" style="font-size:0.7rem;margin-left:0.5rem">JOIN múltiple</span>
        </h3>
        <div id="facturas-content">Cargando...</div>
      </div>
    </div>
  `;

  try {
    const data = await api.getFacturas();

    // Resumen estadístico
    if (data.length > 0) {
      const total = data.reduce((s, f) => s + parseFloat(f.total_pagado), 0);
      const max   = Math.max(...data.map(f => parseFloat(f.total_pagado)));
      document.getElementById('facturas-resumen').innerHTML = `
        <div class="card" style="flex:1;min-width:160px;text-align:center;padding:1rem">
          <div style="font-size:1.8rem;font-weight:700;color:var(--primary)">${data.length}</div>
          <div style="color:var(--text-muted);font-size:0.85rem">Total Facturas</div>
        </div>
        <div class="card" style="flex:1;min-width:160px;text-align:center;padding:1rem">
          <div style="font-size:1.5rem;font-weight:700;color:var(--success)">${formatQ(total)}</div>
          <div style="color:var(--text-muted);font-size:0.85rem">Ingreso Total</div>
        </div>
        <div class="card" style="flex:1;min-width:160px;text-align:center;padding:1rem">
          <div style="font-size:1.5rem;font-weight:700;color:var(--warning)">${formatQ(max)}</div>
          <div style="color:var(--text-muted);font-size:0.85rem">Factura Más Alta</div>
        </div>
        <div class="card" style="flex:1;min-width:160px;text-align:center;padding:1rem">
          <div style="font-size:1.5rem;font-weight:700;color:var(--info)">${formatQ(total / data.length)}</div>
          <div style="color:var(--text-muted);font-size:0.85rem">Promedio por Factura</div>
        </div>
      `;
    }

    // Tabla con JOIN múltiple: cliente + empleado + sucursal
    const metodoBadge = { efectivo: 'badge-success', tarjeta_credito: 'badge-info', tarjeta_debito: 'badge-purple', transferencia: 'badge-warning' };
    const rows = data.map(f => ({
      data: f,
      cells: [
        `<strong>#${f.id_factura}</strong>`,
        formatDate(f.fecha),
        f.cliente,
        f.empleado,
        f.sucursal,
        `<span class="badge ${metodoBadge[f.metodo_pago] || 'badge-info'}">${f.metodo_pago.replace('_', ' ')}</span>`,
        `<strong>${formatQ(f.total_pagado)}</strong>`,
        f.fecha_fin_garantia
          ? `<span class="badge ${new Date(f.fecha_fin_garantia) >= new Date() ? 'badge-success' : 'badge-danger'}">${formatDate(f.fecha_fin_garantia)}</span>`
          : '—'
      ]
    }));
    document.getElementById('facturas-content').innerHTML = crudTable(
      ['# Factura', 'Fecha', 'Cliente', 'Atendió', 'Sucursal', 'Método Pago', 'Total', 'Garantía hasta'], rows,
      (f) => `<button class="btn btn-sm btn-outline" onclick="verDetalleFactura(${f.id_factura})">Ver detalle</button>`
    );

  } catch (err) {
    document.getElementById('facturas-content').innerHTML =
      `<p style="color:var(--danger)">${err.message}</p>`;
  }
}

async function verDetalleFactura(id) {
  try {
    const f = await api.getFactura(id);
    const itemsHtml = f.detalle.map(d => `
      <tr>
        <td>${d.producto}</td>
        <td>${d.marca}</td>
        <td>${d.cantidad_vendida}</td>
        <td>${formatQ(d.precio_del_momento)}</td>
        <td><strong>${formatQ(d.total_producto)}</strong></td>
      </tr>
    `).join('');

    openModal(`Factura #${id}`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
        <div>
          <p><span style="color:var(--text-muted)">Cliente:</span> <strong>${f.cliente}</strong></p>
          <p><span style="color:var(--text-muted)">Empleado:</span> ${f.empleado}</p>
        </div>
        <div>
          <p><span style="color:var(--text-muted)">Fecha:</span> ${formatDate(f.fecha)}</p>
          <p><span style="color:var(--text-muted)">Método pago:</span> ${f.metodo_pago.replace('_', ' ')}</p>
        </div>
      </div>

      <h4 style="margin-bottom:0.5rem">Detalle de productos</h4>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Producto</th><th>Marca</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>

      <div style="text-align:right;margin-top:1rem;font-size:1.2rem">
        Total pagado: <strong style="color:var(--success)">${formatQ(f.total_pagado)}</strong>
      </div>
      ${f.fecha_fin_garantia ? `
        <p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-muted)">
          Garantía vigente hasta: <strong>${formatDate(f.fecha_fin_garantia)}</strong>
        </p>` : ''}
    `);
  } catch (err) { showToast(err.message, 'error'); }
}
