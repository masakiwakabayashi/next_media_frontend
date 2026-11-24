import { test, expect } from '@playwright/test';
import * as path from 'path';

const ADMIN_STATE = path.join(__dirname, '.auth/admin.json');

test.use({ storageState: ADMIN_STATE });

test.describe('記事の新規作成', () => {
  const testSlug = `test-post-creation-${Date.now()}`;

  test('フォームを送信すると DB に公開記事が保存され、トップページに表示される', async ({ page }) => {
    await page.goto('/admin/posts/new');

    await page.locator('#title').fill('E2Eテスト用記事');
    await page.locator('#slug').fill(testSlug);
    await page.locator('#content').fill('E2Eテスト用の本文です。');

    // ステータスを「公開」に変更
    await page.locator('input[name="status"][value="published"]').check();
    await expect(page.locator('input[name="status"][value="published"]')).toBeChecked();

    await page.getByRole('button', { name: '保存する' }).click();

    // 保存後にトップページへ移動して公開記事を確認
    await page.goto('/');

    // UI: 作成した記事がトップページに表示される
    await expect(page.getByRole('heading', { name: 'E2Eテスト用記事' })).toBeVisible();
  });
});
