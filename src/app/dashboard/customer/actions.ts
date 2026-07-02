'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSubscriptionInvoice } from '@/lib/xendit'

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

  // Redirect to Xendit checkout
  let invoiceUrl = ''
  try {
    const invoice = await createSubscriptionInvoice(`upgrade_id:${newRequest.id}`, user.email || '')
    if (invoice.invoiceUrl) {
      invoiceUrl = invoice.invoiceUrl
    }
  } catch (e) {
    console.error('Checkout error:', e)
    redirect('/dashboard/customer?error=Payment+setup+failed')
  }

  if (invoiceUrl) {
    redirect(invoiceUrl)
  }

  revalidatePath('/dashboard/customer')
  redirect('/dashboard/customer?upgrade=submitted')
}
