# Sistema de Gestión de Usuarios (MyTeam)

Este proyecto es una API REST backend escrita en **Go** para la gestión de usuarios, roles y empresas. Está diseñado siguiendo los principios de **Clean Architecture** para garantizar escalabilidad y mantenibilidad, evitando el uso de frameworks pesados para el servidor HTTP.

## 🚀 Características

- Gestión de **Empresas** (Creación, Lectura, Actualización, Borrado).
- Gestión de **Usuarios** asignados a empresas.
- Gestión de **Contratos** laborales (Solo Admin).
- Roles de usuario: `ADMIN` y `EMPLOYEE`.
- Arquitectura hexagonal (Ports & Adapters).
- Persistencia en **PostgreSQL**.
- Migraciones SQL nativas.

## 🛠️ Tecnologías

- **Lenguaje**: Go 1.22+ (aprovechando el nuevo `http.ServeMux`).
- **Base de Datos**: PostgreSQL.
- **Drivers**: `lib/pq`.
- **Contenedores**: Docker & Docker Compose.

## 📂 Estructura del Proyecto

El proyecto sigue el estándar de estructura de proyectos en Go:

```
myteam/
├── cmd/api/            # Punto de entrada de la aplicación (main.go)
├── internal/
│   ├── domain/         # Entidades de negocio (Company, User, Contract) y Errores
│   ├── port/           # Interfaces (Puertos) para Repositorios y Servicios
│   ├── service/        # Lógica de negocio (Casos de Uso)
│   ├── adapter/        # Implementaciones (Adaptadores)
│   │   ├── handler/    # Controladores HTTP
│   │   └── storage/    # Implementación de persistencia (Postgres)
├── migrations/         # Scripts SQL de creación de tablas
├── web/                # Frontend React + Vite
└── docker-compose.yaml # Configuración de BBDD y herramientas
```

## ⚙️ Configuración y Ejecución

### 1. Iniciar Base de Datos
El proyecto incluye un archivo `docker-compose.yaml` para levantar PostgreSQL y Adminer.

```bash
docker-compose up -d db
```
> **Nota**: El servicio `adminer` está configurado en el puerto `8080` en el `docker-compose.yaml`. La aplicación Go también usa el puerto `8080` por defecto. Asegúrate de detener Adminer o cambiar el puerto en `docker-compose.yaml` si quieres ejecutar la API en el mismo puerto, o simplemente levanta solo la BBDD (`docker-compose up -d db`).

### 2. Ejecutar la Aplicación
Puedes ejecutar la aplicación localmente usando `go run`. La aplicación intentará conectar a postgres en `localhost:5432` por defecto.

**Variables de Entorno (Opcionales):**
- `DB_HOST`: Host de la BBDD (default: localhost).
- `DB_USER`: Usuario (default: postgres).
- `DB_PASS`: Contraseña (default: postgres).
- `DB_NAME`: Nombre de la BBDD (default: myteam).

**Ejecución:**
```bash
go run cmd/api/main.go
```

### 3. Migraciones
La primera vez que arranques, necesitarás crear las tablas. Puedes usar un cliente SQL o el propio Adminer.

Script ubicación: `migrations/schema.sql`.

## 📡 API Endpoints

### Empresas

- **Crear Empresa**
  - `POST /companies`
  - Body: `{"name": "Tech Corp", "cif": "B12345678"}`

- **Obtener Empresa**
  - `GET /companies/{id}`

### Usuarios

- **Crear Usuario**
  - `POST /users`
  - Body: `{"company_id": "uuid...", "name": "Alice", "email": "alice@email.com", "password": "pass", "role": "ADMIN"}`

- **Obtener Usuario**
  - `GET /users/{id}`

- **Actualizar Usuario**
  - `PUT /users/{id}`
  - Body: `{"name": "...", "email": "...", "role": "..."}`

- **Borrar Usuario**
  - `DELETE /users/{id}`

- **Listar Usuarios de una Empresa**
  - `GET /companies/{companyID}/users`

- **Crear Usuarios Masivamente (Batch)**
  - `POST /companies/{companyID}/users/batch`
  - Body: `[{"name": "...", ...}, ...]`

### Contratos (Admin Only)

- **Crear Contrato**
  - `POST /users/{userID}/contracts`
  - Body: `{"start_date": "2024-01-01", "type": "Indefinido", "position": "Dev", "salary": 30000}`

- **Listar Contratos de Usuario**
  - `GET /users/{userID}/contracts`

- **Actualizar Contrato**
  - `PUT /contracts/{id}`

- **Borrar Contrato**
  - `DELETE /contracts/{id}`

## ✅ Pruebas
Puedes probar los endpoints usando `curl`:

```bash
# Crear Empresa
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -d '{"name": "My Company", "cif": "ESD123"}'

# (Copia el ID de la respuesta) --> <ID_EMPRESA>

# Crear Usuario
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"company_id": "<ID_EMPRESA>", "name": "Roberto", "email": "roberto@email.com", "password": "123", "role": "ADMIN"}'

# Crear Usuarios Masivamente
curl -X POST http://localhost:8080/companies/<ID_EMPRESA>/users/batch \
  -H "Content-Type: application/json" \
  -d '[{"name": "Empleado1", "email": "emp1@email.com", "password": "123", "role": "EMPLOYEE"}, {"name": "Empleado2", "email": "emp2@email.com", "password": "123", "role": "EMPLOYEE"}]'
```
