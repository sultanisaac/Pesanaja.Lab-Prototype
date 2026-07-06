'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const reviewId = formData.get('review_id') as string
  if (!reviewId) return { error: 'Missing review id' }

  // Verify the business belongs to the user
  // Get business for the user
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) return { error: 'Business not found' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('business_id', business.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/business/reviews')
  revalidatePath(`/business/${business.id}`)
  revalidatePath('/dashboard/customer/reviews')
  return { success: true }
}
