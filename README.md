# Sistema de Control y Trazabilidad de Ayudas Humanitarias

Aplicación web integral para la gestión, inventario, auditoría y distribución de ayudas humanitarias. Desarrollada con Node.js, Express, MySQL y React.

## Requisitos Previos

- **Node.js**: v18+ recomendado
- **MySQL**: Servidor activo con la base de datos `contemos_juntos` importada.

## Configuración y Ejecución Local

Este proyecto consta de dos partes principales separadas: `frontend` (React) y `backend` (Node.js).

### 1. Backend (API REST)

1. Abre una terminal y navega hasta la carpeta `backend/`.
2. Instala las dependencias:
   ```bash
   cd backend
   npm install
   ```
3. Configura las variables de entorno:
   - Toma el archivo `.env.example`, cópialo y renómbralo a `.env`.
   - Ajusta los datos de conexión según tu configuración local de MySQL (El archivo `.env` ya viene preconfigurado para localhost en base a lo solicitado).
4. Inicia el servidor de desarrollo:
   ```bash
   node server.js
   ```
   *El servidor correrá por defecto en http://localhost:5000*

### 2. Frontend (Aplicación React)

1. Abre **otra** terminal y navega hasta la carpeta `frontend/`.
2. Instala las dependencias:
   ```bash
   cd frontend
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible usualmente en http://localhost:5173*

## Usuarios por Defecto (Para Pruebas Iniciales)

Como el sistema está conectado a tu base de datos existente, puedes iniciar sesión con los usuarios que ya tienes en la tabla `usuarios`.
- El sistema intentará validar el login contra los campos `email` o `username` y `password`.

## Tecnologías Utilizadas

- **Frontend:** React, React Router, Vite, Axios, y Lucide React (Íconos). Estilización nativa profesional en CSS.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL (driver `mysql2/promise`).
- **Seguridad:** JWT (Json Web Tokens) para sesiones y middlewares de control de roles.
- **Reportes:** PDFKit (Generación de comprobantes de entrega inyectados directo al navegador).

## Principales Funcionalidades

- **Dashboard Segmentado:** Vistas protegidas que cambian dinámicamente según el `rol_id` (Administrador, Operador, Donante, Auditor).
- **Control de Inventario Strict:** Bloqueo de entregas sin inventario en lote específico. Trazabilidad de ingresos/salidas.
- **Prevención de Duplicidad:** Validación estructural que previene entregas repetidas a una misma familia en un periodo específico.
- **Comprobantes Auditables:** Generación de PDF interactivos para firma física.
