const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET facturas con JOIN múltiple (cliente + empleado + sucursal)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id_factura, f.fecha, f.metodo_pago, f.total_pagado, f.fecha_fin_garantia,
              pc.nombre AS cliente, pe.nombre AS empleado, s.direccion AS sucursal
       FROM Factura f
       JOIN Cliente c ON f.dpi_cliente = c.dpi
       JOIN Persona pc ON c.dpi = pc.dpi
       JOIN Empleado e ON f.dpi_empleado = e.dpi
       JOIN Persona pe ON e.dpi = pe.dpi
       JOIN Sucursal s ON e.id_sucursal = s.id_sucursal
       ORDER BY f.fecha DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET detalle de una factura
router.get('/:id', async (req, res) => {
  try {
    const factura = await pool.query(
      `SELECT f.*, pc.nombre AS cliente, pe.nombre AS empleado
       FROM Factura f
       JOIN Persona pc ON f.dpi_cliente = pc.dpi
       JOIN Persona pe ON f.dpi_empleado = pe.dpi
       WHERE f.id_factura = $1`, [req.params.id]
    );
    if (factura.rows.length === 0) return res.status(404).json({ error: 'Factura no encontrada' });
    
    const detalle = await pool.query(
      `SELECT dv.*, p.nombre AS producto, p.marca
       FROM Detalle_Venta dv JOIN Producto p ON dv.id_producto = p.id_producto
       WHERE dv.id_factura = $1`, [req.params.id]
    );
    res.json({ ...factura.rows[0], detalle: detalle.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear factura — TRANSACCIÓN EXPLÍCITA con manejo de error y ROLLBACK
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { metodo_pago, dpi_cliente, dpi_empleado, fecha_fin_garantia, items } = req.body;
    // items: [{ id_producto, cantidad }]
    
    if (!metodo_pago || !dpi_cliente || !dpi_empleado || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan campos obligatorios o items vacíos' });
    }

    await client.query('BEGIN');

    let total = 0;
    const detalles = [];

    for (const item of items) {
      // Verificar stock
      const prod = await client.query(
        `SELECT id_producto, precio_actual, stock_general, nombre FROM Producto WHERE id_producto = $1 FOR UPDATE`,
        [item.id_producto]
      );
      if (prod.rows.length === 0) {
        throw new Error(`Producto ${item.id_producto} no existe`);
      }
      if (prod.rows[0].stock_general < item.cantidad) {
        throw new Error(`Stock insuficiente para ${prod.rows[0].nombre}. Disponible: ${prod.rows[0].stock_general}`);
      }

      const precio = parseFloat(prod.rows[0].precio_actual);
      const subtotal = precio * item.cantidad;
      total += subtotal;
      detalles.push({ id_producto: item.id_producto, cantidad: item.cantidad, precio, subtotal });

      // Descontar stock
      await client.query(
        `UPDATE Producto SET stock_general = stock_general - $1 WHERE id_producto = $2`,
        [item.cantidad, item.id_producto]
      );
    }

    // Crear factura
    const fac = await client.query(
      `INSERT INTO Factura (metodo_pago, total_pagado, fecha_fin_garantia, dpi_cliente, dpi_empleado)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_factura`,
      [metodo_pago, total, fecha_fin_garantia || null, dpi_cliente, dpi_empleado]
    );
    const id_factura = fac.rows[0].id_factura;

    // Insertar detalles
    for (const d of detalles) {
      await client.query(
        `INSERT INTO Detalle_Venta (id_factura, id_producto, cantidad_vendida, precio_del_momento, total_producto)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_factura, d.id_producto, d.cantidad, d.precio, d.subtotal]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ id_factura, total_pagado: total, message: 'Venta registrada exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
