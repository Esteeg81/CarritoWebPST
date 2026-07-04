# CarritoWebPST — Backend

API REST para el carrito de compras. Node.js + Express + TypeScript + Prisma (SQLite).

## Setup inicial

```bash
npm install
cp .env.example .env   # y completá JWT_SECRET con un valor random largo
npm run prisma:migrate # crea la base SQLite y aplica el schema
npm run prisma:seed    # carga los productos y usuarios de prueba
```

## Desarrollo

```bash
npm run dev
```

Levanta el servidor en `http://localhost:3001` (o el `PORT` que definas en `.env`), con recarga automática.

## Tests

```bash
npm test           # corre la suite una vez
npm run coverage   # con reporte de cobertura (coverage/index.html)
```

Los tests usan una base SQLite separada (`prisma/test.db`), que se crea y sincroniza automáticamente antes de correr la suite.

## Build de producción

```bash
npm run build   # tsc -> dist/
npm start       # node dist/index.js
```

## Endpoints

| Método | Ruta                | Descripción                          | Auth |
|--------|---------------------|---------------------------------------|------|
| GET    | `/api/health`        | Chequeo de salud                      | No   |
| GET    | `/api/products`      | Lista de productos                    | No   |
| GET    | `/api/products/:id`  | Detalle de un producto                | No   |
| POST   | `/api/auth/register` | Crea una cuenta (`nombre`, `email`, `password`) | No   |
| POST   | `/api/auth/login`    | Login (`email`, `password`)           | No   |
| GET    | `/api/auth/me`       | Usuario autenticado actual            | Sí (`Authorization: Bearer <token>`) |

## Usuarios de prueba (tras correr el seed)

| Email              | Password |
|--------------------|----------|
| juan@example.com   | 1234     |
| ana@example.com    | abcd     |
