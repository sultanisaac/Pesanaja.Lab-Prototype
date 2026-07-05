'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/email'
import { getAppointmentConfirmedEmailHtml, getAppointmentCancelledEmailHtml, getAppointmentDeclinedEmailHtml } from '@/lib/emailTemplates'

export async function updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', reason?: string) {
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

  // Get booking details first to know who to notify
  const { data: bookingDetails } = await supabase
    .from('bookings')
    .select('customer_id, scheduled_at, notes, status, services(name), businesses(name)')
    .eq('id', bookingId)
    .single()

  const updateData: any = { status }
  if (status === 'cancelled' && reason) {
    updateData.notes = bookingDetails?.notes 
      ? `${bookingDetails.notes}\n\nCancellation Reason: ${reason}`
      : `Cancellation Reason: ${reason}`
  }

  // Update status
  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .eq('business_id', business.id)

  if (error) return { error: error.message }

  // Notify customer
  if (bookingDetails?.customer_id && (status === 'confirmed' || status === 'cancelled')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceName = (bookingDetails.services as any)?.name || 'a service'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const businessName = (bookingDetails.businesses as any)?.name || 'the business'
    
    const appointmentTime = bookingDetails.scheduled_at 
      ? new Date(bookingDetails.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'the scheduled time'

    let message = `Your appointment for ${serviceName} has been ${status}.`
    if (status === 'confirmed') {
      message = `Your appointment at ${businessName} has been confirmed for ${appointmentTime}.`
    } else if (status === 'cancelled' && reason) {
      if (bookingDetails.status === 'pending') {
        message = `Your appointment request at ${businessName} has been declined. Reason: ${reason}`
      } else {
        message = `Your appointment at ${businessName} has been cancelled. Reason: ${reason}`
      }
    } else if (status === 'cancelled' && !reason) {
      if (bookingDetails.status === 'pending') {
        message = `Your appointment request at ${businessName} has been declined.`
      } else {
        message = `Your appointment at ${businessName} has been cancelled.`
      }
    }

    await supabase.from('notifications').insert({
      user_id: bookingDetails.customer_id,
      title: `Appointment ${status === 'confirmed' ? 'Confirmed' : 'Cancelled'}`,
      message,
      link: '/dashboard/customer/bookings',
      type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
    })

    if (status === 'confirmed' || status === 'cancelled') {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const adminAuth = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: customerResponse } = await adminAuth.auth.admin.getUserById(bookingDetails.customer_id)
      const customerEmail = customerResponse?.user?.email

      const { data: customerProfile } = await adminAuth
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', bookingDetails.customer_id)
        .single()
      
      const customerFullName = customerProfile?.first_name
        ? `${customerProfile.first_name} ${customerProfile.last_name || ''}`.trim()
        : customerEmail?.split('@')[0] || 'Customer'

      if (customerEmail) {
        const appointmentDateStr = bookingDetails.scheduled_at
          ? new Date(bookingDetails.scheduled_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
          : appointmentTime

        if (status === 'confirmed') {
          const html = getAppointmentConfirmedEmailHtml(customerFullName, businessName, serviceName, appointmentDateStr)
          
          await sendEmail({
            to: customerEmail,
            subject: `✅ Appointment Confirmed: Your booking at ${businessName}`,
            html
          })
        } else if (status === 'cancelled') {
          // If previous status was 'pending', it's a decline
          if (bookingDetails.status === 'pending') {
            const html = getAppointmentDeclinedEmailHtml(customerFullName, businessName, serviceName, appointmentDateStr, reason)
            
            await sendEmail({
              to: customerEmail,
              subject: `⚠️ Appointment Declined: Your booking request at ${businessName}`,
              html
            })
          } else {
            // Previous status was confirmed, it's a cancellation
            const html = getAppointmentCancelledEmailHtml(customerFullName, businessName, serviceName, appointmentDateStr, reason)
            
            await sendEmail({
              to: customerEmail,
              subject: `❌ Appointment Cancelled: Your booking at ${businessName}`,
              html
            })
          }
        }
      }
    }
  }

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
