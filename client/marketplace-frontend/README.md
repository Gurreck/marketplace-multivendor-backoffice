# Proyecto Corto #5 - Pruebas Unitarias en Stack MERN

## Descripción
Este proyecto implementa pruebas unitarias en una aplicación MERN existente con el objetivo de validar el correcto funcionamiento del backend y frontend, asegurando calidad del software y manejo correcto de errores.

## Objetivo
Aplicar pruebas unitarias sobre el proyecto final del curso, utilizando Jest, Supertest y React Testing Library para verificar el comportamiento del sistema.

## Herramientas utilizadas
- Jest
- Supertest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event

## Backend
Se implementaron pruebas unitarias sobre endpoints funcionales del servidor.

### Archivos de prueba
- `server/tests/auth.test.js`
- `server/tests/products.test.js`
- `server/tests/categories.test.js`

### Cobertura del backend
Se validaron:
- Códigos de estado HTTP
- Validación de datos de entrada
- Manejo de errores
- Respuestas para rutas existentes e inexistentes

### Endpoints probados
- `GET /api/auth/profile`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `GET /api/categories`

## Frontend
Se implementaron pruebas unitarias en componentes de React.

### Archivos de prueba
- `client/marketplace-frontend/src/App.test.js`
- `client/marketplace-frontend/src/__tests__/IniciarSesion.test.js`
- `client/marketplace-frontend/src/__tests__/Resena.test.js`

### Cobertura del frontend
Se validó:
- Renderizado de componentes
- Interacción del usuario
- Estados internos de los componentes

## Total de pruebas
Se realizaron 21 pruebas en total:
- Backend: 12 pruebas
- Frontend: 9 pruebas

## Cómo ejecutar las pruebas

### Backend
```bash
npm test