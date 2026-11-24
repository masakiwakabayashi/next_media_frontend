import { z } from 'zod'

export const setUserBannedSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDが不正です'),
  banned: z.boolean(),
})

export type SetUserBannedInput = z.infer<typeof setUserBannedSchema>

export const inviteUserSchema = z.object({
  email: z.string().min(1, 'メールアドレスを入力してください').email('メールアドレスの形式が不正です'),
  displayName: z.string().trim().nullable(),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
