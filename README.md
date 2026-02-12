# Marketplace Multivendor - Backoffice & Frontend

Este proyecto consiste en una plataforma de Marketplace (estilo Amazon/MercadoLibre) con paneles para:

- **Clientes**: Compras, carrito, perfil.
- **Vendedores**: Gestión de productos propios.
- **Administradores**: Gestión de usuarios y productos global.

## Estructura del Proyecto

- `server/`: Backend (Node.js, Express, MongoDB).
- `client/marketplace-frontend/`: Frontend (React.js).

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (Instalado y corriendo localmente)

## Instalación y Ejecución

Debes correr el backend y el frontend en **dos terminales separadas**.

### 1. Configuración del Backend

1.  Navega a la carpeta del servidor:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno:
    - Copia el archivo de ejemplo:
      ```bash
      cp .env.example .env
      ```
      (O crea un archivo `.env` manualmente con el contenido de `.env.example`)
    - Asegúrate de que `MONGODB_URI` apunte a tu base de datos local (por defecto `mongodb://127.0.0.1:27017/marketplace_db`).
4.  (Opcional) Inicializa la base de datos con un usuario administrador:
    ```bash
    npm run seed
    ```
5.  Inicia el servidor:
    ```bash
    npm run dev
    ```
    Deberías ver: `Servidor corriendo en puerto 5000` y `MongoDB conectado`.

### 2. Configuración del Frontend

1.  Navega a la carpeta del cliente (en una nueva terminal):
    ```bash
    cd client/marketplace-frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno:
    - Copia el archivo de ejemplo:
      ```bash
      cp .env.example .env
      ```
4.  Inicia la aplicación:
    ```bash
    npm start
    ```
    Se abrirá automáticamente en `http://localhost:3000`.

## Uso

- **Vista Pública**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/login`
- **Registro**: `http://localhost:3000/register`

### Usuarios de Prueba (si corriste `npm run seed`)

- **Admin**: `admin@marketplace.com` / `admin123`
