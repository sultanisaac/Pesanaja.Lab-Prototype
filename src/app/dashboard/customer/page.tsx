import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Star, Search, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Customer'

  const stats = [
    {
      label: 'Upcoming Bookings',
      value: '2',
      sub: 'Next one in 2 days',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Past Bookings',
      value: '14',
      sub: '+3 this month',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Reviews Left',
      value: '8',
      sub: 'Avg 4.8 stars',
      icon: Star,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Spent',
      value: 'Rp 4.9M',
      sub: 'Lifetime value',
      icon: TrendingUp,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ]

  const recentActivity = [
    { business: 'Smile Dental Clinic', service: 'Teeth Whitening', date: 'Oct 24, 10:00 AM', price: 'Rp 350.000', status: 'Completed' },
    { business: 'Salon Cantik', service: 'Hair Treatment', date: 'Oct 20, 14:00 PM', price: 'Rp 180.000', status: 'Completed' },
    { business: 'FitZone Gym', service: 'Personal Training', date: 'Oct 15, 08:00 AM', price: 'Rp 250.000', status: 'Completed' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here&apos;s an overview of your bookings and activities.</p>
        </div>
        <Link href="/search" className={cn(buttonVariants({ size: 'sm' }))}>
          <Search className="mr-2 h-4 w-4" /> Find Services
        </Link>
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.business}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.service} · {item.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{item.price}</p>
                    <span className="text-[10px] bg-success/10 text-success font-medium px-1.5 py-0.5 rounded-full">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium text-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-4 w-4 text-primary" />
              </div>
              Edit Profile
            </Link>
            <Link
              href="/dashboard/customer/bookings"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium text-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-warning" />
              </div>
              View All Bookings
            </Link>
            <Link
              href="/dashboard/customer/reviews"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium text-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-success" />
              </div>
              My Reviews
            </Link>
            <Link
              href="/dashboard/customer/favorites"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-medium text-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-destructive" />
              </div>
              Saved Favorites
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
