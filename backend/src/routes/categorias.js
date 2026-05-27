const router = require('express').Router();
const db = require('../db/drizzle');
const { Categoria, CategoriaTecnologia } = require('../db/schema');
const { eq, asc } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');

// GET todas las categorías
router.get('/', async (req, res) => {
  try {
    const rows = await db
      .select({
        id_categoria: Categoria.id_categoria,
        tipo_categoria: Categoria.tipo_categoria,
        descripcion: Categoria.descripcion,
        subtipo: CategoriaTecnologia.subtipo,
      })
      .from(Categoria)
      .leftJoin(CategoriaTecnologia, eq(Categoria.id_categoria, CategoriaTecnologia.id_categoria))
      .orderBy(asc(Categoria.id_categoria));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear categoría
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo_categoria, descripcion, subtipo } = req.body;
    if (!tipo_categoria) return res.status(400).json({ error: 'tipo_categoria es obligatorio' });

    const id = await db.transaction(async (tx) => {
      const [newCat] = await tx
        .insert(Categoria)
        .values({ tipo_categoria, descripcion })
        .returning({ id_categoria: Categoria.id_categoria });

      const catId = newCat.id_categoria;
      if (subtipo) {
        await tx
          .insert(CategoriaTecnologia)
          .values({ id_categoria: catId, subtipo });
      }
      return catId;
    });

    res.status(201).json({ id_categoria: id, message: 'Categoría creada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar categoría
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { tipo_categoria, descripcion } = req.body;
    const idVal = parseInt(req.params.id);
    
    const [updated] = await db
      .update(Categoria)
      .set({ tipo_categoria, descripcion })
      .where(eq(Categoria.id_categoria, idVal))
      .returning();
      
    if (!updated) return res.status(404).json({ error: 'No encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE categoría
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const idVal = parseInt(req.params.id);
    const [deleted] = await db
      .delete(Categoria)
      .where(eq(Categoria.id_categoria, idVal))
      .returning({ id_categoria: Categoria.id_categoria });
      
    if (!deleted) return res.status(404).json({ error: 'No encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
