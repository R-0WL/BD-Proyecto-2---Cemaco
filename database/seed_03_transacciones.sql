-- SEED PARTE 3: Relaciones, transacciones, autenticación

-- Producto_Categoria
INSERT INTO Producto_Categoria (id_producto, id_categoria) VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(6,8),(6,3),(7,8),(7,3),(8,8),
(9,9),(10,9),(11,9),(12,6),(13,6),(14,6),(14,5),(15,7),(16,7),
(17,1),(18,1),(18,12),(19,1),(19,12),(20,1),(20,12),(21,6),(22,6),
(23,6),(23,5),(24,9),(25,9),(26,8),(26,3),(27,1),(28,7),(29,7),(30,1);

-- Inventario_Sucursal
INSERT INTO Inventario_Sucursal (id_producto, id_sucursal, stock_especifico, ubicacion) VALUES
(1,1,15,'Pasillo 3'),(1,2,10,'Pasillo 2'),(1,3,8,'Pasillo 1'),
(2,1,5,'Pasillo 4'),(2,2,7,'Pasillo 4'),(3,2,5,'Pasillo 3'),
(4,1,10,'Pasillo 3'),(4,3,8,'Pasillo 2'),(5,1,8,'Pasillo 3'),
(5,2,7,'Pasillo 2'),(6,1,50,'Pasillo 7'),(6,3,40,'Pasillo 5'),
(7,1,30,'Pasillo 7'),(7,2,25,'Pasillo 6'),(8,1,40,'Pasillo 7'),
(9,1,100,'Pasillo 9'),(9,2,80,'Pasillo 8'),(9,3,70,'Pasillo 7'),
(10,1,80,'Pasillo 9'),(10,2,60,'Pasillo 8'),(11,1,50,'Pasillo 9'),
(12,1,3,'Pasillo 1'),(12,2,4,'Pasillo 1'),(13,1,4,'Pasillo 2'),
(14,1,10,'Pasillo 5'),(14,3,8,'Pasillo 4'),(15,2,6,'Pasillo 10'),
(16,2,8,'Pasillo 10'),(17,1,7,'Pasillo 3'),(17,2,5,'Pasillo 3'),
(18,1,15,'Pasillo 3'),(19,1,20,'Pasillo 3'),(20,2,10,'Pasillo 2'),
(21,1,12,'Pasillo 6'),(22,1,15,'Pasillo 6'),(23,1,8,'Pasillo 5'),
(24,1,70,'Pasillo 9'),(25,1,60,'Pasillo 9'),(26,1,20,'Pasillo 7'),
(27,1,5,'Pasillo 3'),(28,2,3,'Pasillo 10'),(29,2,5,'Pasillo 10'),
(30,1,15,'Pasillo 4'),(30,3,10,'Pasillo 3');

-- Historial_Precios
INSERT INTO Historial_Precios (id_producto, fecha, precio) VALUES
(1,'2025-01-01',14999.00),(1,'2025-06-01',13999.00),(1,'2026-01-01',12999.00),
(2,'2025-01-01',17999.00),(2,'2025-07-01',16499.00),(2,'2026-01-01',15999.00),
(3,'2025-03-01',26999.00),(3,'2025-09-01',25499.00),(3,'2026-01-01',24999.00),
(6,'2025-01-01',599.00),(6,'2025-06-01',549.00),(6,'2026-01-01',499.00),
(9,'2025-01-01',52.00),(9,'2025-06-01',48.00),(9,'2026-01-01',45.00),
(12,'2025-01-01',14999.00),(12,'2025-06-01',13999.00),(12,'2026-01-01',13499.00),
(15,'2025-03-01',3999.00),(15,'2026-01-01',3499.00),
(17,'2025-01-01',5499.00),(17,'2025-06-01',5299.00),(17,'2026-01-01',4999.00),
(20,'2025-01-01',2999.00),(20,'2025-06-01',2699.00),(20,'2026-01-01',2499.00),
(28,'2025-06-01',6499.00),(28,'2026-01-01',5999.00);

-- Compra_Proveedor
INSERT INTO Compra_Proveedor (nit_proveedor,id_producto,cantidad_comprada,precio_mayorista,total_compra,fecha_compra) VALUES
('NIT10001',1,50,9500.00,475000.00,'2025-12-01'),
('NIT10002',2,20,11000.00,220000.00,'2025-12-15'),
('NIT10010',3,15,18000.00,270000.00,'2025-11-20'),
('NIT10005',4,30,6000.00,180000.00,'2025-12-10'),
('NIT10010',5,25,5200.00,130000.00,'2025-12-05'),
('NIT10008',6,200,280.00,56000.00,'2025-11-01'),
('NIT10008',7,150,750.00,112500.00,'2025-11-01'),
('NIT10009',9,500,28.00,14000.00,'2026-01-10'),
('NIT10009',10,400,22.00,8800.00,'2026-01-10'),
('NIT10002',12,10,9500.00,95000.00,'2025-12-20'),
('NIT10001',13,12,5500.00,66000.00,'2025-12-20'),
('NIT10007',15,18,2200.00,39600.00,'2026-01-05'),
('NIT10007',16,25,1800.00,45000.00,'2026-01-05'),
('NIT10001',17,22,3200.00,70400.00,'2025-12-01'),
('NIT10010',20,40,1600.00,64000.00,'2025-12-15'),
('NIT10006',21,45,350.00,15750.00,'2026-01-15'),
('NIT10006',22,55,200.00,11000.00,'2026-01-15'),
('NIT10006',23,30,550.00,16500.00,'2026-01-15'),
('NIT10009',24,350,14.00,4900.00,'2026-01-10'),
('NIT10009',25,280,18.00,5040.00,'2026-01-10'),
('NIT10008',26,70,950.00,66500.00,'2025-11-01'),
('NIT10001',27,18,4800.00,86400.00,'2025-12-01'),
('NIT10007',28,8,3800.00,30400.00,'2026-01-05'),
('NIT10007',29,15,1100.00,16500.00,'2026-01-05'),
('NIT10006',30,65,280.00,18200.00,'2026-01-20');

-- Factura
INSERT INTO Factura (fecha,metodo_pago,total_pagado,fecha_fin_garantia,dpi_cliente,dpi_empleado) VALUES
('2026-01-15','tarjeta_credito',12999.00,'2027-01-15','1001200010011','1001200010028'),
('2026-01-16','efectivo',1798.00,'2027-01-16','1001200010012','1001200010028'),
('2026-01-17','tarjeta_debito',24999.00,'2027-01-17','1001200010013','1001200010030'),
('2026-01-20','tarjeta_credito',8999.00,'2027-01-20','1001200010014','1001200010030'),
('2026-01-22','efectivo',538.00,NULL,'1001200010015','1001200010027'),
('2026-01-25','transferencia',15999.00,'2027-01-25','1001200010016','1001200010028'),
('2026-02-01','tarjeta_credito',4798.00,'2027-02-01','1001200010017','1001200010030'),
('2026-02-05','efectivo',173.00,NULL,'1001200010018','1001200010027'),
('2026-02-10','tarjeta_debito',2799.00,'2027-02-10','1001200010019','1001200010028'),
('2026-02-14','tarjeta_credito',7499.00,'2027-02-14','1001200010020','1001200010030'),
('2026-02-18','efectivo',1996.00,'2027-02-18','1001200010021','1001200010027'),
('2026-02-22','transferencia',13499.00,'2027-02-22','1001200010022','1001200010028'),
('2026-03-01','tarjeta_credito',7999.00,'2027-03-01','1001200010023','1001200010030'),
('2026-03-05','tarjeta_debito',3499.00,'2027-03-05','1001200010024','1001200010028'),
('2026-03-08','efectivo',899.00,'2027-03-08','1001200010011','1001200010027'),
('2026-03-10','tarjeta_credito',2499.00,'2027-03-10','1001200010012','1001200010030'),
('2026-03-12','transferencia',5999.00,'2027-03-12','1001200010013','1001200010028'),
('2026-03-15','efectivo',64.00,NULL,'1001200010014','1001200010027'),
('2026-03-18','tarjeta_credito',4999.00,'2027-03-18','1001200010015','1001200010030'),
('2026-03-20','tarjeta_debito',1299.00,'2027-03-20','1001200010016','1001200010028'),
('2026-03-22','efectivo',599.00,'2027-03-22','1001200010017','1001200010027'),
('2026-03-25','tarjeta_credito',1899.00,'2027-03-25','1001200010018','1001200010028'),
('2026-03-28','transferencia',349.00,'2027-03-28','1001200010019','1001200010030'),
('2026-04-01','tarjeta_credito',26298.00,'2027-04-01','1001200010020','1001200010028'),
('2026-04-05','efectivo',1598.00,'2027-04-05','1001200010021','1001200010027'),
('2026-04-08','tarjeta_debito',6999.00,'2027-04-08','1001200010022','1001200010030'),
('2026-04-10','tarjeta_credito',899.00,'2027-04-10','1001200010023','1001200010028'),
('2026-04-12','efectivo',76.00,NULL,'1001200010024','1001200010027'),
('2026-04-15','transferencia',9498.00,'2027-04-15','1001200010025','1001200010030'),
('2026-04-18','tarjeta_credito',499.00,NULL,'1001200010011','1001200010028');

-- Detalle_Venta
INSERT INTO Detalle_Venta (id_factura,id_producto,cantidad_vendida,precio_del_momento,total_producto) VALUES
(1,1,1,12999.00,12999.00),(2,6,2,499.00,998.00),(2,8,1,699.00,699.00),
(3,3,1,24999.00,24999.00),(4,4,1,8999.00,8999.00),(5,6,1,499.00,499.00),
(5,9,1,45.00,45.00),(6,2,1,15999.00,15999.00),(7,5,1,7499.00,7499.00),
(7,7,1,1299.00,1299.00),(8,9,2,45.00,90.00),(8,10,1,38.00,38.00),
(8,24,1,25.00,25.00),(9,16,1,2799.00,2799.00),(10,5,1,7499.00,7499.00),
(11,6,2,499.00,998.00),(11,7,1,1299.00,1299.00),(12,12,1,13499.00,13499.00),
(13,13,1,7999.00,7999.00),(14,15,1,3499.00,3499.00),(15,18,1,899.00,899.00),
(16,20,1,2499.00,2499.00),(17,28,1,5999.00,5999.00),(18,9,1,45.00,45.00),
(18,25,1,32.00,32.00),(19,17,1,4999.00,4999.00),(20,7,1,1299.00,1299.00),
(21,21,1,599.00,599.00),(22,29,1,1899.00,1899.00),(23,22,1,349.00,349.00),
(24,3,1,24999.00,24999.00),(24,7,1,1299.00,1299.00),(25,26,1,1599.00,1599.00),
(26,27,1,6999.00,6999.00),(27,18,1,899.00,899.00),(28,9,1,45.00,45.00),
(28,24,1,25.00,25.00),(29,4,1,8999.00,8999.00),(29,19,1,299.00,299.00),
(30,6,1,499.00,499.00);

-- Devolucion
INSERT INTO Devolucion (fecha_declarada,fecha_resultado,motivo,descripcion_problema,resultado,id_factura) VALUES
('2026-01-25','2026-02-01','Defecto de fábrica','Pantalla con píxeles muertos','reemplazado',1),
('2026-02-20','2026-02-28','Producto dañado','Llegó con golpe en esquina','remunerado',6),
('2026-03-10','2026-03-18','No funciona','No enciende después de 2 semanas','reparado',4),
('2026-03-20',NULL,'Talla incorrecta','Talla no corresponde a la etiqueta','reemplazado',2),
('2026-04-05','2026-04-12','Defecto de fábrica','Ruido extraño al funcionar','reparado',13),
('2026-04-10','2026-04-15','Producto diferente','Color diferente al solicitado','reemplazado',11),
('2026-04-15',NULL,'No funciona','Deja de funcionar intermitentemente','reparado',9),
('2026-04-18','2026-04-22','Defecto de fábrica','Teclas no responden','reemplazado',15),
('2026-04-20','2026-04-25','Producto dañado','Vidrio roto en transporte','remunerado',22),
('2026-04-22',NULL,'Calidad inferior','Material diferente al descrito','remunerado',14);

-- Resena
INSERT INTO Resena (dpi_cliente,id_producto,comentario,fecha,valor) VALUES
('1001200010011',1,'Excelente teléfono, cámara increíble','2026-02-01',5),
('1001200010012',6,'Buena calidad, muy cómoda','2026-02-05',4),
('1001200010013',3,'La mejor laptop que he tenido','2026-02-10',5),
('1001200010014',4,'Cumple su función para oficina','2026-02-15',3),
('1001200010015',6,'Bonita pero se encoge al lavar','2026-02-20',3),
('1001200010016',2,'Imagen espectacular, vale cada quetzal','2026-03-01',5),
('1001200010017',5,'Perfecta para dibujar y estudiar','2026-03-05',4),
('1001200010018',9,'Buen café, sabor consistente','2026-03-10',4),
('1001200010019',16,'Muy cómoda para trabajar todo el día','2026-03-15',5),
('1001200010020',5,'Rápida y buena pantalla','2026-03-18',4),
('1001200010021',6,'Me encantó el diseño','2026-03-20',4),
('1001200010021',7,'Muy cómodos para correr','2026-03-20',5),
('1001200010022',12,'Espaciosa y eficiente','2026-03-25',5),
('1001200010023',13,'Lava muy bien, silenciosa','2026-04-01',4),
('1001200010011',18,'Buena respuesta táctil','2026-04-05',4),
('1001200010012',20,'Sonido increíble, cancelación excelente','2026-04-08',5),
('1001200010013',28,'Muy elegante y cómodo','2026-04-10',4),
('1001200010014',9,'Prefiero café de grano pero está bien','2026-04-12',3),
('1001200010015',17,'Colores vibrantes, buen monitor','2026-04-15',4),
('1001200010016',7,'Clásicos y resistentes','2026-04-18',5),
('1001200010017',21,'Refresca bien, algo ruidoso','2026-04-20',3),
('1001200010018',29,'Bonita mesa, fácil de armar','2026-04-22',4),
('1001200010019',22,'Plancha excelente, calienta rápido','2026-04-25',5),
('1001200010020',3,'Increíble rendimiento con M3','2026-04-28',5),
('1001200010024',15,'Escritorio sólido y espacioso','2026-04-05',4);

-- Empleado_Reporte
INSERT INTO Empleado_Reporte (dpi_empleado,id_departamento,reporte_pdf,fecha,descripcion) VALUES
('1001200010026',17,NULL,'2026-01-31','Reporte mensual gerencia enero'),
('1001200010028',2,NULL,'2026-01-31','Ventas enero sucursal 1'),
('1001200010030',2,NULL,'2026-01-31','Ventas enero sucursal 2'),
('1001200010036',16,NULL,'2026-01-31','Análisis de ventas Q1'),
('1001200010026',17,NULL,'2026-02-28','Reporte mensual gerencia febrero'),
('1001200010028',2,NULL,'2026-02-28','Ventas febrero sucursal 1'),
('1001200010035',13,NULL,'2026-02-28','Sprint review febrero'),
('1001200010036',16,NULL,'2026-02-28','KPIs febrero'),
('1001200010026',17,NULL,'2026-03-31','Reporte mensual gerencia marzo'),
('1001200010030',2,NULL,'2026-03-31','Ventas marzo sucursal 2');

-- Cuenta (password_hash = SHA-256 de 'password123' para todos)
INSERT INTO Cuenta (dpi,password_hash,estado,fecha_creacion,ultimo_login,rol) VALUES
('1001200010026','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-30','admin'),
('1001200010027','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-28','empleado'),
('1001200010028','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-30','empleado'),
('1001200010029','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-25','empleado'),
('1001200010030','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-30','empleado'),
('1001200010031','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-29','empleado'),
('1001200010035','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-30','empleado'),
('1001200010036','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2025-12-01','2026-04-30','empleado'),
('1001200010011','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-10','2026-04-28','cliente'),
('1001200010012','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-10','2026-04-20','cliente'),
('1001200010013','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-10','2026-04-15','cliente'),
('1001200010014','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-12','2026-04-10','cliente'),
('1001200010015','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-12','2026-04-05','cliente'),
('1001200010016','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-15','2026-04-01','cliente'),
('1001200010017','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-15','2026-03-28','cliente'),
('1001200010018','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-20','2026-03-25','cliente'),
('1001200010019','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-20','2026-03-20','cliente'),
('1001200010020','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-25','2026-03-15','cliente'),
('1001200010021','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-01-25','2026-03-10','cliente'),
('1001200010022','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-02-01','2026-03-05','cliente'),
('1001200010023','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-02-01','2026-03-01','cliente'),
('1001200010024','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-02-05','2026-02-28','cliente'),
('1001200010025','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-02-05','2026-02-25','cliente');

-- Sesion
INSERT INTO Sesion (id_cuenta,refresh_token,fecha_expiracion,revocado) VALUES
(1,'token_admin_001','2026-05-30',FALSE),
(3,'token_vendedor_001','2026-05-30',FALSE),
(5,'token_vendedor_002','2026-05-30',FALSE),
(9,'token_cliente_001','2026-05-15',FALSE),
(10,'token_cliente_002','2026-05-10',FALSE),
(1,'token_admin_old','2026-03-01',TRUE),
(3,'token_vendedor_old','2026-02-15',TRUE);

-- ============================================================
-- CUENTAS DE PRUEBA ADICIONALES (para testing rápido)
-- Todas usan password_hash = SHA-256('password123')
-- DPIs son empleados existentes en seed_02 sin cuenta previa
-- ============================================================
-- | ROL      | DPI             | CONTRASEÑA  | NOMBRE (seed_01)         |
-- |----------|-----------------|-------------|--------------------------|
-- | admin    | 1001200010033   | password123 | (Atención al Cliente)    |
-- | empleado | 1001200010032   | password123 | (Bodeguero)              |
-- | empleado | 1001200010034   | password123 | (Seguridad)              |
-- | empleado | 1001200010037   | password123 | (RRHH)                   |
-- | cliente  | 1001200010011   | password123 | (ya tiene cuenta - skip) |
-- ============================================================

INSERT INTO Cuenta (dpi, password_hash, estado, fecha_creacion, ultimo_login, rol) VALUES
-- Cuenta admin de prueba (DPI: 1001200010033 / pass: password123)
('1001200010033','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-05-01',NULL,'admin'),
-- Cuenta empleado de prueba 1 (DPI: 1001200010032 / pass: password123)
('1001200010032','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-05-01',NULL,'empleado'),
-- Cuenta empleado de prueba 2 (DPI: 1001200010034 / pass: password123)
('1001200010034','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-05-01',NULL,'empleado'),
-- Cuenta empleado de prueba 3 (DPI: 1001200010037 / pass: password123)
('1001200010037','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-05-01',NULL,'empleado'),
-- Cuenta empleado de prueba 4 (DPI: 1001200010040 / pass: password123)
('1001200010040','ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',TRUE,'2026-05-01',NULL,'empleado');

