import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  // Always read role from the profiles table — this is the single source of truth.
  // user_metadata.role is only set for users who registered via the app form,
  // so users created from the Supabase dashboard would always be missing it.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role ?? 'customer'

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'business') {
    redirect('/dashboard/business')
  } else {
    redirect('/dashboard/customer')
  }
}
