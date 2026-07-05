'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendEmail } from '@/lib/email'
import { getAdminVerificationRequestEmailHtml } from '@/lib/emailTemplates'

export async function updateBusinessProfile(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const description = formData.get('description') as string
  const contact_email = formData.get('contact_email') as string
  const contact_phone = formData.get('contact_phone') as string
  const operating_hours_str = formData.get('operating_hours') as string
  
  let operating_hours = undefined
  if (operating_hours_str) {
    try {
      operating_hours = JSON.parse(operating_hours_str)
    } catch (e) {
      console.error('Failed to parse operating_hours', e)
    }
  }

  if (!name) redirect('/dashboard/business/settings?error=Business+name+is+required')

  const { data: existing } = await supabase
    .from('businesses')
    .select('id, payment_status')
    .eq('owner_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('businesses')
      .update({ name, description, contact_email, contact_phone, operating_hours, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)
  } else {
    await supabase
      .from('businesses')
      .insert({ owner_id: user.id, name, description, contact_email, contact_phone, operating_hours, payment_status: 'unpaid', status: 'pending' })

    // Fetch user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

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
        message: `New business verification request from ${user.email?.split('@')[0] || 'User'} for ${name}.`,
        link: '/dashboard/admin/verifications',
        type: 'verification_request',
      }))
      
      await adminAuth.from('notifications').insert(notifications)

      // Send emails
      const userName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email?.split('@')[0] || 'User'
      const userEmailAddress = user.email || ''

      for (const admin of admins) {
        if (admin.email) {
          const adminName = admin.first_name ? `${admin.first_name} ${admin.last_name || ''}`.trim() : admin.email.split('@')[0]
          const html = getAdminVerificationRequestEmailHtml(adminName, userName, name, userEmailAddress)
          await sendEmail({
            to: admin.email,
            subject: `Action Required: New Business Verification for ${name}`,
            html
          })
        }
      }
    }
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
  } catch {
    return { error: 'Failed to update operating hours' }
  }
}


export async function addService(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify ownership
  const { data: business } = await supabase.from('businesses').select('id').eq('id', businessId).eq('owner_id', user.id).single()
  if (!business) return { error: 'Unauthorized business access' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const duration_minutes = Number(formData.get('duration_minutes'))

  const { error } = await supabase.from('services').insert({
    business_id: businessId,
    name, description, price, duration_minutes
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/business/settings')
  return { success: true }
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Fetch service to get business_id
  const { data: service } = await supabase.from('services').select('business_id').eq('id', serviceId).single()
  if (!service) return { error: 'Service not found' }

  // Verify ownership
  const { data: business } = await supabase.from('businesses').select('id').eq('id', service.business_id).eq('owner_id', user.id).single()
  if (!business) return { error: 'Unauthorized business access' }

  const { error } = await supabase.from('services').delete().eq('id', serviceId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/business/settings')
  return { success: true }
}

export async function addLocation(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify ownership
  const { data: business } = await supabase.from('businesses').select('id').eq('id', businessId).eq('owner_id', user.id).single()
  if (!business) return { error: 'Unauthorized business access' }

  const street_address = formData.get('street_address') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const postal_code = formData.get('postal_code') as string

  const { error } = await supabase.from('addresses').insert({
    business_id: businessId,
    street_address, city, state, postal_code
  })
  if (error) return { error: error.message }
  revalidatePath('/dashboard/business/settings')
  return { success: true }
}

export async function deleteLocation(locationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Fetch address to get business_id
  const { data: address } = await supabase.from('addresses').select('business_id').eq('id', locationId).single()
  if (!address) return { error: 'Location not found' }

  // Verify ownership
  const { data: business } = await supabase.from('businesses').select('id').eq('id', address.business_id).eq('owner_id', user.id).single()
  if (!business) return { error: 'Unauthorized business access' }

  const { error } = await supabase.from('addresses').delete().eq('id', locationId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/business/settings')
  return { success: true }
}
