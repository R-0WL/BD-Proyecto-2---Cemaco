const router = require('express').Router();
const pool = require('../db');

// GET inventario por sucursal (usa VIEW + JOIN)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vista_stock_total ORDER BY producto`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET inventario detallado por sucursal
router.get('/por-sucursal', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id_sucursal, s.direccion AS sucursal, s.tipo,
             p.id_producto, p.nombre AS producto, p.marca,
             inv.stock_especifico, inv.ubicacion
      FROM Inventario_Sucursal inv
      JOIN Producto p ON inv.id_producto = p.id_producto
      JOIN Sucursal s ON inv.id_sucursal = s.id_sucursal
      ORDER BY s.id_sucursal, p.nombre
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
