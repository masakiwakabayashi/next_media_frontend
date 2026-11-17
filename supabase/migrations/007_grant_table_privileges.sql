-- テーブル権限を明示的に付与する
-- ローカルの Supabase は public スキーマのテーブルへ anon / authenticated / service_role の権限を
-- 自動で付与するが、本番プロジェクトでは付与されず、PostgREST が 403（42501 permission denied）を返していた。
-- 行単位のアクセス制御は RLS（003 / 006）で行い、ここではテーブルへのアクセス自体を許可する。
-- 未ログインユーザーには閲覧させない方針のため、anon には付与しない。

GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles,
  public.categories,
  public.tags,
  public.posts,
  public.post_tags,
  public.collections,
  public.collection_posts
TO authenticated;

-- service_role は RLS をバイパスするが、テーブル権限は別途必要
GRANT ALL ON
  public.profiles,
  public.categories,
  public.tags,
  public.posts,
  public.post_tags,
  public.collections,
  public.collection_posts
TO service_role;
