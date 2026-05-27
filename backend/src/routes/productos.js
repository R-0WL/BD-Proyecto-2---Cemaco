const router = require('express').Router();
const db = require('../db/drizzle');
const { 
  Producto, 
  Proveedor, 
  ProductoTecnologico, 
  ProductoRopa, 
  ProductoComida, 
  Categoria, 
  ProductoCategoria, 
  HistorialPrecios 
} = require('../db/schema');
const { eq, asc, desc, sql } = require('drizzle-orm');
const pool = require('../db'); // Keep pool for raw bytea retrieval of photo
const { authMiddleware } = require('../middleware/auth');

// GET todos los productos (usa VIEW con rating)
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT id_producto, nombre, marca, precio_actual, stock_general, 
             proveedor, ROUND(rating_promedio,1) as rating_promedio, total_resenas
      FROM vista_productos_rating ORDER BY id_producto
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET producto por ID con subclase
router.get('/:id', async (req, res) => {
  try {
    const idVal = parseInt(req.params.id);
    const prod = await db
      .select({
        id_producto: Producto.id_producto,
        nombre: Producto.nombre,
        descripcion: Producto.descripcion,
        marca: Producto.marca,
        precio_actual: Producto.precio_actual,
        stock_general: Producto.stock_general,
        nit_proveedor: Producto.nit_proveedor,
        proveedor: Proveedor.nombre_empresa,
        gamma: ProductoTecnologico.gamma,
        talla: ProductoRopa.talla,
        fecha_caducidad: ProductoComida.fecha_caducidad,
      })
      .from(Producto)
      .join(Proveedor, eq(Producto.nit_proveedor, Proveedor.nit_empresa))
      .leftJoin(ProductoTecnologico, eq(Producto.id_producto, ProductoTecnologico.id_producto))
      .leftJoin(ProductoRopa, eq(Producto.id_producto, ProductoRopa.id_producto))
      .leftJoin(ProductoComida, eq(Producto.id_producto, ProductoComida.id_producto))
      .where(eq(Producto.id_producto, idVal));

    if (prod.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Categorías del producto
    const cats = await db
      .select({
        id_categoria: Categoria.id_categoria,
        tipo_categoria: Categoria.tipo_categoria,
      })
      .from(Categoria)
      .join(ProductoCategoria, eq(Categoria.id_categoria, ProductoCategoria.id_categoria))
      .where(eq(ProductoCategoria.id_producto, idVal));
    
    const row = prod[0];
    row.categorias = cats;
    
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET foto de producto (retrieval of raw binary data)
router.get('/:id/foto/:tipo', async (req, res) => {
  try {
    const { id, tipo } = req.params;
    const col = { frontal: 'foto_frontal', lateral: 'foto_lateral', otra: 'otra_foto' }[tipo];
    if (!col) return res.status(400).json({ error: 'Tipo de foto inválido' });
    
    const result = await pool.query(`SELECT ${col} FROM Producto WHERE id_producto = $1`, [id]);
    if (result.rows.length === 0 || !result.rows[0][col]) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }
    res.set('Content-Type', 'image/webp');
    res.send(result.rows[0][col]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET historial de precios
router.get('/:id/precios', async (req, res) => {
  try {
    const idVal = parseInt(req.params.id);
    const result = await db
      .select({
        id_historial: HistorialPrecios.id_historial,
        fecha: HistorialPrecios.fecha,
        precio: HistorialPrecios.precio,
      })
      .from(HistorialPrecios)
      .where(eq(HistorialPrecios.id_producto, idVal))
      .orderBy(desc(HistorialPrecios.fecha));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear producto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor,
            categorias, tipo_subclase, gamma, talla, fecha_caducidad } = req.body;
    
    if (!nombre || !marca || precio_actual == null || !nit_proveedor) {
      return res.status(400).json({ error: 'Campos obligatorios: nombre, marca, precio_actual, nit_proveedor' });
    }

    const id = await db.transaction(async (tx) => {
      const [newProd] = await tx
        .insert(Producto)
        .values({
          nombre,
          descripcion,
          marca,
          precio_actual: precio_actual.toString(),
          stock_general: stock_general || 0,
          nit_proveedor,
        })
        .returning({ id_producto: Producto.id_producto });
      const prodId = newProd.id_producto;

      // Registrar precio inicial en historial
      await tx.insert(HistorialPrecios).values({
        id_producto: prodId,
        precio: precio_actual.toString(),
      });

      // Subclase
      if (tipo_subclase === 'tecnologico' && gamma) {
        await tx.insert(ProductoTecnologico).values({ id_producto: prodId, gamma });
      } else if (tipo_subclase === 'ropa' && talla) {
        await tx.insert(ProductoRopa).values({ id_producto: prodId, talla });
      } else if (tipo_subclase === 'comida' && fecha_caducidad) {
        await tx.insert(ProductoComida).values({ id_producto: prodId, fecha_caducidad });
      }

      // Categorías
      if (categorias && categorias.length > 0) {
        for (const catId of categorias) {
          await tx.insert(ProductoCategoria).values({ id_producto: prodId, id_categoria: catId });
        }
      }

      return prodId;
    });

    res.status(201).json({ id_producto: id, message: 'Producto creado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar producto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const idVal = parseInt(req.params.id);
    const { nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor } = req.body;
    
    await db.transaction(async (tx) => {
      // Si cambió el precio, registrar en historial
      if (precio_actual != null) {
        const [old] = await tx
          .select({ precio_actual: Producto.precio_actual })
          .from(Producto)
          .where(eq(Producto.id_producto, idVal));
        if (old && parseFloat(old.precio_actual) !== parseFloat(precio_actual)) {
          await tx.insert(HistorialPrecios).values({
            id_producto: idVal,
            precio: precio_actual.toString(),
          });
        }
      }

      const [updated] = await tx
        .update(Producto)
        .set({
          nombre,
          descripcion,
          marca,
          precio_actual: precio_actual != null ? precio_actual.toString() : undefined,
          stock_general,
          nit_proveedor,
        })
        .where(eq(Producto.id_producto, idVal))
        .returning();

      if (!updated) throw new Error('Producto no encontrado');
    });

    // Retornar producto actualizado
    const [updatedRow] = await db
      .select()
      .from(Producto)
      .where(eq(Producto.id_producto, idVal));
    res.json(updatedRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE producto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const idVal = parseInt(req.params.id);
    const [deleted] = await db
      .delete(Producto)
      .where(eq(Producto.id_producto, idVal))
      .returning({ id_producto: Producto.id_producto });
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
