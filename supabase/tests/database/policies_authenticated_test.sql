-- RLS ポリシーの対象ロールの検証
--   public / storage スキーマのすべてのポリシーが TO authenticated になっていることを確認する。
--   TO を省略すると public（anon を含む全ロール）が対象になり、
--   未ログインユーザーにもポリシーが評価されてしまうため。
--
-- 違反しているポリシーがあると「スキーマ.テーブル / ポリシー名 (ロール)」の一覧が出力される。
-- 意図的に anon へ許可したいポリシーができた場合は、WHERE に AND policyname NOT IN (...) を追加して除外する。
--
-- 実行方法: supabase test db

BEGIN;

SELECT plan(1);

SELECT is_empty(
  $$
    SELECT schemaname || '.' || tablename || ' / ' || policyname || ' (' || array_to_string(roles, ', ') || ')'
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND NOT (roles <@ ARRAY['authenticated']::name[])
    ORDER BY 1
  $$,
  'public / storage のすべてのポリシーが TO authenticated になっている'
);

SELECT * FROM finish();

ROLLBACK;
