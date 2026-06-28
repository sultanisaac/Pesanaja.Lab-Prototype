'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string

  if (!name?.trim()) return { error: 'Business name is required' }

  // Check if business already exists for this owner
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('businesses')
      .update({ name, description, contact_email, contact_phone, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)
    if (error) return { error: error.message }
  } else {
    // Create new
    const { error } = await supabase
      .from('businesses')
      .insert({ owner_id: user.id, name, description, contact_email, contact_phone })
    if (error) return { error: error.message }
  }

  revalidatePath('/dashboard/business/settings')
  return { success: true }
}
