-- RLS の有効化の検証
--   public スキーマのすべてのテーブルで RLS が有効になっていることを確認する。
--   RLS が無効だとポリシーは評価されず、anon に付いている GRANT SELECT
--   （Supabase の初期設定）だけで未ログインユーザーが全行を読めてしまうため。
--   anon を対象にしたポリシーが無いことは policies_authenticated_test.sql で確認している。
--
-- 違反しているテーブルがあると「スキーマ.テーブル」の一覧が出力される。
-- 意図的に RLS を無効にしたいテーブルができた場合は、WHERE に AND tablename NOT IN (...) を追加して除外する。
--
-- 実行方法: supabase test db

BEGIN;

SELECT plan(1);

SELECT is_empty(
  $$
    SELECT schemaname || '.' || tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND NOT rowsecurity
    ORDER BY 1
  $$,
  'public のすべてのテーブルで RLS が有効になっている'
);

SELECT * FROM finish();

ROLLBACK;
