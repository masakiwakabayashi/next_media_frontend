import { SupabaseClient } from '@supabase/supabase-js';

export async function deletePost(db: SupabaseClient, id: string) {
  await db.from('posts').delete().eq('id', id);
}
