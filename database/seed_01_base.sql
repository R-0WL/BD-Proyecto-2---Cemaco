-- SEED PARTE 1: Tablas base
INSERT INTO Persona (dpi, nombre, telefono, direccion, correo) VALUES
('1001200010011','Ana López','55551001','Zona 1, Guatemala','ana@mail.com'),
('1001200010012','Carlos Méndez','55551002','Zona 2, Guatemala','carlos@mail.com'),
('1001200010013','María García','55551003','Zona 3, Guatemala','maria@mail.com'),
('1001200010014','José Hernández','55551004','Zona 4, Guatemala','jose@mail.com'),
('1001200010015','Laura Martínez','55551005','Zona 5, Guatemala','laura@mail.com'),
('1001200010016','Pedro Ramírez','55551006','Zona 6, Guatemala','pedro@mail.com'),
('1001200010017','Sofía Torres','55551007','Zona 7, Guatemala','sofia@mail.com'),
('1001200010018','Diego Morales','55551008','Zona 8, Guatemala','diego@mail.com'),
('1001200010019','Valentina Cruz','55551009','Zona 9, Guatemala','valentina@mail.com'),
('1001200010020','Andrés Flores','55551010','Zona 10, Guatemala','andres@mail.com'),
('1001200010021','Camila Reyes','55551011','Zona 11, Guatemala','camila@mail.com'),
('1001200010022','Fernando Castillo','55551012','Zona 12, Guatemala','fernando@mail.com'),
('1001200010023','Isabella Vargas','55551013','Zona 13, Guatemala','isabella@mail.com'),
('1001200010024','Roberto Jiménez','55551014','Zona 14, Guatemala','roberto@mail.com'),
('1001200010025','Daniela Rojas','55551015','Zona 15, Guatemala','daniela@mail.com'),
('1001200010026','Miguel Aguilar','55551016','Zona 16, Guatemala','miguel@mail.com'),
('1001200010027','Gabriela Peña','55551017','Zona 17, Guatemala','gabriela@mail.com'),
('1001200010028','Alejandro Ortiz','55551018','Zona 18, Guatemala','alejandro@mail.com'),
('1001200010029','Paula Guerrero','55551019','Zona 19, Guatemala','paula@mail.com'),
('1001200010030','Ricardo Soto','55551020','Zona 21, Guatemala','ricardo@mail.com'),
('1001200010031','Elena Campos','55551021','Mixco, Guatemala','elena@mail.com'),
('1001200010032','Javier Delgado','55551022','Villa Nueva, Guatemala','javier@mail.com'),
('1001200010033','Natalia Herrera','55551023','San Lucas, Guatemala','natalia@mail.com'),
('1001200010034','Oscar Medina','55551024','Antigua Guatemala','oscar@mail.com'),
('1001200010035','Lucía Navarro','55551025','Petapa, Guatemala','lucia@mail.com'),
('1001200010036','Emilio Rivas','55551026','Amatitlán, Guatemala','emilio@mail.com'),
('1001200010037','Carolina Vega','55551027','Fraijanes, Guatemala','carolina@mail.com'),
('1001200010038','Héctor Ponce','55551028','San José Pinula','hector@mail.com'),
('1001200010039','Mariana Luna','55551029','Santa Catarina Pinula','mariana@mail.com'),
('1001200010040','Sergio Ibarra','55551030','Palencia, Guatemala','sergio@mail.com');

INSERT INTO Departamento (nombre) VALUES
('Atencion_al_cliente'),('Ventas'),('Caja'),('Mercadeo_y_promociones'),
('Logistica'),('Inventarios'),('Compras'),('Recursos_humanos'),
('Seguridad'),('Mantenimiento'),('Despacho'),('Soporte_y_mantenimiento_de_Hardware'),
('Desarrollo_de_software'),('Infraestructura_y_redes'),('Proyectos_tecnologicos'),
('Analisis'),('Gerencia');

INSERT INTO Sucursal (direccion, telefono, tipo, capacidad_usada) VALUES
('CC Miraflores, Zona 11','22001001','tienda',72.5),
('CC Oakland Mall, Zona 10','22001002','tienda',65.0),
('CC Pradera, Zona 10','22001003','tienda',58.3),
('Bodega Central, Zona 12','22001004','bodega',85.0),
('CC Portales, Zona 17','22001005','tienda',45.0),
('Bodega Norte, Zona 6','22001006','bodega',90.2),
('CC Gran Vía, Roosevelt','22001007','tienda',50.0);

INSERT INTO Proveedor (nit_empresa, nombre_empresa, direccion, correo, sitio_web, tel_principal, tel_secundario) VALUES
('NIT10001','Samsung Guatemala','Zona 9, Guatemala','ventas@samsung.gt','https://samsung.gt','23001001','23001002'),
('NIT10002','LG Centroamérica','Zona 10, Guatemala','ventas@lg.gt','https://lg.gt','23002001',NULL),
('NIT10003','Textiles del Sur','Zona 12, Guatemala','info@textilsur.gt',NULL,'23003001','23003002'),
('NIT10004','Alimentos Frescos SA','Villa Nueva','ventas@alfrescos.gt','https://alfrescos.gt','23004001',NULL),
('NIT10005','HP Guatemala','Zona 13, Guatemala','ventas@hp.gt','https://hp.gt','23005001','23005002'),
('NIT10006','Distribuidora Eléctrica','Mixco','info@distelec.gt',NULL,'23006001',NULL),
('NIT10007','Muebles Modernos GT','Zona 7, Guatemala','ventas@mueblesmod.gt','https://mueblesmod.gt','23007001','23007002'),
('NIT10008','Nike Centroamérica','Zona 10, Guatemala','ventas@nike.gt','https://nike.gt','23008001',NULL),
('NIT10009','Nestlé Guatemala','Zona 13, Guatemala','ventas@nestle.gt','https://nestle.gt','23009001','23009002'),
('NIT10010','Apple Distribuidor','Zona 14, Guatemala','ventas@apple.gt','https://apple.gt','23010001',NULL);

INSERT INTO Categoria (tipo_categoria, descripcion) VALUES
('Tecnología','Dispositivos electrónicos y gadgets'),
('Salud','Productos de salud y bienestar'),
('Fitness','Equipo y accesorios deportivos'),
('Niños','Productos para niños y bebés'),
('Cocina','Utensilios y electrodomésticos de cocina'),
('Electrodomésticos','Aparatos eléctricos para el hogar'),
('Muebles','Mobiliario para hogar y oficina'),
('Ropa','Prendas de vestir y accesorios'),
('Comida','Alimentos y bebidas'),
('Otros','Productos varios'),
('Videojuegos','Consolas y videojuegos'),
('Accesorios','Accesorios varios para dispositivos');

INSERT INTO Categoria_Tecnologia (id_categoria, subtipo) VALUES
(1,'computadoras');
