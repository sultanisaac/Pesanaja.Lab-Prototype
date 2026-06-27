import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  const role = data.user.user_metadata?.role || 'customer'

  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'business') {
    redirect('/dashboard/business')
  } else {
    redirect('/dashboard/customer')
  }
}
