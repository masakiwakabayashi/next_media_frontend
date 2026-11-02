-- これでユーザーのデータが入る
begin;

-- auth.users への INSERT で public.profiles を自動生成するトリガー(on_auth_user_created)を
-- 一時的に止める。seed 実行ロール(postgres)は auth.users のオーナーではなく
-- ALTER TABLE ... DISABLE TRIGGER が使えないため、レプリケーションロールで無効化する。
-- SET LOCAL なのでトランザクション終了時に自動で元へ戻る。
SET LOCAL session_replication_role = 'replica';

-- ※テストユーザー1だけは管理者
WITH credentials(id, mail, pass, name, is_admin) AS (
  SELECT * FROM (VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'user1@example.com', 'passwo!rd', 'テストユーザー1', TRUE),
    ('123e4567-e89b-12d3-a456-426614174001', 'user2@example.com', 'passwo!rd', 'テストユーザー2', FALSE)
  ) AS users(id, mail, pass, name, is_admin)
),
create_user AS (
  INSERT INTO auth.users (id, instance_id, ROLE, aud, email, raw_app_meta_data, raw_user_meta_data, is_super_admin, encrypted_password, created_at, updated_at, last_sign_in_at, email_confirmed_at, confirmation_sent_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    SELECT
      id::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      mail,
      CASE
        WHEN is_admin THEN '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb
        ELSE '{"provider":"email","providers":["email"]}'::jsonb
      END,
      json_build_object('display_name', name),
      FALSE,
      crypt(pass, gen_salt('bf')),
      NOW(), NOW(), NOW(), NOW(), NOW(), '', '', '', ''
    FROM credentials
  RETURNING id
)
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT gen_random_uuid(), id, id, json_build_object('sub', id), 'email', NOW(), NOW(), NOW() FROM create_user;

-- テストユーザーのプロフィールを明示的に作成する。
-- user1(123e4567-...174000)は 01_blog_seed.sql で全記事の著者になっている
-- 山田太郎プロフィール(a1b2c3d4-...)と同一人物として紐付ける。
INSERT INTO public.profiles (id, user_id, display_name, bio)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '123e4567-e89b-12d3-a456-426614174000', '山田太郎', '東京を中心にグルメ情報を発信中。'),
  ('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', 'テストユーザー2', NULL)
ON CONFLICT (id) DO UPDATE
SET user_id = excluded.user_id,
    display_name = excluded.display_name;

-- レプリケーションロールを元に戻す(SET LOCAL のため commit 時にも自動復帰する)
SET LOCAL session_replication_role = 'origin';


commit;

