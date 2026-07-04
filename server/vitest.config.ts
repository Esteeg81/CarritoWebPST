import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: './src/test/globalSetup.ts',
    setupFiles: ['./src/test/setup.ts'],
    fileParallelism: false,
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://carrito:carrito_dev_pw@localhost:5432/carritowebpst_test',
      JWT_SECRET: 'test-secret-not-for-production-use-only-in-vitest',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/test/**', 'src/generated/**', 'src/index.ts'],
    },
  },
})
