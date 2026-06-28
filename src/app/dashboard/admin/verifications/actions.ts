'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateBusinessStatus(formData: FormData): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify caller is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard?error=Unauthorized')
  }

  const businessId = formData.get('business_id') as string
  const status = formData.get('status') as 'pending' | 'verified' | 'rejected'

  if (!businessId || !status) return

  const { error } = await supabase
    .from('businesses')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', businessId)

  if (error) {
    redirect(`/dashboard/admin/verifications?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/admin/verifications')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin/verifications?success=updated')
}
