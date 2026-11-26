import { defineConfig } from 'vitest/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

// supabase/tests（RLS テスト）専用の設定。Web のユニットテストは web/vitest.config.ts を使う。
// 接続先はローカル Supabase。値は web/.env.test から読む（CI では環境変数で渡す）
dotenv.config({ path: path.resolve(__dirname, 'web/.env.test') })

export default defineConfig({
  test: {
    include: ['supabase/tests/**/*.test.ts'],
    environment: 'node',
  },
})
