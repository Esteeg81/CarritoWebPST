# CarritoWebPST — Backend

API REST para el carrito de compras. Node.js + Express + TypeScript + Prisma (PostgreSQL).

## Setup inicial

Necesitás una base PostgreSQL corriendo (local o remota). Para levantar una local rápido:

```bash
# Con Docker
docker run -d --name carrito-postgres \
  -e POSTGRES_USER=carrito -e POSTGRES_PASSWORD=carrito_dev_pw \
  -e POSTGRES_DB=carritowebpst -p 5432:5432 postgres:16-alpine

# o instalando Postgres directamente (Ubuntu/Debian)
sudo apt-get install -y postgresql
sudo -u postgres psql -c "CREATE USER carrito WITH PASSWORD 'carrito_dev_pw' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE carritowebpst OWNER carrito;"
```

Luego:

```bash
npm install
cp .env.example .env   # completá DATABASE_URL y un JWT_SECRET random largo
npm run prisma:migrate # aplica el schema
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

Los tests usan una base separada (`carritowebpst_test` por defecto, o `TEST_DATABASE_URL` si la definís), que se sincroniza automáticamente antes de correr la suite.

## Build de producción

```bash
npm run build   # tsc -> dist/
npm start       # node dist/index.js
```

## Deploy en Render

Este repo incluye un `render.yaml` (en la raíz) listo para usar como Blueprint:

1. Entrá a [render.com](https://render.com), creá una cuenta (no pide tarjeta para el free tier).
2. **New** → **Blueprint** → conectá el repo `Esteeg81/CarritoWebPST`.
3. Render lee `render.yaml` y crea automáticamente:
   - una base PostgreSQL gratis (`carritowebpst-db`)
   - un Web Service gratis (`carritowebpst-api`) apuntando a `server/`, con `DATABASE_URL` conectado a esa base y un `JWT_SECRET` generado automáticamente
4. Al terminar el primer deploy, correr el seed una vez desde el **Shell** de Render (pestaña del servicio):
   ```bash
   npx tsx prisma/seed.ts
   ```
5. Copiar la URL pública que asigna Render (algo como `https://carritowebpst-api.onrender.com`) y configurarla como `VITE_API_URL` en el frontend.

> Nota: el free tier de Render "duerme" el servicio tras 15 min sin tráfico — el primer request después tarda ~30-60s en responder mientras arranca de nuevo.

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
