'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email'
import { getAdminVerificationRequestEmailHtml } from '@/lib/emailTemplates'

export async function submitUpgradeRequest(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the user is actually a customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name')
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

  const { error } = await supabase
    .from('business_upgrade_requests')
    .insert({
      user_id: user.id,
      business_name,
      description,
      contact_email,
      contact_phone,
      payment_status: 'unpaid'
    })

  if (error) {
    redirect(`/dashboard/customer?error=${encodeURIComponent(error.message)}`)
  }

  // Notify all admins about the new business verification request
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      title: 'New Business Verification Request',
      message: `New business verification request from ${user.email?.split('@')[0] || 'User'} for ${business_name}.`,
      link: '/dashboard/admin/verifications',
    }))
    
    await adminAuth.from('notifications').insert(notifications)

    // Send emails
    const userName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email?.split('@')[0] || 'User'
    const userEmailAddress = user.email || ''

    for (const admin of admins) {
      if (admin.email) {
        const adminName = admin.first_name ? `${admin.first_name} ${admin.last_name || ''}`.trim() : admin.email.split('@')[0]
        const html = getAdminVerificationRequestEmailHtml(adminName, userName, business_name, userEmailAddress)
        await sendEmail({
          to: admin.email,
          subject: `Action Required: New Business Verification for ${business_name}`,
          html
        })
      }
    }
  }

  revalidatePath('/dashboard/customer')
  redirect('/dashboard/customer?upgrade=submitted')
}
