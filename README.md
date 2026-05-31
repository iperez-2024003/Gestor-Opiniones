# Gestor-Opiniones

API REST construida con Node.js, Express y PostgreSQL para gestionar autenticación, perfiles de usuario, roles, publicaciones y comentarios en una plataforma social sencilla.

## Descripción
El proyecto resuelve la necesidad de centralizar la interacción entre usuarios en un backend seguro y modular, con registro, verificación de correo, recuperación de contraseña, administración de roles y un flujo básico de publicaciones/comentarios.

## Características principales
- Autenticación con JWT y control de acceso por roles.
- Registro, login, verificación de correo y recuperación de contraseña.
- Gestión de perfil con actualización de datos y foto de perfil en Cloudinary.
- CRUD de publicaciones y comentarios.
- Validación de entrada, rate limiting y cabeceras de seguridad.
- Conexión a PostgreSQL mediante Sequelize.
- Endpoint de health check para monitoreo básico.

## Tecnologías utilizadas
- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- Argon2
- Cloudinary
- Nodemailer
- Multer
- Helmet
- CORS
- express-validator
- express-rate-limit
- Morgan
- dotenv

## Instalación y ejecución
1. Instala dependencias:
   ```bash
   pnpm install
   ```
2. Configura las variables de entorno necesarias para PostgreSQL, JWT, SMTP, Cloudinary y carga de archivos.
3. Ejecuta el proyecto en desarrollo:
   ```bash
   pnpm run dev
   ```
4. Para producción:
   ```bash
   pnpm start
   ```

> El repositorio incluye una colección de Postman (`Gestion_Opiniones.postman_collection.json`) para probar los endpoints.

## Estructura general del proyecto
- `index.js`: punto de entrada de la aplicación.
- `configs/`: configuración de servidor, base de datos, CORS y Helmet.
- `middlewares/`: validación, seguridad, límites de peticiones y manejo centralizado de errores.
- `helpers/`: lógica de negocio, acceso a datos, correo, carga de archivos y Cloudinary.
- `utils/`: utilidades compartidas de autenticación, usuarios y contraseñas.
- `src/auth`: rutas, controladores y modelos relacionados con autenticación y roles.
- `src/users`: administración de roles y consultas de usuario.
- `src/publication`: publicaciones y asociaciones con comentarios.
- `src/comment`: comentarios asociados a publicaciones.
- `uploads-images/`: almacenamiento local temporal de imágenes.

## Buenas prácticas implementadas
- Separación clara entre rutas, controladores, modelos, helpers y utilidades.
- Validación de datos en la capa de entrada antes de llegar a la lógica de negocio.
- Hashing de contraseñas con Argon2.
- Middleware de autenticación y autorización reutilizable.
- Rate limiting para proteger endpoints sensibles.
- Manejo centralizado de errores y respuestas consistentes.
- Uso de transacciones en operaciones críticas de usuario y roles.
- Integración con servicios externos desacoplada en helpers dedicados.

## Futuras mejoras
- Añadir pruebas automatizadas para endpoints y lógica crítica.
- Implementar paginación y filtros en publicaciones y comentarios.
- Unificar por completo el formato de respuestas de la API.
- Añadir documentación OpenAPI/Swagger.
- Incorporar migraciones para el esquema de base de datos.

## Conclusión
Gestor-Opiniones es una base sólida para una red social ligera o un backend de portafolio: combina seguridad, modularidad y una estructura fácil de mantener sin introducir complejidad innecesaria.
