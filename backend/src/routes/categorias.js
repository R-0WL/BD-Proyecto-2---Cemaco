const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ct.subtipo FROM Categoria c
       LEFT JOIN Categoria_Tecnologia ct ON c.id_categoria = ct.id_categoria
       ORDER BY c.id_categoria`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { tipo_categoria, descripcion, subtipo } = req.body;
    if (!tipo_categoria) return res.status(400).json({ error: 'tipo_categoria es obligatorio' });
    await client.query('BEGIN');
    const r = await client.query(
      `INSERT INTO Categoria (tipo_categoria, descripcion) VALUES ($1,$2) RETURNING id_categoria`,
      [tipo_categoria, descripcion]
    );
    const id = r.rows[0].id_categoria;
    if (subtipo) {
      await client.query(`INSERT INTO Categoria_Tecnologia (id_categoria, subtipo) VALUES ($1,$2)`, [id, subtipo]);
    }
    await client.query('COMMIT');
    res.status(201).json({ id_categoria: id, message: 'Categoría creada' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { tipo_categoria, descripcion } = req.body;
    const result = await pool.query(
      `UPDATE Categoria SET tipo_categoria=COALESCE($1,tipo_categoria), descripcion=COALESCE($2,descripcion)
       WHERE id_categoria=$3 RETURNING *`, [tipo_categoria, descripcion, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM Categoria WHERE id_categoria=$1 RETURNING id_categoria`, [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
