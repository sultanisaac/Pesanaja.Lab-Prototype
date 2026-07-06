'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const bookingId = formData.get('booking_id') as string
  const businessId = formData.get('business_id') as string
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string || ''

  if (rating < 1 || rating > 5) return { error: 'Invalid rating' }
  
  if (comment.trim()) {
    const words = comment.trim().split(/\s+/)
    if (words.length > 150) {
      return { error: 'Review exceeds 150 words limit.' }
    }
  }

  // verify the booking belongs to the user and is completed
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id,
      services:service_id(name)
    `)
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!booking) return { error: 'Booking not found or not eligible for review.' }

  const { error } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    customer_id: user.id,
    business_id: businessId,
    rating,
    comment: comment.trim() || null
  })

  if (!error) {
    // Update the booking to mark it as reviewed so it never shows up again even if review is deleted
    await supabase.from('bookings').update({ has_been_reviewed: true }).eq('id', bookingId)
  }

  if (error) {
    if (error.code === '23505') {
       return { error: 'You have already reviewed this appointment.' }
    }
    return { error: error.message }
  }

  // Fetch data for email notification
  const { data: business } = await supabase
    .from('businesses')
    .select(`
      name, 
      contact_email,
      owner:owner_id(email, first_name, last_name)
    `)
    .eq('id', businessId)
    .single()

  const { data: customer } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceName = (booking as any)?.services?.name || 'A service'
  
  type ProfileData = { email?: string; first_name?: string; last_name?: string } | null;
  const ownerProfile = business?.owner as unknown as ProfileData;
  const businessOwnerEmail = business?.contact_email || ownerProfile?.email;

  if (businessOwnerEmail) {
    const ownerName = ownerProfile?.first_name 
      ? `${ownerProfile.first_name} ${ownerProfile.last_name || ''}`.trim() 
      : 'Business Owner'
    
    const customerName = customer?.first_name 
      ? `${customer.first_name} ${customer.last_name || ''}`.trim() 
      : customer?.email?.split('@')[0] || 'A customer'

    const { sendEmail } = await import('@/lib/email')
    const { getReviewNotificationHtml } = await import('@/lib/email-templates/review-notification')

    const htmlContent = getReviewNotificationHtml({
      ownerName,
      businessName: business?.name || 'your business',
      customerName,
      serviceName,
      rating,
      reviewComment: comment.trim() || 'No written feedback provided.'
    })

    await sendEmail({
      to: businessOwnerEmail,
      subject: `⭐ New ${rating}-Star Review for ${business?.name || 'your business'} on Pesanaja.Lab`,
      html: htmlContent
    })
  }

  revalidatePath('/dashboard/customer/reviews')
  revalidatePath(`/business/${businessId}`)
  revalidatePath('/dashboard/business/reviews')
  return { success: true }
}
