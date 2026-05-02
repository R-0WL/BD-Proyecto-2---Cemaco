# Arquitectura del Sistema

## Modelo Arquitectónico
El sistema implementa una arquitectura **Cliente-Servidor (3 Capas)**:

1.  **Capa de Presentación (Frontend):** 
    Aplicación de Página Única (SPA) construida con HTML, CSS (Variables CSS, Flexbox/Grid) y JavaScript puro (Vanilla JS).
    Se sirve mediante Nginx y realiza peticiones HTTP asíncronas (`fetch`) al Backend. Maneja el estado local y la navegación basada en Hash (`#/ruta`).

2.  **Capa de Lógica de Negocio (Backend):**
    API RESTful desarrollada en Node.js utilizando el framework Express.
    Se divide en:
    *   **Router:** Expone las URLs y delega las solicitudes HTTP.
    *   **Middleware:** Lógica transversal como `authMiddleware` para verificar tokens JWT.
    *   **Controladores/Data Access:** Consultas SQL directas a PostgreSQL utilizando la librería `pg` y un Pool de conexiones.

3.  **Capa de Datos (Database):**
    Base de datos relacional PostgreSQL 16. Alberga el esquema completo, índices, vistas, almacenamiento binario de imágenes y las restricciones `CHECK` / `UNIQUE`.

## Decisiones de Diseño
*   **SPA Vanilla:** Se optó por no usar frameworks pesados (React/Angular) para asegurar el dominio de los fundamentos del DOM y mantener el contenedor frontend ultra-ligero (solo 5MB basado en Alpine).
*   **Imágenes en BD (BYTEA):** Para cumplir estrictamente con que todo el sistema y estado resida en la DB y hacer backups integrales más fáciles, las fotos no se guardan en un sistema de archivos tradicional, sino dentro del mismo Postgres en campos de tipo `BYTEA`.
*   **Autenticación Stateless:** Se utiliza JSON Web Tokens (JWT) para mantener la API sin estado de sesión en memoria, escalable y segura.
