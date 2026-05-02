# Infraestructura y Contenedores

La infraestructura de CEMACO 2.0 XDGT está basada al 100% en contenedores Docker, definidos en el archivo `docker-compose.yml`.

## Servicios

1.  **db (PostgreSQL 16)**
    *   **Puerto:** 5432
    *   **Volumen:** `postgres_data` para persistencia.
    *   **Inicialización:** Mapea el directorio `database/` a `/docker-entrypoint-initdb.d/` de modo que al levantar la base de datos vacía, ejecuta automáticamente `init.sql`, creando las tablas, insertando los índices, vistas y poblado masivo de datos de prueba.
    *   **Healthcheck:** Asegura que el backend no intente conectarse antes de que la BD esté lista usando `pg_isready`.

2.  **backend (Node.js API)**
    *   **Construcción:** `backend/Dockerfile` (basado en `node:20-alpine`).
    *   **Dependencia:** Espera a que `db` sea *healthy* (`depends_on`).
    *   **Variables de Entorno:** Conectado directamente a las variables generadas por `.env`.
    *   **Puerto mapeado:** `5000:5000`

3.  **frontend (Nginx SPA)**
    *   **Construcción:** `frontend/Dockerfile` (basado en `nginx:alpine`).
    *   **Proxy Inverso:** El archivo de configuración `nginx.conf` indica que las peticiones que empiecen con `/api/` sean redirigidas internamente al contenedor `backend` (`proxy_pass http://backend:5000;`), resolviendo problemas de CORS.
    *   **Archivos estáticos:** El HTML, CSS y JS se copian a `/usr/share/nginx/html`.
    *   **Puerto mapeado:** `3000:80`

4.  **adminer**
    *   **Imagen:** `adminer:latest`
    *   **Uso:** Herramienta de gestión gráfica (alternativa a pgAdmin) que permite a los desarrolladores visualizar la base de datos en `http://localhost:8080`.
