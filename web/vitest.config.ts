import { defineConfig } from 'vitest/config'
import * as dotenv from 'dotenv'
import * as path from 'path'
import react from '@vitejs/plugin-react'

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '.next/**', 'e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
