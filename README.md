# 📦 Sistema de Gestión de Inventario (Full Stack)

Aplicación web para control de inventario con sincronización en tiempo real a una base de datos relacional PostgreSQL en la nube (Neon), construida siguiendo una **Arquitectura en Capas (Layered Architecture)** para garantizar escalabilidad, seguridad y separación de responsabilidades.

🔗 **Demo en vivo:** [https://gestion-inventario-r1o2.onrender.com](https://gestion-inventario-r1o2.onrender.com)

---

## 🛠️ Tecnologías Utilizadas

* **Entorno de ejecución:** Node.js
* **Backend:** Express.js (API REST modular)
* **Base de Datos:** PostgreSQL en la nube ([Neon Cloud](https://neon.tech))
* **Frontend:** HTML5 semántico, JavaScript vanilla moderno (`fetch`), Tailwind CSS
* **Despliegue:** Render Cloud Platform

---

## 🏛️ Arquitectura del Proyecto

El sistema implementa el principio de **Responsabilidad Única (SOLID)** desacoplando la lógica de negocio, el acceso a datos y las rutas:

\`\`\`text
gestion_inventario/
├── src/
│   ├── config/          # Instancia y pool de conexión a PostgreSQL
│   ├── models/          # Capa de Acceso a Datos (consultas SQL parametrizadas)
│   ├── controllers/     # Capa Lógica de Negocio y validaciones de entrada
│   └── routes/          # Definición de endpoints y métodos HTTP
├── public/              # Interfaz de usuario (Single Page Dashboard)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env                 # Variables de entorno seguras (no versionadas)
├── server.js            # Punto de entrada y montaje de middlewares
└── package.json
\`\`\`

---

## 🔐 Seguridad y Buenas Prácticas

* **Consultas Parametrizadas:** Protección total contra ataques de inyección SQL mediante el uso de `$1, $2, ...` en el driver `pg`.
* **Variables de Entorno:** Credenciales sensibles aisladas fuera del control de versiones mediante `dotenv` y `.gitignore`.
* **Validación de Negocio:** Verificación estricta de parámetros en la capa de controladores antes de interactuar con la base de datos.

---

## 🚀 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/productos` | Obtiene la lista completa de productos |
| `POST` | `/api/productos` | Registra un nuevo producto |
| `PUT` | `/api/productos/:id` | Actualiza un producto existente |
| `DELETE` | `/api/productos/:id` | Elimina un producto por su identificador |

---

## 💻 Ejecución en Local

1. Clonar el repositorio:
   \`\`\`bash
   git clone https://github.com/Alexisproactivo/Gestion_inventario.git
   cd Gestion_inventario
   \`\`\`

2. Instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Configurar el archivo `.env` en la raíz:
   \`\`\`env
   DATABASE_URL=tu_cadena_de_conexion_a_postgresql
   PORT=3000
   \`\`\`

4. Iniciar el servidor:
   \`\`\`bash
   node server.js
   \`\`\`