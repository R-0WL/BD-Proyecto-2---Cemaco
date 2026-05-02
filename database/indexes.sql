-- ============================================================
-- INDEXES.SQL — Índices explícitos para optimización de consultas
-- ============================================================

-- Justificación: Se indexan columnas de FK usadas frecuentemente en JOINs
-- y columnas usadas en filtros WHERE / ORDER BY habituales.

-- 1. Producto → Proveedor (búsquedas de productos por proveedor)
CREATE INDEX idx_producto_proveedor ON Producto(nit_proveedor);

-- 2. Factura → Cliente (historial de compras por cliente)
CREATE INDEX idx_factura_cliente ON Factura(dpi_cliente);

-- 3. Factura → Empleado (ventas por empleado para reportes)
CREATE INDEX idx_factura_empleado ON Factura(dpi_empleado);

-- 4. Detalle_Venta → Factura (detalles de una factura específica)
CREATE INDEX idx_detalle_factura ON Detalle_Venta(id_factura);

-- 5. Detalle_Venta → Producto (productos más vendidos)
CREATE INDEX idx_detalle_producto ON Detalle_Venta(id_producto);

-- 6. Inventario → Sucursal (stock por sucursal)
CREATE INDEX idx_inventario_sucursal ON Inventario_Sucursal(id_sucursal);

-- 7. Historial de Precios → Producto (timeline de precios)
CREATE INDEX idx_historial_producto ON Historial_Precios(id_producto);

-- 8. Historial de Precios → Fecha (consultas por rango de fechas)
CREATE INDEX idx_historial_fecha ON Historial_Precios(fecha);

-- 9. Empleado → Sucursal (empleados de una sucursal)
CREATE INDEX idx_empleado_sucursal ON Empleado(id_sucursal);

-- 10. Empleado → Departamento (empleados por departamento)
CREATE INDEX idx_empleado_departamento ON Empleado(id_departamento);

-- 11. Factura → Fecha (reportes por rango de fecha)
CREATE INDEX idx_factura_fecha ON Factura(fecha);

-- 12. Devolucion → Factura (devoluciones de una factura)
CREATE INDEX idx_devolucion_factura ON Devolucion(id_factura);

-- 13. Sesion → Cuenta (sesiones de un usuario)
CREATE INDEX idx_sesion_cuenta ON Sesion(id_cuenta);

-- 14. Cuenta → DPI (búsqueda de cuenta por persona)
CREATE INDEX idx_cuenta_dpi ON Cuenta(dpi);

-- 15. Compra Proveedor → Producto
CREATE INDEX idx_compra_producto ON Compra_Proveedor(id_producto);
