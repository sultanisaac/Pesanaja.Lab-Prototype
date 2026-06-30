import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, role, avatar_url')
    .eq('id', data.user.id)
    .single()

  const role = (profile?.role ?? 'customer') as 'customer' | 'business' | 'admin'
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : data.user.email?.split('@')[0] ?? 'User'
  const email = profile?.email ?? data.user.email ?? ''

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <Sidebar role={role} displayName={displayName} email={email} avatarUrl={profile?.avatar_url} userId={data.user.id} />
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar spacer */}
        <div className="md:hidden h-14 shrink-0" />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
