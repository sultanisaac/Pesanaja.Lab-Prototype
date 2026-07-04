'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to book an appointment.' }
  }

  const businessId = formData.get('business_id') as string
  const serviceId = formData.get('service_id') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  // Validate the inputs
  if (!businessId || !serviceId || !date || !time) {
    return { error: 'Missing required fields' }
  }

  // Get service price
  const { data: service } = await supabase
    .from('services')
    .select('price, name')
    .eq('id', serviceId)
    .single()

  if (!service) {
    return { error: 'Service not found.' }
  }

  // Combine date and time to ISO timestamp
  const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

  // Ensure this time isn't in the past
  if (new Date(scheduledAt) < new Date()) {
    return { error: 'Cannot book an appointment in the past.' }
  }

  // Check if there is already a booking at exactly this time for this service (basic overlap check)
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('business_id', businessId)
    .eq('scheduled_at', scheduledAt)
    .not('status', 'eq', 'cancelled')
    .maybeSingle()

  if (existingBooking) {
    return { error: 'This time slot is already booked. Please choose another time.' }
  }

  // Insert the booking
  const { error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      customer_id: user.id,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      total_price: service.price,
      status: 'pending', // Automatic bookings start as pending for owner to confirm
      notes: notes || null,
    })

  if (error) {
    return { error: error.message }
  }

  // Fetch business owner to send notification
  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, name')
    .eq('id', businessId)
    .single()

  const { data: customerProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()
  
  const customerName = customerProfile?.first_name 
    ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`.trim() 
    : user.email?.split('@')[0] || 'User'

  if (business?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: business.owner_id,
      title: 'New Appointment Request',
      message: `New appointment booked by ${customerName} for ${service.name || 'a service'} at ${time}.`,
      link: '/dashboard/business/appointments',
    })
  }

  revalidatePath('/dashboard/customer/bookings')
  revalidatePath(`/business/${businessId}`)
  
  return { success: true }
}

export async function toggleFavorite(businessId: string, isFavorite: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }

  if (isFavorite) {
    await supabase.from('favorites').delete().eq('customer_id', user.id).eq('business_id', businessId)
  } else {
    await supabase.from('favorites').insert({ customer_id: user.id, business_id: businessId })
  }

  revalidatePath(`/business/${businessId}`)
  return { success: true }
}
