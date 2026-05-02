const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET todos los empleados (JOIN Persona + Departamento + Sucursal)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.dpi, p.nombre, p.telefono, p.correo, e.puesto, e.estado, e.sueldo,
              e.jornada, e.inicio_contrato, e.fin_contrato,
              d.nombre AS departamento, s.direccion AS sucursal
       FROM Empleado e
       JOIN Persona p ON e.dpi = p.dpi
       JOIN Departamento d ON e.id_departamento = d.id_departamento
       JOIN Sucursal s ON e.id_sucursal = s.id_sucursal
       ORDER BY p.nombre`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET empleado por DPI
router.get('/:dpi', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.dpi, p.nombre, p.telefono, p.direccion, p.correo,
              e.puesto, e.inicio_contrato, e.fin_contrato, e.jornada, e.estado, e.sueldo,
              e.id_sucursal, e.id_departamento,
              d.nombre AS departamento, s.direccion AS sucursal
       FROM Empleado e
       JOIN Persona p ON e.dpi = p.dpi
       JOIN Departamento d ON e.id_departamento = d.id_departamento
       JOIN Sucursal s ON e.id_sucursal = s.id_sucursal
       WHERE e.dpi = $1`, [req.params.dpi]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear empleado
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { dpi, nombre, telefono, direccion, correo, puesto, inicio_contrato,
            fin_contrato, jornada, estado, sueldo, id_sucursal, id_departamento } = req.body;
    if (!dpi || !nombre || !puesto || !inicio_contrato || !jornada || sueldo == null || !id_sucursal || !id_departamento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO Persona (dpi, nombre, telefono, direccion, correo) VALUES ($1,$2,$3,$4,$5)`,
      [dpi, nombre, telefono, direccion, correo]
    );
    await client.query(
      `INSERT INTO Empleado (dpi,puesto,inicio_contrato,fin_contrato,jornada,estado,sueldo,id_sucursal,id_departamento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [dpi, puesto, inicio_contrato, fin_contrato || null, jornada, estado || 'activo', sueldo, id_sucursal, id_departamento]
    );
    await client.query('COMMIT');
    res.status(201).json({ dpi, message: 'Empleado creado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT actualizar empleado
router.put('/:dpi', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { dpi } = req.params;
    const { nombre, telefono, direccion, correo, puesto, fin_contrato, jornada, estado, sueldo, id_sucursal, id_departamento } = req.body;
    await client.query('BEGIN');
    await client.query(
      `UPDATE Persona SET nombre=COALESCE($1,nombre), telefono=COALESCE($2,telefono),
       direccion=COALESCE($3,direccion), correo=COALESCE($4,correo) WHERE dpi=$5`,
      [nombre, telefono, direccion, correo, dpi]
    );
    await client.query(
      `UPDATE Empleado SET puesto=COALESCE($1,puesto), fin_contrato=COALESCE($2,fin_contrato),
       jornada=COALESCE($3,jornada), estado=COALESCE($4,estado), sueldo=COALESCE($5,sueldo),
       id_sucursal=COALESCE($6,id_sucursal), id_departamento=COALESCE($7,id_departamento)
       WHERE dpi=$8`,
      [puesto, fin_contrato, jornada, estado, sueldo, id_sucursal, id_departamento, dpi]
    );
    await client.query('COMMIT');
    res.json({ message: 'Empleado actualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE empleado
router.delete('/:dpi', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Persona WHERE dpi=$1 RETURNING dpi`, [req.params.dpi]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
