# SGA Project Backend

Este es el backend del proyecto SGA, una aplicación para la gestión de cursos y usuarios.

## Estructura del Proyecto

```
.env
.gitignore
app.js
package.json
README.md
server.js
config/
    index.js
db/
    index.js
error-handling/
    index.js
middleware/
    auth.middleware.js
    jwt.middleware.js
models/
    Course.model.js
    Enrollment.model.js
    Lesson.model.js
    User.js
    User.model.js
routes/
    auth.routes.js
    course.routes.js
    enrollment.routes.js
    index.routes.js
    lesson.routes.js
    user.routes.js
```

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/Fernando-Pucha/sga-project-backend.git
    ```

2. Instala las dependencias:
    ```sh
    npm install
    ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
    PORT=5005
    MONGODB_URI=mongodb://127.0.0.1:27017/sga-project
    TOKEN_SECRET=tu_secreto_para_jwt
    ORIGIN=http://localhost:3000
    ```

## Uso

### Desarrollo

Para iniciar el servidor en modo desarrollo, usa el siguiente comando:
```sh
npm run dev
```

### Producción

Para iniciar el servidor en modo producción, usa el siguiente comando:
```sh
npm start
```

## Endpoints

### Autenticación

- `POST /auth/signup`: Crea un nuevo usuario.
- `POST /auth/login`: Inicia sesión y devuelve un JWT.
- `GET /auth/verify`: Verifica el JWT almacenado en el cliente.

### Usuarios

- `GET /api/user/profile`: Obtiene el perfil del usuario autenticado.
- `PUT /api/user/profile`: Actualiza el perfil del usuario autenticado.
- `GET /api/user/users`: Obtiene todos los usuarios (solo admin).
- `GET /api/user/professors`: Obtiene todos los profesores.
- `GET /api/user/userdetail/:userId`: Obtiene el detalle de un usuario (solo admin).
- `DELETE /api/user/userdelete/:usersId`: Elimina un usuario (solo admin).
- `PUT /api/user/userupdate/:userId`: Actualiza un usuario (solo admin).

### Cursos

- `POST /api/course/create`: Crea un nuevo curso (profesor o admin).
- `GET /api/course/courses`: Obtiene todos los cursos.
- `GET /api/course/mycourses`: Obtiene todos los cursos del profesor autenticado.
- `PUT /api/course/courseupdate/:courseId`: Actualiza un curso por ID (profesor o admin).
- `GET /api/course/:courseId`: Obtiene un curso específico por ID.
- `DELETE /api/course/:courseId`: Elimina un curso por ID (profesor o admin).

### Lecciones

- `POST /api/lesson/:courseId`: Crea una nueva lección en un curso (profesor o admin).
- `GET /api/lesson/:courseId`: Obtiene todas las lecciones de un curso.
- `GET /api/lesson/:courseId/lessons/:lessonId`: Obtiene una lección específica por ID.
- `PUT /api/lesson/:courseId/lessons/:lessonId`: Actualiza una lección por ID (profesor o admin).
- `DELETE /api/lesson/:courseId/lessons/:lessonId`: Elimina una lección por ID (profesor o admin).

### Inscripciones

- `GET /api/enrollments`: Obtiene todas las inscripciones del estudiante autenticado.
- `GET /api/enrollments/student/courses`: Obtiene todos los cursos en los que el estudiante está inscrito.
- `POST /api/enrollments/:courseId/enroll`: Inscribe al estudiante en un curso.
- `GET /api/enrollments/:courseId/check`: Verifica si el estudiante está inscrito en un curso específico.
- `DELETE /api/enrollments/:courseId/disenroll`: Elimina la inscripción del estudiante en un curso.
- `GET /api/enrollments/enrollments/:courseId`: Obtiene el progreso del estudiante en un curso.
- `PUT /api/enrollments/enrollments/:courseId`: Actualiza el progreso del estudiante en un curso.

## Pruebas

Para ejecutar las pruebas, usa el siguiente comando:
```sh
npm test
```

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcryptjs
- dotenv
- Nodemon (para desarrollo)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cualquier cambio que desees realizar.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.