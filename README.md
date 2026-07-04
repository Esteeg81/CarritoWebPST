# CarritoWebPST

Proyecto de carrito de compras (hobby / primer proyecto en React), con un backend propio en Node.js.

**Demo:** https://esteeg81.github.io/CarritoWebPST/

## Stack

**Frontend** (`/`)
- React + Vite + TypeScript
- Tailwind CSS v4
- React Router (`HashRouter`, por compatibilidad con GitHub Pages)
- Context API para carrito y autenticación
- Vitest + React Testing Library

**Backend** (`/server`)
- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- JWT + bcrypt para autenticación
- Vitest + Supertest

## Desarrollo

### Frontend

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # tests unitarios
npm run coverage  # tests con reporte de cobertura
npm run build     # type-check + build de producción
```

### Backend

Ver [`server/README.md`](./server/README.md) para el setup completo (variables de entorno, migraciones, seed de datos).

```bash
cd server
npm install
npm run dev   # http://localhost:3001
npm test
```

> Nota: por ahora el frontend sigue usando datos mockeados (`src/data/*.json` + `localStorage`) — la conexión al backend real es el próximo paso.

## Deploy

El frontend se publica automáticamente en GitHub Pages en cada push a `main` (ver `.github/workflows/deploy-pages.yml`).
