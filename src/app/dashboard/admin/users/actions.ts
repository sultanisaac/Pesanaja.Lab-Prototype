'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
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

  // Use the service role key to bypass RLS for this specific update
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
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
