# Documentación del API - Sistema POS (Autenticación y Usuarios)

**Versión:** 1.0.0
**URL Base:** `http://localhost:3000`

## Introducción

Esta documentación describe los endpoints para la autenticación y gestión de usuarios del sistema. El API sigue los principios RESTful y utiliza JSON para los cuerpos de las peticiones y respuestas.

## Autenticación

El sistema utiliza un esquema de autenticación basado en **JWT (JSON Web Tokens)** transportados a través de **HttpOnly cookies**.

Después de un login exitoso, el servidor establece una cookie segura llamada `access_token`. El navegador del cliente adjuntará esta cookie automáticamente en todas las peticiones a endpoints protegidos.

> **Nota para Frontend:** Asegúrate de que tu cliente HTTP (ej. Axios) esté configurado para enviar credenciales en las peticiones cross-origin.
>
> ```javascript
> // Ejemplo con Axios
> axios.defaults.withCredentials = true;
> ```

---

## Módulo de Autenticación (`/auth`)

### Autenticación de Clientes

---

#### `POST /auth/client/register`

Registra un nuevo usuario de tipo cliente.

* **Protección:** Pública
* **Petición (Body):** `RegisterClientDto`
    ```json
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@example.com",
      "password": "Password123!",
      "membershipId": "GOLD-12345"
    }
    ```
* **Respuesta Exitosa (`201 Created`):** Devuelve el objeto del usuario creado (sin la contraseña).
    ```json
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "createdAt": "2025-06-13T15:30:00.000Z",
      "updatedAt": "2025-06-13T15:30:00.000Z",
      "deletedAt": null
    }
    ```
* **Respuestas de Error:**
    * `400 Bad Request`: Error de validación en los datos de entrada.
    * `409 Conflict`: El email ya está registrado.

---

#### `POST /auth/client/login`

Inicia sesión para un usuario cliente con email y contraseña.

* **Protección:** Pública
* **Petición (Body):** `LoginDto`
    ```json
    {
      "email": "jane.doe@example.com",
      "password": "Password123!"
    }
    ```
* **Respuesta Exitosa (`200 OK`):** Devuelve un mensaje de éxito y establece la cookie `access_token`.
    ```json
    {
      "message": "Login successful"
    }
    ```
* **Respuestas de Error:**
    * `400 Bad Request`: Datos de entrada inválidos.
    * `401 Unauthorized`: Credenciales inválidas.

---

#### `GET /auth/client/google`

Inicia el flujo de autenticación con Google para clientes.

* **Protección:** Pública
* **Petición:** Ninguna (solo navegar a esta URL).
* **Respuesta Exitosa (`302 Found`):** Redirecciona al usuario a la página de consentimiento de Google. El frontend no necesita manejar esta respuesta, solo dirigir al usuario a este enlace.

---

#### `GET /auth/client/google/callback`

Callback de Google después de una autenticación exitosa para clientes. Registra al cliente si no existe.

* **Protección:** Pública (Google necesita acceder a ella).
* **Petición:** Ninguna (manejada por la redirección de Google).
* **Respuesta Exitosa (`302 Found`):** Establece la cookie `access_token` y redirecciona al usuario al dashboard del frontend (ej. `http://localhost:4200/store`).
* **Respuestas de Error:**
    * `401 Unauthorized`: Si el email de Google ya está registrado como un empleado.

---

### Autenticación de Empleados

---

#### `POST /auth/employee/register`

Registra un nuevo usuario de tipo empleado.

* **Protección:** Privada (Requiere rol `ADMIN`)
* **Petición (Body):** `RegisterEmployeeDto`
    ```json
    {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "password": "PasswordEmployee123!"
    }
    ```
* **Respuesta Exitosa (`201 Created`):** Devuelve el objeto del usuario creado.
* **Respuestas de Error:**
    * `401 Unauthorized`: No autenticado.
    * `403 Forbidden`: No tiene el rol `ADMIN`.
    * `409 Conflict`: El email ya está registrado.

---

#### `POST /auth/employee/login`

Inicia sesión para un usuario empleado con email y contraseña.

* **Protección:** Pública
* **Petición (Body):** `LoginDto`
    ```json
    {
      "email": "admin@el-negocio.com",
      "password": "ContraseñaSeguraParaElAdmin456!"
    }
    ```
* **Respuesta Exitosa (`200 OK`):** Devuelve un mensaje de éxito y establece la cookie `access_token`.
    ```json
    {
      "message": "Login successful"
    }
    ```
* **Respuestas de Error:**
    * `401 Unauthorized`: Credenciales inválidas o el usuario no es un empleado.

---

#### `GET /auth/employee/google`

Inicia el flujo de autenticación con Google para empleados.

* **Protección:** Pública
* **Petición:** Ninguna.
* **Respuesta Exitosa (`302 Found`):** Redirecciona a la página de consentimiento de Google.

---

#### `GET /auth/employee/google/callback`

Callback de Google después de una autenticación exitosa para empleados. **No** registra al empleado si no existe.

* **Protección:** Pública.
* **Petición:** Ninguna.
* **Respuesta Exitosa (`302 Found`):** Establece la cookie `access_token` y redirecciona al dashboard del frontend (ej. `http://localhost:4200/dashboard`).
* **Respuestas de Error:**
    * `401 Unauthorized`: Si el email de Google no está registrado como un empleado.

---

### Autenticación General

---

#### `POST /auth/logout`

Cierra la sesión del usuario actual (cliente o empleado).

* **Protección:** Privada (Requiere cualquier usuario autenticado).
* **Petición:** Ninguna.
* **Respuesta Exitosa (`200 OK`):** Limpia la cookie `access_token` y devuelve un mensaje de éxito.
    ```json
    {
      "message": "Logout successful"
    }
    ```

<br>

## Módulo de Gestión de Empleados (`/employees`)

---

### Gestión de Roles

---

#### `PUT /employees/:id/roles`

Actualiza los roles asignados a un empleado específico.

* **Protección:** Privada (Requiere rol `ADMIN`)
* **Parámetros de URL:**
    * `id` (string, uuid): El ID del empleado a modificar.
* **Petición (Body):** `UpdateEmployeeRolesDto`
    ```json
    {
      "roleIds": [
        "uuid-del-rol-manager-123",
        "uuid-del-rol-cajero-456"
      ]
    }
    ```
* **Respuesta Exitosa (`200 OK`):** Devuelve el objeto completo del empleado actualizado, incluyendo sus nuevos roles.
    ```json
    {
      "id": "employee-uuid-to-update-789",
      "deletedAt": null,
      "createdAt": "2025-06-13T12:00:00.000Z",
      "updatedAt": "2025-06-13T15:45:00.000Z",
      "user": {
        "id": "user-uuid-of-employee-abc",
        "first_name": "John",
        "last_name": "Smith",
        "email": "john.smith@example.com"
      },
      "roles": [
        {
          "id": "uuid-del-rol-manager-123",
          "name": "MANAGER"
        },
        {
          "id": "uuid-del-rol-cajero-456",
          "name": "CASHIER"
        }
      ]
    }
    ```
* **Respuestas de Error:**
    * `400 Bad Request`: Uno o más `roleIds` son inválidos.
    * `401 Unauthorized`: No autenticado.
    * `403 Forbidden`: No tiene el rol `ADMIN` o está intentando modificar/asignar un rol `SUPERADMIN`.
    * `404 Not Found`: No se encontró un empleado con el `id` proporcionado.