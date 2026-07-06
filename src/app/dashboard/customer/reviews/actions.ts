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
    .select('id')
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

  if (error) {
    if (error.code === '23505') {
       return { error: 'You have already reviewed this appointment.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer/reviews')
  revalidatePath(`/business/${businessId}`)
  revalidatePath('/dashboard/business/reviews')
  return { success: true }
}
