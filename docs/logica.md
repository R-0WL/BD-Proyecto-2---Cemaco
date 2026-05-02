# Lógica de Negocio y Transacciones

El backend (`backend/src/routes/`) maneja la lógica central del negocio mediante el uso de transacciones SQL explícitas para garantizar las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad).

## Flujo de Venta (Carrito)

Ubicación: `backend/src/routes/facturas.js` (`POST /`)

1.  **Inicio:** Se inicia la transacción (`BEGIN`).
2.  **Validación de Stock (Concurrencia):** 
    Para cada producto en el carrito, se realiza la consulta:
    `SELECT id_producto, stock_general, nombre FROM Producto WHERE id_producto = $1 FOR UPDATE`
    El uso de `FOR UPDATE` bloquea la fila temporalmente para evitar que dos cajeros vendan la misma unidad simultáneamente (Condición de carrera).
3.  **Descuento de Inventario:**
    Si hay stock suficiente, se actualiza el `stock_general` en la tabla `Producto`.
4.  **Generación de Factura:**
    Se inserta la cabecera en `Factura` y se obtiene el `id_factura` retornado.
5.  **Registro de Detalle:**
    Se insertan las tuplas en `Detalle_Venta` registrando el precio del momento y la cantidad.
6.  **Finalización:**
    Si no hay errores, se aplica `COMMIT`.
    Si ocurre cualquier error (ej. stock insuficiente, falla de DB), el catch atrapa el error y ejecuta `ROLLBACK`, cancelando todo.

## Flujo de Devoluciones (Garantías)

Ubicación: `backend/src/routes/devoluciones.js` (`POST /`)

1.  **Inicio:** Se inicia la transacción (`BEGIN`).
2.  **Verificación de Existencia y Garantía:**
    Consulta la factura. Si `fecha_fin_garantia` es `NULL` o es menor a la fecha actual (`< new Date()`), lanza un error que dispara el `ROLLBACK`.
3.  **Verificación de Duplicidad:**
    Verifica que no se haya procesado otra devolución sobre la misma factura.
4.  **Registro:** Inserta la tupla en `Devolucion`.
5.  **Finalización:** `COMMIT`.

## Otros flujos importantes
*   **Historial de Precios:** Un *trigger* a nivel de código (`backend/src/routes/productos.js`) inserta un registro en `Historial_Precios` cada vez que se detecta una diferencia entre el `precio_actual` enviado por el cliente y el almacenado en la DB en un evento `PUT`.
*   **Fotos (BYTEA):** Las fotos se almacenan directamente en campos binarios. El backend las sirve a través de un endpoint `GET /api/productos/:id/foto/:tipo` inyectando el encabezado `Content-Type: image/webp`.
