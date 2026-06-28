'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateBusinessProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const description = formData.get('description') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string

  if (!name) redirect('/dashboard/business/settings?error=Business+name+is+required')

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('businesses')
      .update({ name, description, contact_email, contact_phone, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)
  } else {
    await supabase
      .from('businesses')
      .insert({ owner_id: user.id, name, description, contact_email, contact_phone })
  }

  revalidatePath('/dashboard/business/settings')
  redirect('/dashboard/business/settings?success=1')
}

export async function updateOperatingHours(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const operating_hours_str = formData.get('operating_hours') as string
  if (!operating_hours_str) return { error: 'Invalid data' }

  try {
    const operating_hours = JSON.parse(operating_hours_str)
    const { error } = await supabase
      .from('businesses')
      .update({ operating_hours, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)

    if (error) return { error: error.message }
    
    revalidatePath('/dashboard/business/settings')
    revalidatePath('/business/[id]', 'page')
    return { success: true }
  } catch (err: any) {
    return { error: 'Failed to update operating hours' }
  }
}

