const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET todos los clientes (JOIN con Persona)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.dpi, p.nombre, p.telefono, p.direccion, p.correo, c.nit
       FROM Cliente c JOIN Persona p ON c.dpi = p.dpi ORDER BY p.nombre`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET cliente por DPI
router.get('/:dpi', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.dpi, p.nombre, p.telefono, p.direccion, p.correo, c.nit
       FROM Cliente c JOIN Persona p ON c.dpi = p.dpi WHERE c.dpi = $1`, [req.params.dpi]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear cliente
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { dpi, nombre, telefono, direccion, correo, nit } = req.body;
    if (!dpi || !nombre || !telefono || !direccion || !correo) {
      return res.status(400).json({ error: 'Campos obligatorios: dpi, nombre, telefono, direccion, correo' });
    }
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO Persona (dpi, nombre, telefono, direccion, correo) VALUES ($1,$2,$3,$4,$5)`,
      [dpi, nombre, telefono, direccion, correo]
    );
    await client.query(`INSERT INTO Cliente (dpi, nit) VALUES ($1,$2)`, [dpi, nit || null]);
    await client.query('COMMIT');
    res.status(201).json({ dpi, message: 'Cliente creado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT actualizar cliente
router.put('/:dpi', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { dpi } = req.params;
    const { nombre, telefono, direccion, correo, nit } = req.body;
    await client.query('BEGIN');
    await client.query(
      `UPDATE Persona SET nombre=COALESCE($1,nombre), telefono=COALESCE($2,telefono),
       direccion=COALESCE($3,direccion), correo=COALESCE($4,correo) WHERE dpi=$5`,
      [nombre, telefono, direccion, correo, dpi]
    );
    await client.query(`UPDATE Cliente SET nit=COALESCE($1,nit) WHERE dpi=$2`, [nit, dpi]);
    await client.query('COMMIT');
    res.json({ message: 'Cliente actualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE cliente
router.delete('/:dpi', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Persona WHERE dpi=$1 RETURNING dpi`, [req.params.dpi]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
