import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  sourcemap: true,
  clean: true,
  noExternal: ['@saas/auth', '@saas/env'],
})
