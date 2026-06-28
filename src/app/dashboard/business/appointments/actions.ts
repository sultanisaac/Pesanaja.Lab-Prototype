'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const supabase = await createClient()
  
  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) return { error: 'Business not found' }

  // Update status
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('business_id', business.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/business/appointments')
  return { success: true }
}

export async function createManualBooking(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) return { error: 'Business not found' }

  const customerEmail = formData.get('customer_email') as string
  const serviceId = formData.get('service_id') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  // Find customer by email
  const { data: customer } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customerEmail)
    .single()

  if (!customer) {
    return { error: 'Customer not found. They must register an account first.' }
  }

  // Get service price
  const { data: service } = await supabase
    .from('services')
    .select('price')
    .eq('id', serviceId)
    .eq('business_id', business.id)
    .single()

  if (!service) return { error: 'Service not found' }

  const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

  const { error } = await supabase
    .from('bookings')
    .insert({
      business_id: business.id,
      customer_id: customer.id,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      total_price: service.price,
      status: 'confirmed', // Manual bookings are auto-confirmed
      notes: notes ? `[Manual Booking] ${notes}` : '[Manual Booking]',
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/business/appointments')
  return { success: true }
}
