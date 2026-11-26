import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database/database.types'

// shared の読み取りクエリが受け取る Supabase クライアントの型。
// web はサーバー用（Cookie のセッション）、mobile はアプリ用（端末に保存したセッション）のクライアントを渡す。
// どちらもログインユーザーとして RLS が適用された状態で読み取る。
export type SharedSupabaseClient = SupabaseClient<Database>
