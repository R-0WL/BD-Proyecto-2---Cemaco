require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');

const productosRouter = require('./routes/productos');
const clientesRouter = require('./routes/clientes');
const empleadosRouter = require('./routes/empleados');
const proveedoresRouter = require('./routes/proveedores');
const categoriasRouter = require('./routes/categorias');
const sucursalesRouter = require('./routes/sucursales');
const facturasRouter = require('./routes/facturas');
const devolucionesRouter = require('./routes/devoluciones');
const reportesRouter = require('./routes/reportes');
const inventarioRouter = require('./routes/inventario');
const authRouter = require('./routes/auth');
const resenasRouter = require('./routes/resenas');

const app = express();
const PORT = process.env.APP_PORT || process.env.PORT || 5000;

app.use(cors());
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'supersecret_session_key_for_express_session_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    secure: false,
    httpOnly: true
  }
}));
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api/productos', productosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/sucursales', sucursalesRouter);
app.use('/api/facturas', facturasRouter);
app.use('/api/devoluciones', devolucionesRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/auth', authRouter);
app.use('/api/resenas', resenasRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
});

const db = require('./db/drizzle');
const { Categoria } = require('./db/schema');

app.listen(PORT, async () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
  try {
    const test = await db.select().from(Categoria).limit(1);
    console.log('ORM Drizzle conectado correctamente, prueba ejecutada.');
  } catch (err) {
    console.error('Error al inicializar ORM Drizzle:', err.message);
  }
});
