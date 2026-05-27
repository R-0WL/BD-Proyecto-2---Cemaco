const router = require('express').Router();
const pool = require('../db');
const crypto = require('crypto');

// POST /auth/login — Login con sesiones Express
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

    const hashLogin = crypto.createHash('sha256').update(password).digest('hex');
    const valid = (hashLogin === cuenta.password_hash);
    
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Actualizar último login
    await pool.query(`UPDATE Cuenta SET ultimo_login = NOW() WHERE id_cuenta = $1`, [cuenta.id_cuenta]);

    // Almacenar el usuario y rol en la sesión Express
    req.session.user = { 
      dpi: cuenta.dpi, 
      nombre: cuenta.nombre, 
      rol: cuenta.rol,
      id_cuenta: cuenta.id_cuenta
    };

    res.json({
      usuario: req.session.user
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// POST /auth/logout — Cierre de sesión y destrucción de cookie/sesión
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cerrar la sesión' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Sesión cerrada' });
    });
  } else {
    res.json({ message: 'No había sesión activa' });
  }
});

// GET /auth/me — Obtener datos del usuario logueado en la sesión
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ usuario: req.session.user });
  } else {
    res.status(401).json({ error: 'Sesión expirada o no iniciada' });
  }
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
