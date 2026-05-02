-- ============================================================
-- VIEWS.SQL — Vistas para reportes y consultas frecuentes
-- ============================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 1: Stock total por producto con información de sucursales
-- Propósito : Muestra el stock general de cada producto y cuánto stock
--             está distribuido en sucursales físicas.
-- Usada por : GET /inventario  (backend/src/routes/inventario.js)
-- Consulta  : SELECT * FROM vista_stock_total ORDER BY producto
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_stock_total AS
SELECT
    p.id_producto,
    p.nombre                                      AS producto,
    p.marca,
    p.precio_actual,
    p.stock_general,
    COALESCE(SUM(inv.stock_especifico), 0)        AS stock_distribuido,
    COUNT(DISTINCT inv.id_sucursal)               AS sucursales_con_stock
FROM Producto p
LEFT JOIN Inventario_Sucursal inv ON p.id_producto = inv.id_producto
GROUP BY
    p.id_producto,
    p.nombre,
    p.marca,
    p.precio_actual,
    p.stock_general;

-- Ejemplo de uso:
--   SELECT * FROM vista_stock_total WHERE stock_general < 10;
--   SELECT * FROM vista_stock_total ORDER BY stock_distribuido DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 2: Ventas por empleado con totales
-- Propósito : Agrega el total de facturas y el monto vendido por cada
--             empleado, incluyendo su departamento y sucursal.
-- Usada por : GET /reportes/ventas-empleado  (backend/src/routes/reportes.js)
-- Consulta  : SELECT * FROM vista_ventas_empleado
--             WHERE total_facturas > 0 ORDER BY total_vendido DESC
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_ventas_empleado AS
SELECT
    e.dpi,
    per.nombre                                    AS empleado,
    d.nombre                                      AS departamento,
    s.direccion                                   AS sucursal,
    s.tipo                                        AS tipo_sucursal,
    COUNT(DISTINCT f.id_factura)                  AS total_facturas,
    COALESCE(SUM(f.total_pagado), 0)              AS total_vendido,
    COALESCE(AVG(f.total_pagado), 0)              AS promedio_por_factura,
    MAX(f.fecha)                                  AS ultima_venta
FROM Empleado e
JOIN Persona     per ON e.dpi              = per.dpi
JOIN Departamento  d ON e.id_departamento  = d.id_departamento
JOIN Sucursal      s ON e.id_sucursal      = s.id_sucursal
LEFT JOIN Factura  f ON e.dpi              = f.dpi_empleado
GROUP BY
    e.dpi,
    per.nombre,
    d.nombre,
    s.direccion,
    s.tipo;

-- Ejemplo de uso:
--   SELECT * FROM vista_ventas_empleado WHERE total_facturas > 0
--   ORDER BY total_vendido DESC;
--
--   SELECT empleado, departamento, total_vendido
--   FROM vista_ventas_empleado
--   HAVING total_vendido > 5000   -- <-- requiere subconsulta o CTE en PG


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 3: Productos con rating promedio y datos de proveedor
-- Propósito : Combina productos, sus proveedores y el promedio de reseñas
--             de clientes.  Es la fuente principal del listado de productos.
-- Usada por : GET /productos  (backend/src/routes/productos.js)
-- Consulta  : SELECT id_producto, nombre, marca, precio_actual, stock_general,
--                    proveedor, ROUND(rating_promedio,1), total_resenas
--             FROM vista_productos_rating ORDER BY id_producto
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_productos_rating AS
SELECT
    p.id_producto,
    p.nombre,
    p.marca,
    p.precio_actual,
    p.stock_general,
    prov.nit_empresa                              AS nit_proveedor,
    prov.nombre_empresa                           AS proveedor,
    COALESCE(ROUND(AVG(r.valor)::NUMERIC, 2), 0) AS rating_promedio,
    COUNT(r.valor)                                AS total_resenas
FROM Producto p
LEFT JOIN Proveedor prov ON p.nit_proveedor = prov.nit_empresa
LEFT JOIN Resena      r  ON p.id_producto   = r.id_producto
GROUP BY
    p.id_producto,
    p.nombre,
    p.marca,
    p.precio_actual,
    p.stock_general,
    prov.nit_empresa,
    prov.nombre_empresa;

-- Ejemplo de uso:
--   SELECT * FROM vista_productos_rating WHERE rating_promedio >= 4;
--   SELECT * FROM vista_productos_rating ORDER BY total_resenas DESC LIMIT 10;


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 4: Resumen de devoluciones con estado de garantía
-- Propósito : Muestra cada devolución enriquecida con datos de la factura
--             y del cliente, indicando si la garantía estaba vigente al
--             momento de la declaración.
-- Usada por : GET /devoluciones  (backend/src/routes/devoluciones.js)
-- Consulta  : SELECT * FROM vista_devoluciones ORDER BY fecha_declarada DESC
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_devoluciones AS
SELECT
    dev.id_devolucion,
    dev.fecha_declarada,
    dev.fecha_resultado,
    dev.motivo,
    dev.descripcion_problema,
    dev.resultado,
    f.id_factura,
    f.fecha                                       AS fecha_factura,
    f.metodo_pago,
    f.total_pagado,
    f.fecha_fin_garantia,
    per.nombre                                    AS cliente,
    per.correo                                    AS correo_cliente,
    CASE
        WHEN f.fecha_fin_garantia IS NULL        THEN 'Sin garantía'
        WHEN f.fecha_fin_garantia >= CURRENT_DATE THEN 'Vigente'
        ELSE 'Expirada'
    END                                           AS estado_garantia,
    CASE
        WHEN dev.resultado IS NULL               THEN 'Pendiente'
        ELSE dev.resultado::TEXT
    END                                           AS estado_devolucion
FROM Devolucion  dev
JOIN Factura       f  ON dev.id_factura  = f.id_factura
JOIN Cliente       c  ON f.dpi_cliente   = c.dpi
JOIN Persona     per  ON c.dpi           = per.dpi;

-- Ejemplo de uso:
--   SELECT * FROM vista_devoluciones WHERE estado_garantia = 'Vigente';
--   SELECT * FROM vista_devoluciones WHERE estado_devolucion = 'Pendiente';


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 5: Detalle completo de facturas (JOIN múltiple)
-- Propósito : Une factura, cliente, empleado y líneas de detalle en una
--             sola vista para reportes de ventas y exportación a CSV.
-- Usada por : GET /reportes/export/csv  (backend/src/routes/reportes.js)
-- Consulta  : SELECT * FROM vista_detalle_facturas ORDER BY fecha DESC
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_detalle_facturas AS
SELECT
    f.id_factura,
    f.fecha,
    f.metodo_pago,
    f.total_pagado,
    f.fecha_fin_garantia,
    -- Cliente
    pc.dpi                                        AS dpi_cliente,
    pc.nombre                                     AS cliente,
    pc.correo                                     AS correo_cliente,
    -- Empleado
    pe.dpi                                        AS dpi_empleado,
    pe.nombre                                     AS empleado,
    d.nombre                                      AS departamento_empleado,
    s.direccion                                   AS sucursal_venta,
    -- Líneas de detalle
    p.id_producto,
    p.nombre                                      AS producto,
    p.marca,
    dv.cantidad_vendida,
    dv.precio_del_momento,
    dv.total_producto
FROM Factura       f
JOIN Persona      pc ON f.dpi_cliente   = pc.dpi
JOIN Persona      pe ON f.dpi_empleado  = pe.dpi
JOIN Empleado      e ON pe.dpi          = e.dpi
JOIN Departamento  d ON e.id_departamento = d.id_departamento
JOIN Sucursal      s ON e.id_sucursal   = s.id_sucursal
JOIN Detalle_Venta dv ON f.id_factura   = dv.id_factura
JOIN Producto      p  ON dv.id_producto = p.id_producto;

-- Ejemplo de uso:
--   SELECT * FROM vista_detalle_facturas WHERE fecha >= '2025-01-01';
--   SELECT cliente, SUM(total_pagado) FROM vista_detalle_facturas
--   GROUP BY cliente ORDER BY 2 DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 6: Inventario detallado por sucursal
-- Propósito : Muestra qué productos hay en cada sucursal, con su stock
--             específico, ubicación y valor en inventario.
-- Usada por : GET /inventario/por-sucursal  (backend/src/routes/inventario.js)
-- Consulta  : SELECT * FROM vista_inventario_sucursal ORDER BY sucursal, producto
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_inventario_sucursal AS
SELECT
    s.id_sucursal,
    s.direccion                                         AS sucursal,
    s.tipo                                              AS tipo_sucursal,
    s.capacidad_usada,
    p.id_producto,
    p.nombre                                            AS producto,
    p.marca,
    p.precio_actual,
    inv.stock_especifico,
    inv.ubicacion,
    (inv.stock_especifico * p.precio_actual)            AS valor_inventario,
    prov.nombre_empresa                                 AS proveedor
FROM Inventario_Sucursal inv
JOIN Producto   p  ON inv.id_producto = p.id_producto
JOIN Sucursal   s  ON inv.id_sucursal = s.id_sucursal
JOIN Proveedor prov ON p.nit_proveedor = prov.nit_empresa;

-- Ejemplo de uso:
--   SELECT * FROM vista_inventario_sucursal WHERE tipo_sucursal = 'bodega';
--   SELECT sucursal, SUM(valor_inventario) AS valor_total
--   FROM vista_inventario_sucursal GROUP BY sucursal;


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 7: Empleados activos con datos completos
-- Propósito : Consolida datos de Persona, Empleado, Departamento y Sucursal
--             en una vista cómoda para la gestión de RRHH en la UI.
-- Usada por : GET /empleados  (backend/src/routes/empleados.js)
-- Consulta  : SELECT * FROM vista_empleados_activos ORDER BY nombre
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_empleados_activos AS
SELECT
    e.dpi,
    per.nombre,
    per.telefono,
    per.direccion,
    per.correo,
    e.puesto,
    e.jornada,
    e.estado,
    e.sueldo,
    e.inicio_contrato,
    e.fin_contrato,
    d.id_departamento,
    d.nombre                                      AS departamento,
    s.id_sucursal,
    s.direccion                                   AS sucursal,
    s.tipo                                        AS tipo_sucursal
FROM Empleado      e
JOIN Persona     per ON e.dpi             = per.dpi
JOIN Departamento  d ON e.id_departamento = d.id_departamento
JOIN Sucursal      s ON e.id_sucursal     = s.id_sucursal
WHERE e.estado NOT IN ('despedido', 'jubilado');

-- Ejemplo de uso:
--   SELECT * FROM vista_empleados_activos WHERE departamento = 'Ventas';
--   SELECT departamento, COUNT(*) AS empleados, AVG(sueldo) AS sueldo_promedio
--   FROM vista_empleados_activos GROUP BY departamento ORDER BY empleados DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- VISTA 8: Resumen de clientes con historial de compras
-- Propósito : Agrega datos de compras por cliente: número de facturas,
--             total gastado, última compra y si tiene devoluciones activas.
-- Usada por : GET /clientes  y  GET /reportes/mejores-clientes
-- Consulta  : SELECT * FROM vista_resumen_clientes ORDER BY total_gastado DESC
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_resumen_clientes AS
SELECT
    c.dpi,
    c.nit,
    per.nombre,
    per.telefono,
    per.correo,
    per.direccion,
    COUNT(DISTINCT f.id_factura)                  AS total_compras,
    COALESCE(SUM(f.total_pagado), 0)              AS total_gastado,
    COALESCE(AVG(f.total_pagado), 0)              AS gasto_promedio,
    MAX(f.fecha)                                  AS ultima_compra,
    COUNT(DISTINCT dev.id_devolucion)             AS total_devoluciones
FROM Cliente       c
JOIN Persona     per ON c.dpi          = per.dpi
LEFT JOIN Factura  f  ON c.dpi         = f.dpi_cliente
LEFT JOIN Devolucion dev ON f.id_factura = dev.id_factura
GROUP BY
    c.dpi,
    c.nit,
    per.nombre,
    per.telefono,
    per.correo,
    per.direccion;

-- Ejemplo de uso:
--   SELECT * FROM vista_resumen_clientes WHERE total_compras >= 3;
--   SELECT nombre, total_gastado FROM vista_resumen_clientes
--   ORDER BY total_gastado DESC LIMIT 10;
