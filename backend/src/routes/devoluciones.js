const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET devoluciones (usa VIEW)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM vista_devoluciones ORDER BY fecha_declarada DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST crear devolución — TRANSACCIÓN con validación de garantía y ROLLBACK
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_factura, motivo, descripcion_problema } = req.body;
    if (!id_factura || !motivo || !descripcion_problema) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    await client.query('BEGIN');

    // Verificar que la factura existe y la garantía es válida
    const factura = await client.query(
      `SELECT id_factura, fecha_fin_garantia FROM Factura WHERE id_factura = $1`, [id_factura]
    );
    if (factura.rows.length === 0) {
      throw new Error('Factura no encontrada');
    }
    if (factura.rows[0].fecha_fin_garantia && factura.rows[0].fecha_fin_garantia < new Date()) {
      throw new Error('La garantía de esta factura ha expirado. No se puede procesar la devolución.');
    }
    if (!factura.rows[0].fecha_fin_garantia) {
      throw new Error('Esta factura no tiene garantía asociada.');
    }

    // Verificar que no exista ya una devolución para esta factura
    const existing = await client.query(
      `SELECT id_devolucion FROM Devolucion WHERE id_factura = $1`, [id_factura]
    );
    if (existing.rows.length > 0) {
      throw new Error('Ya existe una devolución para esta factura');
    }

    const dev = await client.query(
      `INSERT INTO Devolucion (motivo, descripcion_problema, id_factura)
       VALUES ($1, $2, $3) RETURNING *`,
      [motivo, descripcion_problema, id_factura]
    );

    await client.query('COMMIT');
    res.status(201).json({ ...dev.rows[0], message: 'Devolución registrada' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT resolver devolución
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { resultado } = req.body;
    if (!resultado) return res.status(400).json({ error: 'resultado es obligatorio' });
    const r = await pool.query(
      `UPDATE Devolucion SET resultado=$1, fecha_resultado=NOW() WHERE id_devolucion=$2 RETURNING *`,
      [resultado, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
