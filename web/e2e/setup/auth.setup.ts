import { test as setup } from '@playwright/test';
import * as path from 'path';

const ADMIN_STATE = path.join(__dirname, '../.auth/admin.json');
const USER_STATE = path.join(__dirname, '../.auth/user.json');

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user1@example.com');
  await page.locator('#password').fill('passwo!rd');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'));
  await page.context().storageState({ path: ADMIN_STATE });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('user2@example.com');
  await page.locator('#password').fill('passwo!rd');
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL((url) => !url.href.includes('/login'));
  await page.context().storageState({ path: USER_STATE });
});
