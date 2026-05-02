 Proyecto 2 – CEMACO DATOS LEAKEADOS XD (Sistema de Inventario y Ventas)
======================================================

Aplicación web para la gestión de inventario y ventas de una tienda, desarrollada con arquitectura por capas, base de datos relacional (PostgreSQL) y contenedores Docker.

 Ejecución del proyecto
------------------------
### Aspectos importantes del proyecto (justificaciones xd)
1. Originalmente tenía planeado hacer dos portales separados con la lógica separada entre el portal de ventas y el portal de empleados. Pero por cuestión de tiempo lo unifiqué y puse todos los datos visibles para todos (yo sé que es mala práctica pero luego ya lo dividiré como quería) y por eso puede que se sienta que hay cosas que no deberían estar.

2. No me dió tiempo de darle estilos al frontend así que todo el css está hecho con copilot :/ lo demás sí lo hice yo.
3. El seed de datos lo cree con chatgpt pero lo refiné porque no me había entendido del todo.
4. No me funcionaba la autenticación con JWT y bcrypt así que comenté lo que tenía y lo hice plano con SHA-256
5. No me dió tiempo de terminar la documentación específica, así que los .md están vacíos.
6. Todos los cambios anteriores los voy a ir cambiando con el tiempo pero para que quede constancia del por qué lo voy a ir cambiando acá :D 


### Requisitos
* Docker
* Docker Compose

### Pasos para ejecutar

1.  **Clonar el repositorio:**
    \`\`\`bash
    git clone [URL_DEL_REPOSITORIO]
    cd proyecto-tienda
    \`\`\`

2.  **Crear archivo de variables de entorno:**
    Copia el archivo de ejemplo para establecer las variables necesarias.
    \`\`\`bash
    cp .env.example .env
    \`\`\`

3.  **Ejecutar el proyecto:**
    Construye e inicia todos los contenedores en segundo plano.
    \`\`\`bash
    docker compose up --build -d
    \`\`\`

### Servicios disponibles

| Servicio | URL |
| :--- | :--- |
| Frontend (SPA) | http://localhost:3000 |
| Backend (API) | http://localhost:5000 |
| Adminer (Gestor BD) | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

⚙️ Variables de entorno
-----------------------

El archivo `.env` debe contener lo siguiente (basado en `.env.example`):

\`\`\`env
POSTGRES_USER=proy2
POSTGRES_PASSWORD=secret
POSTGRES_DB=tienda
DB_HOST=db
DB_PORT=5432
JWT_SECRET=supersecretkey2026
\`\`\`

📌 Notas importantes
--------------------

*   Las credenciales (`proy2`/`secret`) están definidas estrictamente según los requisitos de calificación del proyecto.
*   El sistema se levanta **únicamente** con `docker compose up`.
*   El esquema y los datos iniciales (seeds) se cargan automáticamente en la base de datos al levantar los contenedores (ver `database/init.sql`).

📚 Documentación
----------------

La documentación detallada se encuentra en el directorio `/docs`.

| Documento | Descripción |
| :--- | :--- |
| [Arquitectura](docs/arquitectura.md) | Arquitectura del sistema, tecnologías y decisiones de diseño. |
| [Base de datos](docs/base-de-datos.md) | Normalización (1FN-BCNF), Modelo Relacional, Diagrama ER y justificación de índices. |
| [Infraestructura](docs/infraestructura.md) | Detalles de configuración de Docker y estructura de contenedores. |
| [Lógica del proyecto](docs/logica.md) | Flujos principales de negocio (Ventas, Devoluciones). |
| [Endpoints](docs/endpoints.md) | Referencia técnica de la API REST. |
| [Sentencias SQL](docs/sentencias-sql.md) | Recopilación de las consultas SQL avanzadas exigidas (JOINs, CTEs, etc.). |

🐳 Infraestructura
------------------

El sistema está completamente dockerizado utilizando:

*   **PostgreSQL 16**: Base de datos relacional con volumen persistente.
*   **Backend Node.js**: Servidor Express para la API REST.
*   **Frontend Nginx**: Servidor web Alpine sirviendo la Single Page Application estática.
*   **Adminer**: Interfaz web ligera para la gestión directa de PostgreSQL.
