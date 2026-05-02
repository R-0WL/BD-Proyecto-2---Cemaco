-- ============================================================
-- INIT.SQL — Script de inicialización para Docker
-- Se ejecuta automáticamente al crear el contenedor
-- ============================================================

\i /docker-entrypoint-initdb.d/ddl.sql
\i /docker-entrypoint-initdb.d/indexes.sql
\i /docker-entrypoint-initdb.d/views.sql
\i /docker-entrypoint-initdb.d/seed_01_base.sql
\i /docker-entrypoint-initdb.d/seed_02_entidades.sql
\i /docker-entrypoint-initdb.d/seed_03_transacciones.sql
