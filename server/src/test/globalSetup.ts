import { execSync } from 'node:child_process'

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://carrito:carrito_dev_pw@localhost:5432/carritowebpst_test'

export default function setup() {
  execSync(`npx prisma db push --accept-data-loss --url "${TEST_DATABASE_URL}"`, {
    stdio: 'inherit',
  })
}
