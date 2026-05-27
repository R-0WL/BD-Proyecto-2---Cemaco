
DROP USER IF EXISTS usr_admin, usr_gerente, usr_vendedor, usr_inventario, usr_auditor;
DROP ROLE IF EXISTS administrador, gerente, vendedor, inventario, auditor;

CREATE ROLE administrador;
CREATE ROLE gerente;
CREATE ROLE vendedor;
CREATE ROLE inventario;
CREATE ROLE auditor;

-- Permisos generales de conexión y esquema
-- Conceder conexión a la base de datos (tienda)
GRANT CONNECT ON DATABASE tienda TO administrador, gerente, vendedor, inventario, auditor;
-- Conceder uso del esquema público
GRANT USAGE ON SCHEMA public TO administrador, gerente, vendedor, inventario, auditor;

-- Pemisos por rol

-- --- administrador ---
-- Acceso total a todas las tablas y secuencias
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO administrador;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO administrador;

-- --- gerente ---
-- Lectura total en el esquema público
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gerente;
-- Escritura limitada a empleados, personas, departamentos, sucursales y reportes
GRANT INSERT, UPDATE, DELETE ON Empleado, Persona, Departamento, Sucursal, Empleado_Reporte TO gerente;
-- Permiso de uso de secuencias
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gerente;

-- --- vendedor ---
-- Lectura en catálogo de productos, clientes, facturas, detalles, devoluciones y categorías
GRANT SELECT ON Producto, Cliente, Persona, Factura, Detalle_Venta, Devolucion, Categoria, Producto_Categoria TO vendedor;
-- Inserción de facturas, detalles de venta, devoluciones, clientes y personas
GRANT INSERT ON Factura, Detalle_Venta, Devolucion, Cliente, Persona TO vendedor;
-- Modificación de stock en productos durante ventas y datos de cliente/persona
GRANT UPDATE ON Producto, Cliente, Persona TO vendedor;
-- Permiso de uso de secuencias para inserciones seriales
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO vendedor;

-- --- inventario ---
-- Lectura y Escritura (INSERT, UPDATE) en tablas del catálogo de stock y proveedores
GRANT SELECT, INSERT, UPDATE ON Producto, Proveedor, Categoria, Inventario_Sucursal, Compra_Proveedor, Producto_Tecnologico, Producto_Ropa, Producto_Comida, Producto_Categoria TO inventario;
-- Permiso de uso de secuencias
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO inventario;

-- --- auditor ---
-- Acceso de SOLO LECTURA (SELECT) en todas las tablas y secuencias
GRANT SELECT ON ALL TABLES IN SCHEMA public TO auditor;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO auditor;

-- 5. Creación de Usuarios de Prueba con Login
CREATE USER usr_admin WITH PASSWORD 'secret_admin';
CREATE USER usr_gerente WITH PASSWORD 'secret_gerente';
CREATE USER usr_vendedor WITH PASSWORD 'secret_vendedor';
CREATE USER usr_inventario WITH PASSWORD 'secret_inventario';
CREATE USER usr_auditor WITH PASSWORD 'secret_auditor';

-- 6. Asignación de Roles a los Usuarios de Prueba
GRANT administrador TO usr_admin;
GRANT gerente TO usr_gerente;
GRANT vendedor TO usr_vendedor;
GRANT inventario TO usr_inventario;
GRANT auditor TO usr_auditor;

-- 7. Sincronización con las Cuentas de la Aplicación (para Login Web)
-- Alterar enum rol_cuenta para admitir los nuevos roles
ALTER TYPE rol_cuenta ADD VALUE IF NOT EXISTS 'administrador';
ALTER TYPE rol_cuenta ADD VALUE IF NOT EXISTS 'gerente';
ALTER TYPE rol_cuenta ADD VALUE IF NOT EXISTS 'vendedor';
ALTER TYPE rol_cuenta ADD VALUE IF NOT EXISTS 'inventario';
ALTER TYPE rol_cuenta ADD VALUE IF NOT EXISTS 'auditor';

-- Insertar las Personas de prueba asociadas
INSERT INTO Persona (dpi, nombre, telefono, direccion, correo) VALUES
('3001000010001', 'Admin Proy3', '55553001', 'Zona 10, Guatemala', 'admin_proy3@mail.com'),
('3001000010002', 'Gerente Proy3', '55553002', 'Zona 10, Guatemala', 'gerente_proy3@mail.com'),
('3001000010003', 'Vendedor Proy3', '55553003', 'Zona 10, Guatemala', 'vendedor_proy3@mail.com'),
('3001000010004', 'Inventario Proy3', '55553004', 'Zona 10, Guatemala', 'inventario_proy3@mail.com'),
('3001000010005', 'Auditor Proy3', '55553005', 'Zona 10, Guatemala', 'auditor_proy3@mail.com')
ON CONFLICT (dpi) DO NOTHING;

-- Insertar como Empleados
INSERT INTO Empleado (dpi, puesto, inicio_contrato, fin_contrato, jornada, estado, sueldo, id_sucursal, id_departamento) VALUES
('3001000010001', 'Administrador', '2026-06-05', NULL, 'matutina', 'activo', 30000.00, 1, 17),
('3001000010002', 'Gerente', '2026-06-05', NULL, 'matutina', 'activo', 20000.00, 1, 17),
('3001000010003', 'Vendedor', '2026-06-05', NULL, 'matutina', 'activo', 7000.00, 1, 2),
('3001000010004', 'Inventario', '2026-06-05', NULL, 'matutina', 'activo', 8000.00, 1, 6),
('3001000010005', 'Auditor', '2026-06-05', NULL, 'matutina', 'activo', 15000.00, 1, 16)
ON CONFLICT (dpi) DO NOTHING;

-- Insertar Cuentas de aplicación (contraseña = 'secret' para todas, hash SHA-256)
INSERT INTO Cuenta (dpi, password_hash, estado, rol) VALUES
('3001000010001', '2bb80e95df3d3c4dae727b4b768b4d70fbcd9c84433af1afd4685539cf13e175', TRUE, 'administrador'),
('3001000010002', '2bb80e95df3d3c4dae727b4b768b4d70fbcd9c84433af1afd4685539cf13e175', TRUE, 'gerente'),
('3001000010003', '2bb80e95df3d3c4dae727b4b768b4d70fbcd9c84433af1afd4685539cf13e175', TRUE, 'vendedor'),
('3001000010004', '2bb80e95df3d3c4dae727b4b768b4d70fbcd9c84433af1afd4685539cf13e175', TRUE, 'inventario'),
('3001000010005', '2bb80e95df3d3c4dae727b4b768b4d70fbcd9c84433af1afd4685539cf13e175', TRUE, 'auditor')
ON CONFLICT (dpi) DO NOTHING;

-- 8. Conceder roles al usuario de conexión proy3 para permitir SET ROLE
GRANT administrador, gerente, vendedor, inventario, auditor TO proy3;

-- 9. Tabla para connect-pg-simple (Manejo de Sesiones Express)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Conceder permisos sobre la tabla de sesiones
GRANT ALL PRIVILEGES ON TABLE "session" TO public;

