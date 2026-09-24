-- アイキャッチ画像用ストレージバケットを作成
-- 未ログインユーザーに画像を公開しないため private バケットにする
-- （公開URLは使えないので、表示には署名付きURLを発行する）
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', false)
ON CONFLICT (id) DO NOTHING;

-- 読み取り: ログインユーザーのみ
CREATE POLICY "post_images_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'post-images');

-- アップロード: 管理者のみ
CREATE POLICY "post_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND public.is_admin());

-- 更新: 管理者のみ
CREATE POLICY "post_images_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-images' AND public.is_admin());

-- 削除: 管理者のみ
CREATE POLICY "post_images_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND public.is_admin());
