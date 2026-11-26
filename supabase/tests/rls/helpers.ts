import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from 'shared/external/database/database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY!

const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
} as const

// RLS を無視してテストデータの準備・後始末を行うための service-role クライアント
export const adminClient: SupabaseClient<Database> = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  clientOptions
)

// 未ログイン状態を再現するための anon クライアント
export const anonClient: SupabaseClient<Database> = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  clientOptions
)

// supabase/seeds/00_user_seed.sql で作成されるテストユーザー
export const TEST_USERS = {
  admin: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user1@example.com',
    password: 'passwo!rd',
  },
  member: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'user2@example.com',
    password: 'passwo!rd',
  },
} as const

// 指定したテストユーザーとしてログイン済みの状態を再現するクライアントを生成する
export async function createAuthedClient(
  user: (typeof TEST_USERS)[keyof typeof TEST_USERS]
): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, clientOptions)
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })
  if (error) {
    throw new Error(`failed to sign in as ${user.email}: ${error.message}`)
  }
  return client
}
