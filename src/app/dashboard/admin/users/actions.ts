'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAdminRole(userId: string, currentRole: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Prevent users from removing their own admin status
  if (user.id === userId) {
    return { error: 'You cannot change your own admin role.' }
  }

  // Verify the user performing the action is an admin
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') {
    return { error: 'Unauthorized: Only admins can manage roles.' }
  }

  // Calculate new role
  let newRole = currentRole
  if (currentRole === 'admin') {
    // Check if they have a business
    const { count } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
    
    newRole = (count && count > 0) ? 'business' : 'customer'
  } else {
    newRole = 'admin'
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error toggling admin role:', error)
    return { error: 'Failed to update user role.' }
  }

  revalidatePath('/dashboard/admin/users')
  return { success: true, newRole }
}

export async function getUserDetailedInfo(userId: string) {
  const supabase = await createClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, description, status, contact_email, contact_phone, address')
    .eq('owner_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is not found
    console.error('Error fetching business info:', error)
    return { success: false, error: 'Failed to fetch business information' }
  }

  return { success: true, data: { business } }
}
