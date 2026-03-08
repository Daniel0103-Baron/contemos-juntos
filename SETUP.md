# Guía de Configuración - Contemos Juntos

## Requisitos Previos

- Node.js v16+
- MySQL 5.7+
- npm o yarn

## Instalación del Backend

```bash
cd backend
npm install
```

### Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=malandra
DB_NAME=contemos_juntos
JWT_SECRET=una-clave-secreta-fuerte-importante
```

### Crear Base de Datos

```bash
# Desde MySQL CLI
mysql -u root -p

CREATE DATABASE contemos_juntos;
USE contemos_juntos;

-- Importar schema (si existe en el proyecto)
SOURCE path/to/schema.sql;
```

### Iniciar Backend

```bash
npm start
# o para desarrollo con nodemon
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

---

## Instalación del Frontend

```bash
cd frontend
npm install
```

### Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` si es necesario:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Iniciar Frontend (Desarrollo)

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
npm run preview
```

---

## Credenciales por Defecto

Usa estas credenciales para probar la aplicación:

- **Usuario**: admin
- **Contraseña**: (verifica en la base de datos de desarrollo)

---

## Problemas Comunes

### Error: ECONNREFUSED localhost:5000
- Verifica que el backend esté corriendo en el puerto 5000
- Checkea `VITE_API_BASE_URL` en `.env` del frontend

### Error: No database selected
- Verifica que creaste la base de datos `contemos_juntos`
- Checkea las credenciales en `.env` del backend

### Error: jwt malformed
- Verifica que `JWT_SECRET` está configurado en `.env`
- Limpia el localStorage del navegador (DevTools > Application > localStorage)

---

## Estructura Importante

```
backend/
├── config/db.js           # Conexión a BD
├── controllers/           # Lógica de negocio
├── middlewares/           # auth, validaciones
├── routes/                # Rutas de API
├── services/              # Servicios (PDF, etc)
└── server.js              # Punto de entrada

frontend/
├── src/
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas
│   ├── context/           # Estado global (Auth)
│   ├── services/          # Axios API client
│   └── App.jsx            # Enrutamiento
└── vite.config.js
```

---

## Mejoras Implementadas

✅ Validación robusta de inputs en backend
✅ Error Boundary en frontend
✅ Página 404 personalizada  
✅ Manejador global de errores en API
✅ Logout funcionalidad
✅ Variables de entorno documentadas
