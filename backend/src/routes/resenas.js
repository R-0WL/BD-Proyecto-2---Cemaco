const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET reseñas de un producto
router.get('/producto/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.nombre AS cliente_nombre
       FROM Resena r JOIN Persona p ON r.dpi_cliente = p.dpi
       WHERE r.id_producto = $1 ORDER BY r.fecha DESC`, [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear reseña
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { dpi_cliente, id_producto, comentario, valor } = req.body;
    if (!dpi_cliente || !id_producto || !valor) return res.status(400).json({ error: 'Faltan campos' });
    if (valor < 1 || valor > 5) return res.status(400).json({ error: 'Valor debe ser entre 1 y 5' });
    await pool.query(
      `INSERT INTO Resena (dpi_cliente, id_producto, comentario, valor) VALUES ($1,$2,$3,$4)`,
      [dpi_cliente, id_producto, comentario, valor]
    );
    res.status(201).json({ message: 'Reseña creada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
