const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET todos los productos (usa VIEW con rating)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_producto, nombre, marca, precio_actual, stock_general, 
              proveedor, ROUND(rating_promedio,1) as rating_promedio, total_resenas
       FROM vista_productos_rating ORDER BY id_producto`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET producto por ID con subclase
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prod = await pool.query(
      `SELECT p.*, prov.nombre_empresa AS proveedor,
              pt.gamma, pr.talla, pc.fecha_caducidad
       FROM Producto p
       JOIN Proveedor prov ON p.nit_proveedor = prov.nit_empresa
       LEFT JOIN Producto_Tecnologico pt ON p.id_producto = pt.id_producto
       LEFT JOIN Producto_Ropa pr ON p.id_producto = pr.id_producto
       LEFT JOIN Producto_Comida pc ON p.id_producto = pc.id_producto
       WHERE p.id_producto = $1`, [id]
    );
    if (prod.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Categorías del producto
    const cats = await pool.query(
      `SELECT c.id_categoria, c.tipo_categoria
       FROM Categoria c
       JOIN Producto_Categoria pc ON c.id_categoria = pc.id_categoria
       WHERE pc.id_producto = $1`, [id]
    );
    
    const row = prod.rows[0];
    // No enviar BYTEA en JSON, usar endpoint de foto
    delete row.foto_frontal;
    delete row.foto_lateral;
    delete row.otra_foto;
    row.categorias = cats.rows;
    
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET foto de producto
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
    const result = await pool.query(
      `SELECT id_historial, fecha, precio FROM Historial_Precios
       WHERE id_producto = $1 ORDER BY fecha DESC`, [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear producto
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor,
            categorias, tipo_subclase, gamma, talla, fecha_caducidad } = req.body;
    
    if (!nombre || !marca || precio_actual == null || !nit_proveedor) {
      return res.status(400).json({ error: 'Campos obligatorios: nombre, marca, precio_actual, nit_proveedor' });
    }

    await client.query('BEGIN');
    
    const prod = await client.query(
      `INSERT INTO Producto (nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_producto`,
      [nombre, descripcion, marca, precio_actual, stock_general || 0, nit_proveedor]
    );
    const id = prod.rows[0].id_producto;

    // Registrar precio inicial en historial
    await client.query(
      `INSERT INTO Historial_Precios (id_producto, precio) VALUES ($1, $2)`, [id, precio_actual]
    );

    // Subclase
    if (tipo_subclase === 'tecnologico' && gamma) {
      await client.query(`INSERT INTO Producto_Tecnologico (id_producto, gamma) VALUES ($1,$2)`, [id, gamma]);
    } else if (tipo_subclase === 'ropa' && talla) {
      await client.query(`INSERT INTO Producto_Ropa (id_producto, talla) VALUES ($1,$2)`, [id, talla]);
    } else if (tipo_subclase === 'comida' && fecha_caducidad) {
      await client.query(`INSERT INTO Producto_Comida (id_producto, fecha_caducidad) VALUES ($1,$2)`, [id, fecha_caducidad]);
    }

    // Categorías
    if (categorias && categorias.length > 0) {
      for (const catId of categorias) {
        await client.query(`INSERT INTO Producto_Categoria (id_producto, id_categoria) VALUES ($1,$2)`, [id, catId]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id_producto: id, message: 'Producto creado' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT actualizar producto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor } = req.body;
    
    // Si cambió el precio, registrar en historial
    if (precio_actual != null) {
      const old = await pool.query(`SELECT precio_actual FROM Producto WHERE id_producto = $1`, [id]);
      if (old.rows.length > 0 && old.rows[0].precio_actual !== precio_actual) {
        await pool.query(`INSERT INTO Historial_Precios (id_producto, precio) VALUES ($1,$2)`, [id, precio_actual]);
      }
    }

    const result = await pool.query(
      `UPDATE Producto SET nombre=COALESCE($1,nombre), descripcion=COALESCE($2,descripcion),
       marca=COALESCE($3,marca), precio_actual=COALESCE($4,precio_actual),
       stock_general=COALESCE($5,stock_general), nit_proveedor=COALESCE($6,nit_proveedor)
       WHERE id_producto=$7 RETURNING *`,
      [nombre, descripcion, marca, precio_actual, stock_general, nit_proveedor, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE producto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM Producto WHERE id_producto=$1 RETURNING id_producto`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
