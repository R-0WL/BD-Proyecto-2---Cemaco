const router = require('express').Router();
const db = require('../db/drizzle');
const { Proveedor } = require('../db/schema');
const { eq, asc } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');

// GET todos los proveedores
router.get('/', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(Proveedor)
      .orderBy(asc(Proveedor.nombre_empresa));
    res.json(rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// GET proveedor por NIT
router.get('/:nit', async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(Proveedor)
      .where(eq(Proveedor.nit_empresa, req.params.nit));
    if (!row) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(row);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// POST crear proveedor
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nit_empresa, nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario } = req.body;
    if (!nit_empresa || !nombre_empresa || !direccion || !correo || !tel_principal) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    await db.insert(Proveedor).values({
      nit_empresa,
      nombre_empresa,
      direccion,
      correo,
      sitio_web,
      tel_principal,
      tel_secundario,
    });
    res.status(201).json({ nit_empresa, message: 'Proveedor creado' });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// PUT actualizar proveedor
router.put('/:nit', authMiddleware, async (req, res) => {
  try {
    const { nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario } = req.body;
    const [updated] = await db
      .update(Proveedor)
      .set({
        nombre_empresa,
        direccion,
        correo,
        sitio_web,
        tel_principal,
        tel_secundario,
      })
      .where(eq(Proveedor.nit_empresa, req.params.nit))
      .returning();
      
    if (!updated) return res.status(404).json({ error: 'No encontrado' });
    res.json(updated);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// DELETE proveedor
router.delete('/:nit', authMiddleware, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(Proveedor)
      .where(eq(Proveedor.nit_empresa, req.params.nit))
      .returning({ nit_empresa: Proveedor.nit_empresa });
      
    if (!deleted) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
