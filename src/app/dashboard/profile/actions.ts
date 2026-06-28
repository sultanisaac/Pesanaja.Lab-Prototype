'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone_number') as string

  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, phone_number: phone, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) return { error: 'Passwords do not match' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}
