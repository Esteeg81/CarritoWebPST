import { execSync } from 'node:child_process'

export default function setup() {
  execSync('npx prisma db push --accept-data-loss --url file:./prisma/test.db', {
    stdio: 'inherit',
  })
}
