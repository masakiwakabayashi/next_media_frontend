// public スキーマの全テーブルに RLS テスト（supabase/tests/rls/<テーブル名>.rls.test.ts）が
// あるかを、起動中のローカル Supabase の DB に問い合わせて確認する。
// マイグレーションで追加したテーブルのテスト漏れを CI で検出するためのもの。
// 事前に `supabase start` が必要。
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const RLS_TEST_DIR = path.join(ROOT, 'supabase/tests/rls')

// 意図的に RLS テストを置かないテーブル（理由をコメントで残すこと）
const IGNORED_TABLES = []

function getProjectId() {
  const config = readFileSync(path.join(ROOT, 'supabase/config.toml'), 'utf8')
  const match = config.match(/^project_id\s*=\s*"([^"]+)"/m)
  if (!match) {
    throw new Error('supabase/config.toml に project_id がありません')
  }
  return match[1]
}

function getPublicTables() {
  const container = `supabase_db_${getProjectId()}`
  const sql = "select tablename from pg_tables where schemaname = 'public' order by tablename"

  let output
  try {
    output = execFileSync(
      'docker',
      ['exec', container, 'psql', '-U', 'postgres', '-tAc', sql],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    )
  } catch (error) {
    console.error(`DB コンテナ ${container} に接続できません。supabase start を実行してください。`)
    console.error(error.stderr || error.message)
    process.exit(1)
  }

  return output.split('\n').map((line) => line.trim()).filter(Boolean)
}

const tables = getPublicTables()

if (tables.length === 0) {
  console.error('public スキーマにテーブルが見つかりません。マイグレーションが適用されているか確認してください。')
  process.exit(1)
}

const missing = tables
  .filter((table) => !IGNORED_TABLES.includes(table))
  .filter((table) => !existsSync(path.join(RLS_TEST_DIR, `${table}.rls.test.ts`)))

if (missing.length > 0) {
  console.error('RLS テストがないテーブルがあります:')
  for (const table of missing) {
    console.error(`  - ${table} (supabase/tests/rls/${table}.rls.test.ts を追加してください)`)
  }
  process.exit(1)
}

console.log(`すべてのテーブル（${tables.length} 件）に RLS テストがあります。`)
