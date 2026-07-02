'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
export async function submitUpgradeRequest(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the user is actually a customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'customer') {
    redirect('/dashboard?error=not_customer')
  }

  const business_name = (formData.get('business_name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const contact_email = (formData.get('contact_email') as string)?.trim()
  const contact_phone = (formData.get('contact_phone') as string)?.trim()

  if (!business_name) {
    redirect('/dashboard/customer?error=Business+name+is+required')
  }

  // Check for existing pending request
  const { data: existing } = await supabase
    .from('business_upgrade_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single()

  if (existing) {
    redirect('/dashboard/customer?error=You+already+have+a+pending+request')
  }

  const { data: newRequest, error } = await supabase
    .from('business_upgrade_requests')
    .insert({
      user_id: user.id,
      business_name,
      description,
      contact_email,
      contact_phone,
      payment_status: 'unpaid'
    })
    .select('id')
    .single()

  if (error) {
    redirect(`/dashboard/customer?error=${encodeURIComponent(error.message)}`)
  }

  // Notify all admins about the new business verification request
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      title: 'New Business Verification Request',
      message: `${business_name} has requested to be verified as a business.`,
      link: '/dashboard/admin/verifications',
    }))
    
    await supabase.from('notifications').insert(notifications)
  }

  revalidatePath('/dashboard/customer')
  redirect('/dashboard/customer?upgrade=submitted')
}
