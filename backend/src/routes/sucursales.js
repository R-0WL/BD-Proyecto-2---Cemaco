const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Sucursal ORDER BY id_sucursal`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const suc = await pool.query(`SELECT * FROM Sucursal WHERE id_sucursal=$1`, [req.params.id]);
    if (suc.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
    const emps = await pool.query(
      `SELECT p.nombre, e.puesto, d.nombre AS departamento
       FROM Empleado e JOIN Persona p ON e.dpi=p.dpi JOIN Departamento d ON e.id_departamento=d.id_departamento
       WHERE e.id_sucursal=$1`, [req.params.id]
    );
    res.json({ ...suc.rows[0], empleados: emps.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { direccion, telefono, tipo, capacidad_usada } = req.body;
    if (!direccion || !telefono || !tipo) return res.status(400).json({ error: 'Faltan campos' });
    const r = await pool.query(
      `INSERT INTO Sucursal (direccion,telefono,tipo,capacidad_usada) VALUES ($1,$2,$3,$4) RETURNING *`,
      [direccion, telefono, tipo, capacidad_usada || 0]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
