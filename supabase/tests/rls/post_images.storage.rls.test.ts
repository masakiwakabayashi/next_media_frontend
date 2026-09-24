import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { adminClient, anonClient, createAuthedClient, TEST_USERS } from './helpers'

// supabase/migrations/004_create_post_images_storage.sql の post-images バケットに対するポリシーを検証する
// - private バケットのため公開URLでは取得できない
// - select（ダウンロード・署名付きURLの発行）: 全認証ユーザーが可能（未ログインユーザーは不可）

const BUCKET = 'post-images'

describe('post-images storage RLS', () => {
  const objectPath = `rls-test/${randomUUID()}.png`

  beforeAll(async () => {
    const { error } = await adminClient.storage
      .from(BUCKET)
      .upload(objectPath, new Blob(['rls-test'], { type: 'image/png' }))

    if (error) {
      throw new Error(`fixture画像のアップロードに失敗しました: ${error.message}`)
    }
  })

  afterAll(async () => {
    await adminClient.storage.from(BUCKET).remove([objectPath])
  })

  describe('公開URL', () => {
    it('公開URLでは画像を取得できない', async () => {
      const { data } = anonClient.storage.from(BUCKET).getPublicUrl(objectPath)
      const response = await fetch(data.publicUrl)

      expect(response.ok).toBe(false)
    })
  })

  describe('SELECT', () => {
    it('未ログインユーザーは画像をダウンロードできない', async () => {
      const { data, error } = await anonClient.storage.from(BUCKET).download(objectPath)

      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })

    it('未ログインユーザーは署名付きURLを発行できない', async () => {
      const { data, error } = await anonClient.storage
        .from(BUCKET)
        .createSignedUrl(objectPath, 60)

      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })

    it('一般ユーザーは画像をダウンロードできる', async () => {
      const client = await createAuthedClient(TEST_USERS.member)
      const { data, error } = await client.storage.from(BUCKET).download(objectPath)

      expect(error).toBeNull()
      expect(data).not.toBeNull()
    })

    it('一般ユーザーが発行した署名付きURLで画像を取得できる', async () => {
      const client = await createAuthedClient(TEST_USERS.member)
      const { data, error } = await client.storage
        .from(BUCKET)
        .createSignedUrl(objectPath, 60)

      expect(error).toBeNull()
      expect(data?.signedUrl).toBeTruthy()

      const response = await fetch(data!.signedUrl)
      expect(response.ok).toBe(true)
    })
  })
})
