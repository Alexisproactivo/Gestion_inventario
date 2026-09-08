# 📦 StockCore — Enterprise Inventory & Audit Management System

Aplicación web Full Stack para la administración y control de inventarios empresariales en tiempo real, conectada a una base de datos relacional PostgreSQL en la nube (Neon Cloud)[cite: 1]. Diseñada bajo una **Arquitectura en Capas (Layered / MVC)**[cite: 1] y los principios de diseño **SOLID**[cite: 1], integrando trazabilidad de operaciones (Activity Logging)[cite: 1], control de acceso basado en roles (RBAC)[cite: 1] y autenticación federada con Google OAuth 2.0[cite: 1].

🔗 **Demo en Producción:** [https://gestion-inventario-r1o2.onrender.com](https://gestion-inventario-r1o2.onrender.com)

---

## 🌟 Características Principales

* **Autenticación Federada:** Inicio de sesión seguro mediante **Google OAuth 2.0**, sincronizando perfil, correo y avatar oficial del usuario[cite: 1].
* **Control de Acceso Basado en Roles (RBAC):**
  * Rol `admin`: Control total para crear, editar, eliminar registros y acceder a la bitácora de auditoría[cite: 1].
  * Rol `operador` / `usuario`: Modo de solo lectura; la interfaz oculta dinámicamente los botones de modificación[cite: 1].
* **Bitácora de Auditoría en Tiempo Real (Activity Log):**
  * Trazabilidad completa de acciones (`CREACION`, `EDICION`, `ELIMINACION`)[cite: 1].
  * Registro de marcas de tiempo normalizadas (`TIMESTAMPTZ`), usuario responsable e historial descriptivo de cambios[cite: 1].
* **Consultas Optimizadas en Neon (PostgreSQL):**
  * Paginación eficiente a nivel de servidor (`LIMIT` y `OFFSET`)[cite: 1].
  * Búsqueda dinámica global insensible a mayúsculas (`ILIKE`) combinada con filtrado relacional por categorías[cite: 1].
  * Cálculo de agregaciones en base de datos (`COUNT`, `SUM`) para métricas globales de stock y valor monetario[cite: 1].
* **Interfaz Moderna (Fintech / Web3 Style):**
  * Dashboard responsivo en Dark Mode inspirado en la estética Stakent[cite: 1].
  * Construido con **Tailwind CSS**, modales nativos interactivos y renderizado reactivo con JavaScript Vanilla[cite: 1].

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Backend** | Node.js, Express.js (API REST modular)[cite: 1] |
| **Base de Datos** | PostgreSQL en la nube (Neon Serverless Cloud) con pool de conexiones `pg`[cite: 1] |
| **Autenticación** | Google OAuth 2.0[cite: 1] |
| **Frontend** | HTML5 semántico, JavaScript Vanilla (ES6+ modular, Fetch API), Tailwind CSS[cite: 1] |
| **Infraestructura / DevOps** | Render Cloud Platform (CI/CD continuo conectado a GitHub), Git[cite: 1] |

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una separación estricta de responsabilidades desacoplando la capa de acceso a datos, lógica de negocio y presentación[cite: 1]:

```text
gestion_inventario/
├── src/
│   ├── config/
│   │   └── db.js                 # Pool de conexiones a PostgreSQL (Neon)[cite: 1]
│   ├── controllers/
│   │   ├── authController.js     # Gestión de sesiones y autenticación Google OAuth
│   │   └── productoController.js # Lógica de negocio, validaciones y orquestación de auditoría[cite: 1]
│   ├── models/
│   │   ├── auditoriaModel.js     # Registro e inserción de la bitácora de auditoría[cite: 1]
│   │   ├── productoModel.js      # Consultas SQL, paginación, filtros y métricas globales[cite: 1]
│   │   └── usuarioModel.js       # Gestión de cuentas federadas y roles de usuario[cite: 1]
│   └── routes/
│       ├── authRoutes.js         # Endpoints de autenticación y callbacks de Google
│       └── productoRoutes.js     # Endpoints CRUD de productos y consulta de auditoría[cite: 1]
├── public/
│   ├── app.js                    # Consumo de API, manipulación del DOM, RBAC y modal de auditoría[cite: 1]
│   ├── bg-login.mp4              # Background multimedia de la pantalla de acceso
│   ├── index.html                # Dashboard SPA principal (estilo Fintech/Stakent)[cite: 1]
│   ├── login.html                # Portal de inicio de sesión con Google OAuth[cite: 1]
│   └── styles.css                # Reglas de estilo y animaciones complementarias
├── .env                          # Variables de entorno sensibles (no versionadas)
├── .gitignore                    # Exclusión de credenciales y dependencias
├── package-lock.json
├── package.json
├── README.md                     # Documentación técnica del proyecto
└── server.js                     # Servidor Express, middlewares y montaje de rutas[cite: 1]
```

---

## 📊 Modelo de Datos (PostgreSQL)

```sql
-- Catálogo de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    estado VARCHAR(20) DEFAULT 'disponible'
);

-- Usuarios federados y roles
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    rol VARCHAR(20) DEFAULT 'usuario',
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bitácora de auditoría (Activity Log)
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(20) NOT NULL,
    producto_id INT,
    detalles TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Endpoints de la API REST

### Productos

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/productos` | Obtiene el catálogo paginado (`pagina`, `limite`), búsqueda global (`busqueda`), filtros (`categoria`) y métricas[cite: 1] |
| `POST` | `/api/productos` | Registra un nuevo producto y genera su entrada en la auditoría[cite: 1] |
| `PUT` | `/api/productos/:id` | Actualiza un producto existente y documenta los cambios en la bitácora[cite: 1] |
| `DELETE` | `/api/productos/:id` | Elimina un registro y registra la baja en auditoría[cite: 1] |

### Auditoría

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/productos/auditoria/historial` | Consulta las últimas 30 acciones registradas cruzadas con los datos del usuario (`LEFT JOIN`)[cite: 1] |

---

## 🔐 Seguridad y Buenas Prácticas

* **Consultas Parametrizadas:** Protección completa contra inyecciones SQL usando marcadores posicionales (`$1`, `$2`, ...) en el driver `pg`[cite: 1].
* **Control de Acceso en Frontend:** Guardia de sesión reactiva en `index.html` que expulsa al login si no existe token en `localStorage`[cite: 1].
* **Sincronización de Zona Horaria:** Implementación de `TIMESTAMPTZ` en PostgreSQL y conversión a hora local (`America/Lima`) en la interfaz[cite: 1].
* **Validación de Negocio:** Verificación estricta de campos obligatorios y rangos no negativos antes de ejecutar cualquier transacción[cite: 1].

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/Alexisproactivo/Gestion_inventario.git](https://github.com/Alexisproactivo/Gestion_inventario.git)
   cd Gestion_inventario
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**  
   Crea un archivo `.env` en la raíz del proyecto con:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://usuario:password@endpoint-neon.tech/neondb?sslmode=require
   ```

4. **Iniciar el servidor:**
   ```bash
   node server.js
   ```
   Abrir en el navegador: [http://localhost:3000](http://localhost:3000)