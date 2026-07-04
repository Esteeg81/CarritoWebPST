# CarritoWebPST

Proyecto de carrito de compras (hobby / primer proyecto en React), con un backend propio en Node.js.

**Demo:** https://esteeg81.github.io/CarritoWebPST/

## Stack

**Frontend** (`/`)
- React + Vite + TypeScript
- Tailwind CSS v4
- React Router (`HashRouter`, por compatibilidad con GitHub Pages)
- Context API para carrito (con persistencia en `localStorage`) y autenticación
- Vitest + React Testing Library

**Backend** (`/server`)
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT + bcrypt para autenticación
- Vitest + Supertest

El frontend consume la API real del backend (productos, login, registro) — ya no hay datos mockeados en el cliente.

## Desarrollo

### Frontend

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # tests unitarios
npm run coverage  # tests con reporte de cobertura
npm run build     # type-check + build de producción
```

Por defecto apunta a `http://localhost:3001`. Para usar otra URL de API, definí `VITE_API_URL` en un `.env`.

### Backend

Ver [`server/README.md`](./server/README.md) para el setup completo (base de datos, variables de entorno, migraciones, seed de datos, deploy).

```bash
cd server
npm install
npm run dev   # http://localhost:3001
npm test
```

## Deploy

- **Frontend**: se publica automáticamente en GitHub Pages en cada push a `main` (ver `.github/workflows/deploy-pages.yml`). La URL del backend en producción se inyecta vía la variable de repositorio `VITE_API_URL` (Settings → Secrets and variables → Actions → Variables).
- **Backend**: pensado para desplegarse en [Render](https://render.com) usando el `render.yaml` de este repo como Blueprint — ver instrucciones en [`server/README.md`](./server/README.md#deploy-en-render).
