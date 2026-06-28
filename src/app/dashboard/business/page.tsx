import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Activity, Briefcase, TrendingUp, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckoutButton } from '@/components/CheckoutButton'

export default async function BusinessDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Owner'

  const stats = [
    {
      label: 'Total Revenue',
      value: 'Rp 12.5M',
      sub: '+20.1% from last month',
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Appointments',
      value: '235',
      sub: '+19% from last month',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active Customers',
      value: '573',
      sub: '+201 since last week',
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Profile Views',
      value: '1,204',
      sub: '+5% from last week',
      icon: Activity,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ]

  const recentBookings = [
    { name: 'Siti Nurhaliza', service: 'Spa Treatment', time: 'Today, 14:00', price: 'Rp 250.000', status: 'Confirmed' },
    { name: 'Budi Santoso', service: 'Haircut & Styling', time: 'Today, 16:30', price: 'Rp 150.000', status: 'Confirmed' },
    { name: 'Anita Wijaya', service: 'Manicure', time: 'Tomorrow, 10:00', price: 'Rp 100.000', status: 'Pending' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Business Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {displayName}. Here&apos;s your performance overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/business/analytics" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <BarChart2 className="mr-2 h-4 w-4" /> Analytics
          </Link>
          <Link href="/dashboard/business/appointments" className={cn(buttonVariants({ size: 'sm' }))}>
            <Briefcase className="mr-2 h-4 w-4" /> Manage
          </Link>
        </div>
      </div>

      {/* Stats */}
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

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Appointments — wider */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Appointments</CardTitle>
            <CardDescription>Upcoming customer bookings for today and tomorrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((booking, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                    {booking.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{booking.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{booking.service} · {booking.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{booking.price}</p>
                    <span className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                      booking.status === 'Confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                    )}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Subscription</CardTitle>
            <CardDescription>Manage your Pesanaja.Lab plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-primary">Pro Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Rp 150.000 / month</p>
                </div>
                <span className="text-xs font-semibold bg-primary text-white px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>Unlimited bookings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-primary" />
                  <span>Customer management</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3 w-3 text-primary" />
                  <span>Full analytics access</span>
                </div>
              </div>
              <CheckoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
