-- 特集
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  image_path text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_slug_idx on public.collections (slug);
create index collections_status_published_at_idx on public.collections (status, published_at desc);

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

-- 特集 × 記事（多対多、表示順あり）
create table public.collection_posts (
  collection_id uuid not null references public.collections(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, post_id)
);

create unique index collection_posts_order_idx on public.collection_posts (collection_id, position);
create index collection_posts_post_id_idx on public.collection_posts (post_id);

-- RLS を有効化
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_posts ENABLE ROW LEVEL SECURITY;

-- collections: 公開済みは全認証ユーザー、下書きは管理者のみ（未ログインユーザーは閲覧不可）
CREATE POLICY "collections_select"
  ON public.collections FOR SELECT
  TO authenticated
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "collections_insert"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "collections_update"
  ON public.collections FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "collections_delete"
  ON public.collections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- collection_posts: 読み取りは全認証ユーザー（collections/posts の RLS で下書きへのアクセスは制限される）
-- 書き込みは管理者のみ（未ログインユーザーは閲覧不可）
CREATE POLICY "collection_posts_select"
  ON public.collection_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "collection_posts_insert"
  ON public.collection_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "collection_posts_update"
  ON public.collection_posts FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "collection_posts_delete"
  ON public.collection_posts FOR DELETE TO authenticated USING (public.is_admin());
