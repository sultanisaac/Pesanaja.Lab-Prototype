'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return { supabase, adminId: user.id }
}

export async function approveUpgradeRequest(formData: FormData): Promise<void> {
  const { supabase, adminId } = await verifyAdmin()
  const adminAuth = getAdminClient()

  const requestId = formData.get('request_id') as string
  const adminNote = (formData.get('admin_note') as string)?.trim() ?? ''

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .from('business_upgrade_requests')
    .select('id, user_id, business_name, description, contact_email, contact_phone')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single()

  if (fetchError || !request) {
    redirect('/dashboard/admin/verifications?tab=upgrades&error=Request+not+found')
  }

  // 1. Update the request status
  await adminAuth
    .from('business_upgrade_requests')
    .update({
      status: 'approved',
      admin_note: adminNote,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  // 2. Change the user's role to 'business'
  await adminAuth
    .from('profiles')
    .update({ role: 'business', updated_at: new Date().toISOString() })
    .eq('id', request.user_id)

  // 3. Create a business record for them
  await adminAuth
    .from('businesses')
    .insert({
      owner_id: request.user_id,
      name: request.business_name,
      description: request.description,
      contact_email: request.contact_email,
      contact_phone: request.contact_phone,
      status: 'verified', // Admin approved, ready for payment
      payment_status: 'unpaid'
    })

  revalidatePath('/dashboard/admin/verifications')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin/verifications?tab=upgrades&success=approved')
}

export async function rejectUpgradeRequest(formData: FormData): Promise<void> {
  const { adminId } = await verifyAdmin()
  const adminAuth = getAdminClient()

  const requestId = formData.get('request_id') as string
  const adminNote = (formData.get('admin_note') as string)?.trim() ?? ''

  await adminAuth
    .from('business_upgrade_requests')
    .update({
      status: 'rejected',
      admin_note: adminNote,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('status', 'pending')

  revalidatePath('/dashboard/admin/verifications')
  revalidatePath('/dashboard/admin')
  redirect('/dashboard/admin/verifications?tab=upgrades&success=rejected')
}
