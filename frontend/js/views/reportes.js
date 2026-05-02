// ── REPORTES ─────────────────────────────────────────────
async function renderReportes() {
  appEl.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>📊 Reportes y Análisis</h1>
        <button class="btn btn-success" onclick="exportarCSV()" id="btn-export-csv">
          ⬇ Exportar Ventas CSV
        </button>
      </div>

      <!-- Tabs de reportes -->
      <div class="tab-bar" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem">
        <button class="btn btn-primary tab-btn" onclick="loadReporte('top-productos')" id="tab-top">🏆 Top Productos (CTE)</button>
        <button class="btn btn-outline tab-btn" onclick="loadReporte('ventas-mensual')" id="tab-mensual">📅 Ventas por Mes</button>
        <button class="btn btn-outline tab-btn" onclick="loadReporte('ventas-empleado')" id="tab-empleado">👔 Ventas Empleado (VIEW)</button>
        <button class="btn btn-outline tab-btn" onclick="loadReporte('stock-bajo')" id="tab-stock">⚠️ Stock Bajo (Subquery)</button>
        <button class="btn btn-outline tab-btn" onclick="loadReporte('mejores-clientes')" id="tab-clientes">⭐ Mejores Clientes (EXISTS)</button>
        <button class="btn btn-outline tab-btn" onclick="loadReporte('categorias-populares')" id="tab-cats">🏷️ Categorías (HAVING)</button>
      </div>

      <div id="reporte-container" class="card">
        <p style="color:var(--text-muted);text-align:center;padding:3rem">
          Selecciona un reporte arriba para visualizarlo.
        </p>
      </div>
    </div>
  `;

  // Cargar el reporte por defecto
  loadReporte('top-productos');
}

async function loadReporte(tipo) {
  // Actualizar estado visual de tabs
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('btn-primary'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.add('btn-outline'));
  const tabMap = {
    'top-productos': 'tab-top',
    'ventas-mensual': 'tab-mensual',
    'ventas-empleado': 'tab-empleado',
    'stock-bajo': 'tab-stock',
    'mejores-clientes': 'tab-clientes',
    'categorias-populares': 'tab-cats',
  };
  const activeTab = document.getElementById(tabMap[tipo]);
  if (activeTab) { activeTab.classList.remove('btn-outline'); activeTab.classList.add('btn-primary'); }

  const container = document.getElementById('reporte-container');
  container.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-muted)">Cargando reporte...</p>';

  try {
    switch (tipo) {
      case 'top-productos': {
        const data = await api.getTopProductos();
        const rows = data.map(p => ({
          data: p,
          cells: [
            `<span class="badge badge-purple">#${p.ranking}</span>`,
            p.nombre, p.marca,
            `<strong>${p.total_vendido}</strong> uds`,
            formatQ(p.ingreso_total),
            p.num_facturas
          ]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">🏆 Top 20 Productos más Vendidos
            <span class="badge badge-info" style="font-size:0.7rem;margin-left:0.5rem">CTE</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Consulta con <code>WITH ventas_producto AS (...)</code> y <code>RANK() OVER</code>
          </p>
          ${crudTable(['Ranking', 'Producto', 'Marca', 'Unidades Vendidas', 'Ingreso Total', '# Facturas'], rows)}
        `;
        break;
      }

      case 'ventas-mensual': {
        const data = await api.getVentasMensual();
        const rows = data.map(m => ({
          data: m,
          cells: [
            new Date(m.mes).toLocaleDateString('es-GT', { year: 'numeric', month: 'long' }),
            m.num_facturas,
            formatQ(m.total_vendido),
            formatQ(m.promedio_factura),
            formatQ(m.factura_max),
            formatQ(m.factura_min)
          ]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">📅 Ventas por Mes
            <span class="badge badge-info" style="font-size:0.7rem;margin-left:0.5rem">GROUP BY + HAVING + Agregaciones</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Usa <code>DATE_TRUNC</code>, <code>SUM</code>, <code>AVG</code>, <code>MAX</code>, <code>MIN</code> agrupado por mes
          </p>
          ${crudTable(['Mes', '# Facturas', 'Total Vendido', 'Promedio Factura', 'Máx. Factura', 'Mín. Factura'], rows)}
        `;
        break;
      }

      case 'ventas-empleado': {
        const data = await api.getVentasEmpleado();
        const rows = data.map(e => ({
          data: e,
          cells: [
            e.empleado, e.departamento, e.sucursal,
            e.total_facturas,
            formatQ(e.total_vendido),
            formatQ(e.promedio_por_factura),
            formatDate(e.ultima_venta)
          ]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">👔 Ventas por Empleado
            <span class="badge badge-success" style="font-size:0.7rem;margin-left:0.5rem">VIEW: vista_ventas_empleado</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Alimentado por <code>vista_ventas_empleado</code> — filtrado con <code>WHERE total_facturas &gt; 0</code>
          </p>
          ${crudTable(['Empleado', 'Departamento', 'Sucursal', '# Facturas', 'Total Vendido', 'Promedio', 'Última Venta'], rows)}
        `;
        break;
      }

      case 'stock-bajo': {
        const data = await api.getStockBajo();
        const rows = data.map(p => ({
          data: p,
          cells: [
            p.id_producto, p.nombre, p.marca,
            `<span class="badge badge-danger">${p.stock_general}</span>`,
            formatQ(p.precio_actual),
            p.proveedor
          ]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">⚠️ Productos con Stock Bajo (&lt; 15 unidades)
            <span class="badge badge-warning" style="font-size:0.7rem;margin-left:0.5rem">Subquery IN</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Usa <code>WHERE id_producto IN (SELECT id_producto FROM Producto WHERE stock_general &lt; 15)</code>
          </p>
          ${crudTable(['ID', 'Producto', 'Marca', 'Stock', 'Precio', 'Proveedor'], rows)}
        `;
        break;
      }

      case 'mejores-clientes': {
        const data = await api.getMejoresClientes();
        const rows = data.map(c => ({
          data: c,
          cells: [
            c.nombre, c.correo,
            c.total_compras,
            formatQ(c.total_gastado)
          ]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">⭐ Mejores Clientes (2+ compras)
            <span class="badge badge-info" style="font-size:0.7rem;margin-left:0.5rem">Subquery correlacionado EXISTS</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Usa <code>WHERE EXISTS (SELECT 1 FROM Factura f2 WHERE ... HAVING COUNT(*) &gt;= 2)</code>
          </p>
          ${crudTable(['Cliente', 'Correo', '# Compras', 'Total Gastado'], rows)}
        `;
        break;
      }

      case 'categorias-populares': {
        const data = await api.getCategoriasPopulares();
        const rows = data.map(c => ({
          data: c,
          cells: [c.tipo_categoria, c.num_productos, formatQ(c.precio_promedio)]
        }));
        container.innerHTML = `
          <h3 style="margin-bottom:1rem">🏷️ Categorías más Populares
            <span class="badge badge-purple" style="font-size:0.7rem;margin-left:0.5rem">GROUP BY + HAVING</span>
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">
            Usa <code>GROUP BY c.id_categoria HAVING COUNT(pc.id_producto) &gt; 1</code>
          </p>
          ${crudTable(['Categoría', '# Productos', 'Precio Promedio'], rows)}
        `;
        break;
      }
    }
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);padding:1rem">Error: ${err.message}</p>`;
  }
}

async function exportarCSV() {
  try {
    const res = await api.exportCSV();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_ventas.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV descargado correctamente', 'success');
  } catch (err) {
    showToast('Error al exportar: ' + err.message, 'error');
  }
}
