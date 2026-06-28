'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function removeFavorite(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const favoriteId = formData.get('favorite_id') as string
  if (!favoriteId) return

  await supabase
    .from('favorites')
    .delete()
    .eq('id', favoriteId)
    .eq('customer_id', user.id) // safety: only own favorites

  revalidatePath('/dashboard/customer/favorites')
}
