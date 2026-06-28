import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Users, Briefcase, Activity, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Admin'

  // Live counts from DB
  const [
    { count: totalUsers },
    { count: totalBusinesses },
    { count: pendingVerifications },
    { count: totalBookings },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: 'Total Users',
      value: (totalUsers ?? 0).toLocaleString(),
      sub: 'Registered accounts',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Businesses',
      value: (totalBusinesses ?? 0).toLocaleString(),
      sub: 'Registered on platform',
      icon: Briefcase,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Pending Verifications',
      value: (pendingVerifications ?? 0).toLocaleString(),
      sub: pendingVerifications ? 'Requires action' : 'All clear',
      icon: ShieldCheck,
      color: pendingVerifications ? 'text-destructive' : 'text-success',
      bg: pendingVerifications ? 'bg-destructive/10' : 'bg-success/10',
    },
    {
      label: 'Total Bookings',
      value: (totalBookings ?? 0).toLocaleString(),
      sub: 'Platform-wide',
      icon: Activity,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ]

  // Recent business registrations (live)
  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    verified: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Admin Control Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome, {displayName}. Platform overview and management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/verifications" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Verifications
          </Link>
          <Link href="/dashboard/admin/analytics" className={cn(buttonVariants({ size: 'sm' }))}>
            <BarChart2 className="mr-2 h-4 w-4" /> Analytics
          </Link>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Registrations — live data */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Business Registrations</CardTitle>
            <CardDescription>Latest businesses registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBusinesses && recentBusinesses.length > 0 ? (
              <div className="space-y-3">
                {recentBusinesses.map((biz, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(biz.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', statusColors[biz.status] ?? 'bg-muted text-muted-foreground')}>
                      {biz.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No businesses registered yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Admin Quick Links</CardTitle>
            <CardDescription>Jump to management sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Manage All Users', href: '/dashboard/admin/users', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Manage Businesses', href: '/dashboard/admin/businesses', icon: Briefcase, color: 'text-warning', bg: 'bg-warning/10' },
              { label: 'Pending Verifications', href: '/dashboard/admin/verifications', icon: ShieldCheck, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'Platform Analytics', href: '/dashboard/admin/analytics', icon: BarChart2, color: 'text-success', bg: 'bg-success/10' },
            ].map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium text-foreground"
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', link.bg)}>
                    <Icon className={cn('h-4 w-4', link.color)} />
                  </div>
                  {link.label}
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
