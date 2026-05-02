-- ============================================================
-- DDL.SQL — Esquema completo del sistema de inventario y ventas
-- DBMS: PostgreSQL
-- Credenciales: proy2 / secret
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TIPOS ENUMERADOS
-- ────────────────────────────────────────────────────────────

CREATE TYPE estado_empleado AS ENUM (
    'activo', 'jubilado', 'embarazada', 'postparto', 'despedido', 'trasladado'
);

CREATE TYPE resultado_devolucion AS ENUM (
    'reparado', 'reemplazado', 'remunerado'
);

CREATE TYPE tipo_sucursal AS ENUM (
    'tienda', 'bodega'
);

CREATE TYPE rol_cuenta AS ENUM (
    'admin', 'empleado', 'cliente'
);

CREATE TYPE subtipo_tecnologia AS ENUM (
    'telefonos', 'monitores_tv', 'computadoras', 'tablets'
);

CREATE TYPE metodo_pago AS ENUM (
    'efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia'
);

CREATE TYPE jornada_tipo AS ENUM (
    'matutina', 'vespertina', 'nocturna', 'mixta'
);

-- ────────────────────────────────────────────────────────────
-- 2. TABLAS BASE (sin dependencias de FK)
-- ────────────────────────────────────────────────────────────

-- 2.1 Persona (supertipo para Cliente y Empleado)
CREATE TABLE Persona (
    dpi             VARCHAR(15)     PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    telefono        VARCHAR(15)     NOT NULL,
    direccion       VARCHAR(200)    NOT NULL,
    correo          VARCHAR(100)    NOT NULL
);

-- 2.2 Departamento (áreas de trabajo de la empresa)
CREATE TABLE Departamento (
    id_departamento SERIAL          PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL UNIQUE
);

-- 2.3 Sucursal
CREATE TABLE Sucursal (
    id_sucursal     SERIAL          PRIMARY KEY,
    direccion       VARCHAR(200)    NOT NULL,
    telefono        VARCHAR(15)     NOT NULL,
    tipo            tipo_sucursal   NOT NULL,
    capacidad_usada NUMERIC(5,2)    NOT NULL DEFAULT 0
                    CHECK (capacidad_usada >= 0 AND capacidad_usada <= 100)
);

-- 2.4 Proveedor
CREATE TABLE Proveedor (
    nit_empresa     VARCHAR(15)     PRIMARY KEY,
    nombre_empresa  VARCHAR(100)    NOT NULL,
    direccion       VARCHAR(200)    NOT NULL,
    correo          VARCHAR(100)    NOT NULL,
    sitio_web       VARCHAR(200),
    tel_principal   VARCHAR(15)     NOT NULL,
    tel_secundario  VARCHAR(15)
);

-- 2.5 Categoría
CREATE TABLE Categoria (
    id_categoria    SERIAL          PRIMARY KEY,
    tipo_categoria  VARCHAR(100)    NOT NULL,
    descripcion     TEXT
);

-- ────────────────────────────────────────────────────────────
-- 3. TABLAS DE ESPECIALIZACIÓN
-- ────────────────────────────────────────────────────────────

-- 3.1 Cliente (subtipo de Persona)
CREATE TABLE Cliente (
    dpi             VARCHAR(15)     PRIMARY KEY REFERENCES Persona(dpi)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    nit             VARCHAR(15)
);

-- 3.2 Empleado (subtipo de Persona)
CREATE TABLE Empleado (
    dpi             VARCHAR(15)     PRIMARY KEY REFERENCES Persona(dpi)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    puesto          VARCHAR(100)    NOT NULL,
    inicio_contrato DATE            NOT NULL,
    fin_contrato    DATE,
    jornada         jornada_tipo    NOT NULL,
    estado          estado_empleado NOT NULL DEFAULT 'activo',
    sueldo          NUMERIC(10,2)   NOT NULL CHECK (sueldo >= 0),
    id_sucursal     INT             NOT NULL REFERENCES Sucursal(id_sucursal),
    id_departamento INT             NOT NULL REFERENCES Departamento(id_departamento)
);

-- 3.3 Categoría de Tecnología (subtipo disjunto de Categoría)
CREATE TABLE Categoria_Tecnologia (
    id_categoria    INT             PRIMARY KEY REFERENCES Categoria(id_categoria)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    subtipo         subtipo_tecnologia NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- 4. PRODUCTO Y SUS SUBCLASES
-- ────────────────────────────────────────────────────────────

-- 4.1 Producto (supertipo)
CREATE TABLE Producto (
    id_producto     SERIAL          PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     TEXT,
    marca           VARCHAR(100)    NOT NULL,
    precio_actual   NUMERIC(10,2)   NOT NULL CHECK (precio_actual >= 0),
    foto_frontal    BYTEA,
    foto_lateral    BYTEA,
    otra_foto       BYTEA,
    stock_general   INT             NOT NULL DEFAULT 0 CHECK (stock_general >= 0),
    nit_proveedor   VARCHAR(15)     NOT NULL REFERENCES Proveedor(nit_empresa)
);

-- 4.2 Producto Tecnológico (subtipo disjunto)
CREATE TABLE Producto_Tecnologico (
    id_producto     INT             PRIMARY KEY REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    gamma           VARCHAR(50)     NOT NULL
);

-- 4.3 Producto Ropa (subtipo disjunto)
CREATE TABLE Producto_Ropa (
    id_producto     INT             PRIMARY KEY REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    talla           VARCHAR(10)     NOT NULL
);

-- 4.4 Producto Comida (subtipo disjunto)
CREATE TABLE Producto_Comida (
    id_producto     INT             PRIMARY KEY REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    fecha_caducidad DATE            NOT NULL
);

-- ────────────────────────────────────────────────────────────
-- 5. RELACIONES M:N Y TABLAS DERIVADAS
-- ────────────────────────────────────────────────────────────

-- 5.1 Producto ↔ Categoría (M:N)
CREATE TABLE Producto_Categoria (
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    id_categoria    INT             NOT NULL REFERENCES Categoria(id_categoria)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (id_producto, id_categoria)
);

-- 5.2 Inventario por Sucursal (Producto ↔ Sucursal M:N)
CREATE TABLE Inventario_Sucursal (
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    id_sucursal     INT             NOT NULL REFERENCES Sucursal(id_sucursal)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    stock_especifico INT            NOT NULL DEFAULT 0 CHECK (stock_especifico >= 0),
    ubicacion       VARCHAR(50),
    PRIMARY KEY (id_producto, id_sucursal)
);

-- 5.3 Historial de Precios
CREATE TABLE Historial_Precios (
    id_historial    SERIAL          PRIMARY KEY,
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    fecha           TIMESTAMP       NOT NULL DEFAULT NOW(),
    precio          NUMERIC(10,2)   NOT NULL CHECK (precio >= 0)
);

-- 5.4 Compra a Proveedor (detalle de adquisición)
CREATE TABLE Compra_Proveedor (
    id_compra       SERIAL          PRIMARY KEY,
    nit_proveedor   VARCHAR(15)     NOT NULL REFERENCES Proveedor(nit_empresa),
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto),
    cantidad_comprada INT           NOT NULL CHECK (cantidad_comprada > 0),
    precio_mayorista  NUMERIC(10,2) NOT NULL CHECK (precio_mayorista >= 0),
    total_compra    NUMERIC(12,2)   NOT NULL CHECK (total_compra >= 0),
    fecha_compra    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 6. TRANSACCIONALES
-- ────────────────────────────────────────────────────────────

-- 6.1 Factura
CREATE TABLE Factura (
    id_factura      SERIAL          PRIMARY KEY,
    fecha           TIMESTAMP       NOT NULL DEFAULT NOW(),
    metodo_pago     metodo_pago     NOT NULL,
    total_pagado    NUMERIC(12,2)   NOT NULL CHECK (total_pagado >= 0),
    fecha_fin_garantia DATE,
    dpi_cliente     VARCHAR(15)     NOT NULL REFERENCES Cliente(dpi),
    dpi_empleado    VARCHAR(15)     NOT NULL REFERENCES Empleado(dpi)
);

-- 6.2 Detalle de Venta (Factura ↔ Producto M:N)
CREATE TABLE Detalle_Venta (
    id_factura      INT             NOT NULL REFERENCES Factura(id_factura)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto),
    cantidad_vendida INT            NOT NULL CHECK (cantidad_vendida > 0),
    precio_del_momento NUMERIC(10,2) NOT NULL CHECK (precio_del_momento >= 0),
    total_producto  NUMERIC(12,2)   NOT NULL CHECK (total_producto >= 0),
    PRIMARY KEY (id_factura, id_producto)
);

-- 6.3 Devolución
CREATE TABLE Devolucion (
    id_devolucion   SERIAL          PRIMARY KEY,
    fecha_declarada TIMESTAMP       NOT NULL DEFAULT NOW(),
    fecha_resultado TIMESTAMP,
    motivo          VARCHAR(200)    NOT NULL,
    descripcion_problema TEXT       NOT NULL,
    resultado       resultado_devolucion,
    id_factura      INT             NOT NULL REFERENCES Factura(id_factura)
);

-- 6.4 Reseña (Cliente ↔ Producto M:N)
CREATE TABLE Resena (
    dpi_cliente     VARCHAR(15)     NOT NULL REFERENCES Cliente(dpi),
    id_producto     INT             NOT NULL REFERENCES Producto(id_producto),
    comentario      TEXT,
    fecha           TIMESTAMP       NOT NULL DEFAULT NOW(),
    valor           INT             NOT NULL CHECK (valor >= 1 AND valor <= 5),
    PRIMARY KEY (dpi_cliente, id_producto)
);

-- 6.5 Empleado_Departamento (reportes PDF)
CREATE TABLE Empleado_Reporte (
    id_reporte      SERIAL          PRIMARY KEY,
    dpi_empleado    VARCHAR(15)     NOT NULL REFERENCES Empleado(dpi),
    id_departamento INT             NOT NULL REFERENCES Departamento(id_departamento),
    reporte_pdf     BYTEA,
    fecha           TIMESTAMP       NOT NULL DEFAULT NOW(),
    descripcion     VARCHAR(200)
);

-- ────────────────────────────────────────────────────────────
-- 7. AUTENTICACIÓN
-- ────────────────────────────────────────────────────────────

-- 7.1 Cuenta
CREATE TABLE Cuenta (
    id_cuenta       SERIAL          PRIMARY KEY,
    dpi             VARCHAR(15)     NOT NULL UNIQUE REFERENCES Persona(dpi)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    password_hash   VARCHAR(255)    NOT NULL,
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT NOW(),
    ultimo_login    TIMESTAMP,
    rol             rol_cuenta      NOT NULL DEFAULT 'cliente'
);

-- 7.2 Sesión / Token
CREATE TABLE Sesion (
    id_sesion       SERIAL          PRIMARY KEY,
    id_cuenta       INT             NOT NULL REFERENCES Cuenta(id_cuenta)
                    ON UPDATE CASCADE ON DELETE CASCADE,
    refresh_token   VARCHAR(500)    NOT NULL,
    fecha_expiracion TIMESTAMP      NOT NULL,
    revocado        BOOLEAN         NOT NULL DEFAULT FALSE
);
