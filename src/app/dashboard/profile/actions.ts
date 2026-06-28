'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone_number') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      phone_number: phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/business')
  revalidatePath('/dashboard/customer')
  
  redirect('/dashboard/profile?success=profile')
}

export async function updatePassword(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    redirect('/dashboard/profile?error=New+passwords+do+not+match')
  }

  // Next.js App Router limitation: We can't verify current password without signing in again,
  // but Supabase auth.updateUser() requires the session. Since we're just updating the password 
  // via the server client for the authenticated user, we rely on the session token.
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) redirect(`/dashboard/profile?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/dashboard/profile')
  
  redirect('/dashboard/profile?success=password')
}
