const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Proveedor ORDER BY nombre_empresa`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:nit', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM Proveedor WHERE nit_empresa=$1`, [req.params.nit]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nit_empresa, nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario } = req.body;
    if (!nit_empresa || !nombre_empresa || !direccion || !correo || !tel_principal) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    await pool.query(
      `INSERT INTO Proveedor VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [nit_empresa, nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario]
    );
    res.status(201).json({ nit_empresa, message: 'Proveedor creado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:nit', authMiddleware, async (req, res) => {
  try {
    const { nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario } = req.body;
    const result = await pool.query(
      `UPDATE Proveedor SET nombre_empresa=COALESCE($1,nombre_empresa), direccion=COALESCE($2,direccion),
       correo=COALESCE($3,correo), sitio_web=COALESCE($4,sitio_web), tel_principal=COALESCE($5,tel_principal),
       tel_secundario=COALESCE($6,tel_secundario) WHERE nit_empresa=$7 RETURNING *`,
      [nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario, req.params.nit]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:nit', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Proveedor WHERE nit_empresa=$1 RETURNING nit_empresa`, [req.params.nit]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
