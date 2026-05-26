const { pgTable, serial, varchar, text, numeric, integer, timestamp, primaryKey } = require('drizzle-orm/pg-core');

const Categoria = pgTable('categoria', {
  id_categoria: serial('id_categoria').primaryKey(),
  tipo_categoria: varchar('tipo_categoria', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
});

const CategoriaTecnologia = pgTable('categoria_tecnologia', {
  id_categoria: integer('id_categoria').primaryKey().references(() => Categoria.id_categoria, { onDelete: 'cascade', onUpdate: 'cascade' }),
  subtipo: varchar('subtipo', { length: 100 }).notNull(),
});

const Proveedor = pgTable('proveedor', {
  nit_empresa: varchar('nit_empresa', { length: 15 }).primaryKey(),
  nombre_empresa: varchar('nombre_empresa', { length: 100 }).notNull(),
  direccion: varchar('direccion', { length: 200 }).notNull(),
  correo: varchar('correo', { length: 100 }).notNull(),
  sitio_web: varchar('sitio_web', { length: 200 }),
  tel_principal: varchar('tel_principal', { length: 15 }).notNull(),
  tel_secundario: varchar('tel_secundario', { length: 15 }),
});

const Producto = pgTable('producto', {
  id_producto: serial('id_producto').primaryKey(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  descripcion: text('descripcion'),
  marca: varchar('marca', { length: 100 }).notNull(),
  precio_actual: numeric('precio_actual', { precision: 10, scale: 2 }).notNull(),
  stock_general: integer('stock_general').notNull().default(0),
  nit_proveedor: varchar('nit_proveedor', { length: 15 }).notNull().references(() => Proveedor.nit_empresa),
});

const ProductoTecnologico = pgTable('producto_tecnologico', {
  id_producto: integer('id_producto').primaryKey().references(() => Producto.id_producto, { onDelete: 'cascade', onUpdate: 'cascade' }),
  gamma: varchar('gamma', { length: 50 }).notNull(),
});

const ProductoRopa = pgTable('producto_ropa', {
  id_producto: integer('id_producto').primaryKey().references(() => Producto.id_producto, { onDelete: 'cascade', onUpdate: 'cascade' }),
  talla: varchar('talla', { length: 10 }).notNull(),
});

const ProductoComida = pgTable('producto_comida', {
  id_producto: integer('id_producto').primaryKey().references(() => Producto.id_producto, { onDelete: 'cascade', onUpdate: 'cascade' }),
  fecha_caducidad: varchar('fecha_caducidad', { length: 50 }).notNull(), // text representation is easier or date type
});

const ProductoCategoria = pgTable('producto_categoria', {
  id_producto: integer('id_producto').notNull().references(() => Producto.id_producto, { onDelete: 'cascade', onUpdate: 'cascade' }),
  id_categoria: integer('id_categoria').notNull().references(() => Categoria.id_categoria, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.id_producto, table.id_categoria] }),
  };
});

const HistorialPrecios = pgTable('historial_precios', {
  id_historial: serial('id_historial').primaryKey(),
  id_producto: integer('id_producto').notNull().references(() => Producto.id_producto, { onDelete: 'cascade', onUpdate: 'cascade' }),
  fecha: timestamp('fecha').notNull().defaultNow(),
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
});

module.exports = {
  Categoria,
  CategoriaTecnologia,
  Proveedor,
  Producto,
  ProductoTecnologico,
  ProductoRopa,
  ProductoComida,
  ProductoCategoria,
  HistorialPrecios,
};
