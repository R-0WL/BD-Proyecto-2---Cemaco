
-- Procedure: registrar_venta
CREATE OR REPLACE FUNCTION registrar_venta(
    p_cliente_id INT,
    p_usuario_id INT,
    p_total NUMERIC,
    p_detalles JSONB
) RETURNS VOID AS $$
DECLARE
    v_factura_id INT;
BEGIN

    INSERT INTO factura (cliente_id, usuario_id, total, fecha)
    VALUES (p_cliente_id, p_usuario_id, p_total, CURRENT_TIMESTAMP)
    RETURNING id INTO v_factura_id;

    PERFORM jsonb_array_elements(p_detalles) AS detalle
    WHERE EXISTS (
        INSERT INTO detalle_factura (factura_id, producto_id, cantidad, precio)
        VALUES (
            v_factura_id,
            (detalle->>'producto_id')::INT,
            (detalle->>'cantidad')::INT,
            (detalle->>'precio')::NUMERIC
        )
    );


    PERFORM actualizar_stock();
END;
$$ LANGUAGE plpgsql;

-- Procedure: actualizar_stock
CREATE OR REPLACE FUNCTION actualizar_stock() RETURNS VOID AS $$
BEGIN
    UPDATE producto p
    SET stock = stock - d.cantidad
    FROM detalle_factura d
    WHERE d.producto_id = p.id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: registrar_compra_proveedor
CREATE OR REPLACE FUNCTION registrar_compra_proveedor(
    p_proveedor_id INT,
    p_usuario_id INT,
    p_total NUMERIC,
    p_detalles JSONB
) RETURNS VOID AS $$
DECLARE
    v_compra_id INT;
BEGIN
    INSERT INTO compra (proveedor_id, usuario_id, total, fecha)
    VALUES (p_proveedor_id, p_usuario_id, p_total, CURRENT_TIMESTAMP)
    RETURNING id INTO v_compra_id;
    PERFORM jsonb_array_elements(p_detalles) AS detalle
    WHERE EXISTS (
        INSERT INTO detalle_compra (compra_id, producto_id, cantidad, precio)
        VALUES (
            v_compra_id,
            (detalle->>'producto_id')::INT,
            (detalle->>'cantidad')::INT,
            (detalle->>'precio')::NUMERIC
        )
    );

    PERFORM actualizar_stock_compra(p_detalles);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_stock_compra(p_detalles JSONB) RETURNS VOID AS $$
BEGIN
    PERFORM jsonb_array_elements(p_detalles) AS detalle
    WHERE EXISTS (
        UPDATE producto p
        SET stock = stock + (detalle->>'cantidad')::INT
        WHERE p.id = (detalle->>'producto_id')::INT
    );
END;
$$ LANGUAGE plpgsql;

-- Procedure: obtener_reporte_ventas
CREATE OR REPLACE FUNCTION obtener_reporte_ventas(p_fecha_inicio DATE, p_fecha_fin DATE)
RETURNS TABLE(fecha DATE, total_ventas NUMERIC, total_cantidad INT) AS $$
BEGIN
    RETURN QUERY
    SELECT f.fecha::DATE,
           SUM(f.total) AS total_ventas,
           SUM(df.cantidad) AS total_cantidad
    FROM factura f
    JOIN detalle_factura df ON df.factura_id = f.id
    WHERE f.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY f.fecha::DATE
    ORDER BY f.fecha::DATE;
END;
$$ LANGUAGE plpgsql;

-- Procedure: obtener_detalle_producto
CREATE OR REPLACE FUNCTION obtener_detalle_producto(p_producto_id INT)
RETURNS TABLE(
    producto_id INT,
    nombre TEXT,
    categoria TEXT,
    proveedor TEXT,
    stock INT,
    precio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id,
           p.nombre,
           c.nombre AS categoria,
           pr.nombre AS proveedor,
           p.stock,
           p.precio
    FROM producto p
    LEFT JOIN categoria c ON p.categoria_id = c.id
    LEFT JOIN proveedor pr ON p.proveedor_id = pr.id
    WHERE p.id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: obtener_stock_y_estado
CREATE OR REPLACE FUNCTION obtener_stock_y_estado(
    p_producto_id INT,
    OUT stock_actual INT,
    OUT estado_inventario TEXT
) RETURNS VOID AS $$
BEGIN
    -- ahí lo pongo después xd
END;
$$ LANGUAGE plpgsql;