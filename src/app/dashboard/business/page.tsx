import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Activity, Briefcase, BarChart2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
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

  // Get this owner's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status, payment_status, is_active')
    .eq('owner_id', user?.id)
    .single()

  // Lock logic
  if (!business || business.payment_status !== 'paid') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-warning" />
        <h1 className="text-2xl font-bold">Start your business</h1>
        <p className="text-muted-foreground max-w-md">
          {business ? 'You need to complete your subscription payment to unlock your dashboard.' : 'Set up your business profile and subscribe to start receiving appointments.'}
        </p>
        <Link href="/dashboard/business/settings" className={cn(buttonVariants({ size: 'lg' }))}>
          {business ? 'Complete Payment' : 'Go to Business Settings'}
        </Link>
      </div>
    )
  }

  if (business.status !== 'verified') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Clock className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold">Waiting confirm or approval</h1>
        <p className="text-muted-foreground max-w-md">
          Your payment was successful! Our admin team is currently reviewing your business details. Your dashboard will be unlocked shortly.
        </p>
      </div>
    )
  }

  // Fetch real data in parallel
  const businessId = business?.id ?? null

  const [bookingsRes, reviewsRes, servicesRes] = await Promise.all([
    businessId
      ? supabase
          .from('bookings')
          .select('id, status, total_price, scheduled_at, customer:profiles!bookings_customer_id_fkey(first_name, last_name, email), service:services!bookings_service_id_fkey(name)')
          .eq('business_id', businessId)
          .order('scheduled_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    businessId
      ? supabase
          .from('reviews')
          .select('rating')
          .eq('business_id', businessId)
      : Promise.resolve({ data: [] }),
    businessId
      ? supabase
          .from('services')
          .select('id')
          .eq('business_id', businessId)
          .eq('is_active', true)
      : Promise.resolve({ data: [] }),
  ])

  const bookings = bookingsRes.data ?? []
  const reviews = reviewsRes.data ?? []
  const services = servicesRes.data ?? []

  // Compute stats
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) ?? 0), 0)
  const totalBookings = bookings.length
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'
  const activeServices = services.length

  const stats = [
    {
      label: 'Total Revenue',
      value: totalRevenue > 0 ? `Rp ${totalRevenue.toLocaleString('id-ID')}` : 'Rp 0',
      sub: 'From all completed bookings',
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Bookings',
      value: String(totalBookings),
      sub: 'All time',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg. Rating',
      value: avgRating,
      sub: `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`,
      icon: Activity,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Active Services',
      value: String(activeServices),
      sub: 'Listed on your profile',
      icon: Users,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ]

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending:   { label: 'Pending',   classes: 'bg-warning/10 text-warning' },
    confirmed: { label: 'Confirmed', classes: 'bg-success/10 text-success' },
    completed: { label: 'Completed', classes: 'bg-primary/10 text-primary' },
    cancelled: { label: 'Cancelled', classes: 'bg-destructive/10 text-destructive' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Business Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {displayName}. Here&apos;s your live performance overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/business/analytics" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <BarChart2 className="mr-2 h-4 w-4" /> Analytics
          </Link>
          <Link href="/dashboard/business/appointments" className={cn(buttonVariants({ size: 'sm' }))}>
            <Briefcase className="mr-2 h-4 w-4" /> Appointments
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
            <CardDescription>Latest 5 bookings for your business</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No bookings yet. Share your profile to get started!</p>
                {business && (
                  <Link href={`/business/${business.id}`} className="text-sm text-primary hover:underline">
                    View your public page →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const cfg = statusConfig[booking.status] ?? statusConfig.pending
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const customer = booking.customer as any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const service = booking.service as any
                  const customerName = customer
                    ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email
                    : 'Unknown'
                  const initials = customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  const scheduled = booking.scheduled_at
                    ? new Date(booking.scheduled_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—'

                  return (
                    <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{customerName}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {service?.name ?? 'Unknown'} · <Clock className="h-3 w-3 inline" /> {scheduled}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-foreground">
                          {booking.total_price != null ? `Rp ${Number(booking.total_price).toLocaleString('id-ID')}` : '—'}
                        </p>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', cfg.classes)}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {bookings.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/business/appointments" className="text-sm text-primary hover:underline">
                  View all appointments →
                </Link>
              </div>
            )}
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
                  <p className="font-semibold text-primary">Starter Plan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Free forever</p>
                </div>
                <span className="text-xs font-semibold bg-success text-white px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span>Up to 10 bookings / month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span>Basic business profile</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span>Customer reviews</span>
                </div>
              </div>
              <CheckoutButton />
            </div>
            <Link href="/dashboard/business/subscription" className="block text-center text-xs text-primary hover:underline">
              Compare all plans →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
