-- ============================================================
-- SEED.SQL — Datos de prueba unificados
-- Ejecuta los 3 archivos de seed en orden
-- ============================================================

\i /docker-entrypoint-initdb.d/seed_01_base.sql
\i /docker-entrypoint-initdb.d/seed_02_entidades.sql
\i /docker-entrypoint-initdb.d/seed_03_transacciones.sql
