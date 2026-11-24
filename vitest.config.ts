import { defineConfig } from 'vitest/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

// supabase/tests/rls（RLS テスト）専用の設定。Web のユニットテストは web/vitest.config.ts を使う。
// 接続先はローカル Supabase。値は web/.env.test から読む（CI では環境変数で渡す）
dotenv.config({ path: path.resolve(__dirname, 'web/.env.test') })

export default defineConfig({
  resolve: {
    alias: {
      // helpers.ts が DB の型（web/external/database/database.types.ts）を参照するため
      '@': path.resolve(__dirname, 'web'),
    },
  },
  test: {
    include: ['supabase/tests/**/*.test.ts'],
    environment: 'node',
  },
})
