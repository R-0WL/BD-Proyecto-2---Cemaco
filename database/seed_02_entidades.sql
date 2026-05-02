-- SEED PARTE 2: Cliente, Empleado, Producto y subclases
INSERT INTO Cliente (dpi, nit) VALUES
('1001200010011','NIT-C001'),('1001200010012','NIT-C002'),('1001200010013',NULL),
('1001200010014','NIT-C004'),('1001200010015',NULL),('1001200010016','NIT-C006'),
('1001200010017','NIT-C007'),('1001200010018',NULL),('1001200010019','NIT-C009'),
('1001200010020','NIT-C010'),('1001200010021',NULL),('1001200010022','NIT-C012'),
('1001200010023','NIT-C013'),('1001200010024',NULL),('1001200010025','NIT-C015');

INSERT INTO Empleado (dpi,puesto,inicio_contrato,fin_contrato,jornada,estado,sueldo,id_sucursal,id_departamento) VALUES
('1001200010026','Gerente General','2020-01-15',NULL,'matutina','activo',25000.00,1,17),
('1001200010027','Cajera','2021-03-01',NULL,'matutina','activo',6500.00,1,3),
('1001200010028','Vendedor','2021-06-15',NULL,'vespertina','activo',7000.00,1,2),
('1001200010029','Encargada Inventario','2020-09-01',NULL,'matutina','embarazada',8000.00,2,6),
('1001200010030','Vendedor','2022-01-10',NULL,'matutina','activo',7000.00,2,2),
('1001200010031','Cajera','2022-04-01',NULL,'vespertina','activo',6500.00,2,3),
('1001200010032','Bodeguero','2021-08-15',NULL,'nocturna','activo',6000.00,4,5),
('1001200010033','Atención al Cliente','2023-01-10',NULL,'matutina','activo',6800.00,3,1),
('1001200010034','Seguridad','2020-03-01',NULL,'nocturna','activo',5500.00,1,9),
('1001200010035','Desarrolladora','2022-06-01',NULL,'matutina','activo',15000.00,1,13),
('1001200010036','Analista','2023-02-01',NULL,'matutina','activo',12000.00,1,16),
('1001200010037','RRHH','2021-11-01',NULL,'matutina','activo',9000.00,1,8),
('1001200010038','Mantenimiento','2020-07-01','2025-12-31','matutina','trasladado',5000.00,4,10),
('1001200010039','Despacho','2023-05-15',NULL,'vespertina','activo',6200.00,4,11),
('1001200010040','Mercadeo','2022-08-01',NULL,'mixta','activo',10000.00,1,4);

INSERT INTO Producto (nombre,descripcion,marca,precio_actual,foto_frontal,foto_lateral,otra_foto,stock_general,nit_proveedor) VALUES
('Galaxy S24 Ultra','Smartphone flagship','Samsung',12999.00,NULL,NULL,NULL,50,'NIT10001'),
('LG OLED C3 55"','Smart TV OLED 4K','LG',15999.00,NULL,NULL,NULL,20,'NIT10002'),
('MacBook Pro 14"','Laptop profesional M3','Apple',24999.00,NULL,NULL,NULL,15,'NIT10010'),
('HP Pavilion 15','Laptop para oficina','HP',8999.00,NULL,NULL,NULL,30,'NIT10005'),
('iPad Air M2','Tablet 11 pulgadas','Apple',7499.00,NULL,NULL,NULL,25,'NIT10010'),
('Camisa Polo Nike','Camisa deportiva DRI-FIT','Nike',499.00,NULL,NULL,NULL,200,'NIT10008'),
('Tenis Air Max 90','Calzado deportivo clásico','Nike',1299.00,NULL,NULL,NULL,150,'NIT10008'),
('Pantalón Cargo','Pantalón casual resistente','Nike',699.00,NULL,NULL,NULL,180,'NIT10008'),
('Café Nescafé 200g','Café instantáneo','Nestlé',45.00,NULL,NULL,NULL,500,'NIT10009'),
('Cereal Corn Flakes','Cereal de maíz 500g','Nestlé',38.00,NULL,NULL,NULL,400,'NIT10009'),
('Leche en Polvo 800g','Leche Nido fortificada','Nestlé',89.00,NULL,NULL,NULL,300,'NIT10009'),
('Refrigeradora LG','French Door 22 pies','LG',13499.00,NULL,NULL,NULL,10,'NIT10002'),
('Lavadora Samsung','Carga frontal 20kg','Samsung',7999.00,NULL,NULL,NULL,12,'NIT10001'),
('Microondas LG','1.5 pies cúbicos','LG',1299.00,NULL,NULL,NULL,35,'NIT10002'),
('Escritorio Ejecutivo','Madera y metal','MueblesMod',3499.00,NULL,NULL,NULL,18,'NIT10007'),
('Silla Ergonómica','Ajustable con soporte lumbar','MueblesMod',2799.00,NULL,NULL,NULL,25,'NIT10007'),
('Monitor Samsung 27"','Monitor curvo QHD','Samsung',4999.00,NULL,NULL,NULL,22,'NIT10001'),
('Teclado Mecánico','RGB Cherry MX','HP',899.00,NULL,NULL,NULL,60,'NIT10005'),
('Mouse Inalámbrico','Ergonómico 2.4GHz','HP',299.00,NULL,NULL,NULL,80,'NIT10005'),
('Audífonos AirPods Pro','Cancelación de ruido','Apple',2499.00,NULL,NULL,NULL,40,'NIT10010'),
('Ventilador de Torre','3 velocidades oscilante','DistElec',599.00,NULL,NULL,NULL,45,'NIT10006'),
('Plancha a Vapor','Cerámica antiadherente','DistElec',349.00,NULL,NULL,NULL,55,'NIT10006'),
('Licuadora Industrial','10 velocidades 2L','DistElec',899.00,NULL,NULL,NULL,30,'NIT10006'),
('Chocolate Abuelita','Tablilla 360g','Nestlé',25.00,NULL,NULL,NULL,350,'NIT10009'),
('Galletas Oreo','Paquete familiar 432g','Nestlé',32.00,NULL,NULL,NULL,280,'NIT10009'),
('Chaqueta Deportiva','Impermeable cortaviento','Nike',1599.00,NULL,NULL,NULL,70,'NIT10008'),
('Galaxy Tab S9','Tablet 11" 128GB','Samsung',6999.00,NULL,NULL,NULL,18,'NIT10001'),
('Sofá 3 Cuerpos','Tela antimanchas gris','MueblesMod',5999.00,NULL,NULL,NULL,8,'NIT10007'),
('Mesa de Centro','Vidrio templado y metal','MueblesMod',1899.00,NULL,NULL,NULL,15,'NIT10007'),
('Cámara de Seguridad','WiFi 1080p nocturna','DistElec',499.00,NULL,NULL,NULL,65,'NIT10006');
--;
INSERT INTO Producto_Tecnologico (id_producto, gamma) VALUES
(1,'alta'),(2,'alta'),(3,'alta'),(4,'media'),(5,'alta'),
(17,'alta'),(18,'media'),(19,'media'),(20,'alta'),(27,'alta'),(30,'media');

INSERT INTO Producto_Ropa (id_producto, talla) VALUES
(6,'M'),(7,'42'),(8,'L'),(26,'M');

INSERT INTO Producto_Comida (id_producto, fecha_caducidad) VALUES
(9,'2027-06-15'),(10,'2027-03-20'),(11,'2027-12-01'),
(24,'2027-08-10'),(25,'2027-05-30');
