const router = require('express').Router();
const pool = require('../db');
// [COMENTADO - bcrypt desactivado]
// const bcrypt = require('bcrypt');
const crypto = require('crypto');

// [COMENTADO - JWT desactivado]
// const { generateToken } = require('../middleware/auth');

// POST /auth/login — Login plano (sin JWT)
router.post('/login', async (req, res) => {
  try {
    const { dpi, password } = req.body;
    if (!dpi || !password) return res.status(400).json({ error: 'DPI y contraseña son obligatorios' });

    const result = await pool.query(
      `SELECT cu.id_cuenta, cu.dpi, cu.password_hash, cu.rol, cu.estado, p.nombre
       FROM Cuenta cu JOIN Persona p ON cu.dpi = p.dpi WHERE cu.dpi = $1`, [dpi]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const cuenta = result.rows[0];
    if (!cuenta.estado) return res.status(401).json({ error: 'Cuenta desactivada' });

    // [COMENTADO - bcrypt desactivado]
    // const valid = await bcrypt.compare(password, cuenta.password_hash);
    const hashLogin = crypto.createHash('sha256').update(password).digest('hex');
    const valid = (hashLogin === cuenta.password_hash);
    
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    // [COMENTADO - generación de JWT desactivada]
    // const token = generateToken({ id_cuenta: cuenta.id_cuenta, dpi: cuenta.dpi, rol: cuenta.rol });

    // Actualizar último login
    await pool.query(`UPDATE Cuenta SET ultimo_login = NOW() WHERE id_cuenta = $1`, [cuenta.id_cuenta]);

    // [COMENTADO - registro de sesión en tabla Sesion desactivado]
    // await pool.query(
    //   `INSERT INTO Sesion (id_cuenta, refresh_token, fecha_expiracion) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    //   [cuenta.id_cuenta, token]
    // );

    // Devuelve usuario sin token
    res.json({
      usuario: { dpi: cuenta.dpi, nombre: cuenta.nombre, rol: cuenta.rol }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /auth/logout — Logout plano (sin revocar token)
router.post('/logout', async (req, res) => {
  // [COMENTADO - revocación de token desactivada]
  // try {
  //   const authHeader = req.headers.authorization;
  //   if (authHeader) {
  //     const token = authHeader.split(' ')[1];
  //     await pool.query(`UPDATE Sesion SET revocado = TRUE WHERE refresh_token = $1`, [token]);
  //   }
  // } catch (err) { /* ignorar */ }
  res.json({ message: 'Sesión cerrada' });
});

// POST /auth/register — Registro de nuevo cliente
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { dpi, nombre, telefono, direccion, correo, password, nit } = req.body;
    if (!dpi || !nombre || !password) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    await client.query('BEGIN');

    // Verificar si persona ya existe
    const exists = await client.query(`SELECT dpi FROM Persona WHERE dpi=$1`, [dpi]);
    if (exists.rows.length === 0) {
      await client.query(
        `INSERT INTO Persona (dpi,nombre,telefono,direccion,correo) VALUES ($1,$2,$3,$4,$5)`,
        [dpi, nombre, telefono || '', direccion || '', correo || '']
      );
      await client.query(`INSERT INTO Cliente (dpi, nit) VALUES ($1,$2)`, [dpi, nit || null]);
    }

    // [COMENTADO - bcrypt desactivado]
    // const hash = await bcrypt.hash(password, 10);
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    await client.query(
      `INSERT INTO Cuenta (dpi, password_hash, rol) VALUES ($1,$2,'cliente')`, [dpi, hash]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cuenta creada exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

module.exports = router;
