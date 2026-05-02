const router = require('express').Router();
const pool = require('../db');

// Reporte 1: Ventas por empleado (GROUP BY + HAVING + VIEW)
router.get('/ventas-empleado', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vista_ventas_empleado WHERE total_facturas > 0 ORDER BY total_vendido DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 2: Productos más vendidos con CTE
router.get('/top-productos', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH ventas_producto AS (
        SELECT dv.id_producto, p.nombre, p.marca,
               SUM(dv.cantidad_vendida) AS total_vendido,
               SUM(dv.total_producto) AS ingreso_total,
               COUNT(DISTINCT dv.id_factura) AS num_facturas
        FROM Detalle_Venta dv
        JOIN Producto p ON dv.id_producto = p.id_producto
        GROUP BY dv.id_producto, p.nombre, p.marca
      )
      SELECT *, RANK() OVER (ORDER BY total_vendido DESC) AS ranking
      FROM ventas_producto
      ORDER BY ranking
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 3: Ventas por mes (GROUP BY + funciones de agregación)
router.get('/ventas-mensual', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', f.fecha) AS mes,
             COUNT(f.id_factura) AS num_facturas,
             SUM(f.total_pagado) AS total_vendido,
             AVG(f.total_pagado) AS promedio_factura,
             MAX(f.total_pagado) AS factura_max,
             MIN(f.total_pagado) AS factura_min
      FROM Factura f
      GROUP BY DATE_TRUNC('month', f.fecha)
      HAVING COUNT(f.id_factura) > 0
      ORDER BY mes DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 4: Productos con stock bajo (subquery con IN)
router.get('/stock-bajo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id_producto, p.nombre, p.marca, p.stock_general, p.precio_actual,
             prov.nombre_empresa AS proveedor
      FROM Producto p
      JOIN Proveedor prov ON p.nit_proveedor = prov.nit_empresa
      WHERE p.id_producto IN (
        SELECT id_producto FROM Producto WHERE stock_general < 15
      )
      ORDER BY p.stock_general ASC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 5: Clientes con más compras (subquery correlacionado con EXISTS)
router.get('/mejores-clientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.dpi, p.nombre, p.correo,
             COUNT(f.id_factura) AS total_compras,
             SUM(f.total_pagado) AS total_gastado
      FROM Persona p
      JOIN Cliente c ON p.dpi = c.dpi
      JOIN Factura f ON c.dpi = f.dpi_cliente
      WHERE EXISTS (
        SELECT 1 FROM Factura f2 WHERE f2.dpi_cliente = c.dpi
        GROUP BY f2.dpi_cliente HAVING COUNT(*) >= 2
      )
      GROUP BY p.dpi, p.nombre, p.correo
      ORDER BY total_gastado DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reporte 6: Categorías con más productos (GROUP BY + HAVING)
router.get('/categorias-populares', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.tipo_categoria, COUNT(pc.id_producto) AS num_productos,
             ROUND(AVG(p.precio_actual),2) AS precio_promedio
      FROM Categoria c
      JOIN Producto_Categoria pc ON c.id_categoria = pc.id_categoria
      JOIN Producto p ON pc.id_producto = p.id_producto
      GROUP BY c.id_categoria, c.tipo_categoria
      HAVING COUNT(pc.id_producto) > 1
      ORDER BY num_productos DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Exportar ventas a CSV
router.get('/export/csv', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.id_factura, f.fecha, f.metodo_pago, f.total_pagado,
             pc.nombre AS cliente, pe.nombre AS empleado,
             p.nombre AS producto, dv.cantidad_vendida, dv.precio_del_momento, dv.total_producto
      FROM Factura f
      JOIN Persona pc ON f.dpi_cliente = pc.dpi
      JOIN Persona pe ON f.dpi_empleado = pe.dpi
      JOIN Detalle_Venta dv ON f.id_factura = dv.id_factura
      JOIN Producto p ON dv.id_producto = p.id_producto
      ORDER BY f.fecha DESC
    `);
    
    const headers = ['Factura','Fecha','Método Pago','Total Factura','Cliente','Empleado','Producto','Cantidad','Precio Unit.','Total Producto'];
    let csv = headers.join(',') + '\n';
    for (const r of result.rows) {
      csv += [r.id_factura, r.fecha, r.metodo_pago, r.total_pagado, `"${r.cliente}"`, `"${r.empleado}"`,
              `"${r.producto}"`, r.cantidad_vendida, r.precio_del_momento, r.total_producto].join(',') + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.csv');
    res.send(csv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
