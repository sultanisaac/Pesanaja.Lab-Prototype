import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar, Clock, Star, Search, Heart,
  TrendingUp, Briefcase, CheckCircle2, XCircle, ArrowRight, AlertCircle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { submitUpgradeRequest } from './actions'

export default async function CustomerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Customer'

  // ── Live data from DB ──
  const now = new Date().toISOString()

  const [
    { count: upcomingCount },
    { count: completedCount },
    { count: reviewsCount },
    { count: favoritesCount },
    { data: recentBookings },
    { data: upgradeRequest },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user?.id)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', now),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user?.id)
      .eq('status', 'completed'),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user?.id),
    supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user?.id),
    supabase
      .from('bookings')
      .select(`
        id, status, scheduled_at, total_price,
        services:service_id ( name ),
        businesses:business_id ( name, logo_url )
      `)
      .eq('customer_id', user?.id)
      .order('scheduled_at', { ascending: false })
      .limit(4),
    supabase
      .from('business_upgrade_requests')
      .select('id, status, admin_note, created_at, business_name')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Total spent
  const { data: spentData } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('customer_id', user?.id)
    .eq('status', 'completed')

  const totalSpent = spentData?.reduce((sum, b) => sum + Number(b.total_price ?? 0), 0) ?? 0

  const stats = [
    {
      label: 'Upcoming',
      value: (upcomingCount ?? 0).toString(),
      sub: upcomingCount ? 'Bookings scheduled' : 'No upcoming bookings',
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/dashboard/customer/bookings?filter=pending',
    },
    {
      label: 'Completed',
      value: (completedCount ?? 0).toString(),
      sub: 'Past bookings',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      href: '/dashboard/customer/bookings?filter=completed',
    },
    {
      label: 'Reviews',
      value: (reviewsCount ?? 0).toString(),
      sub: 'Reviews given',
      icon: Star,
      color: 'text-success',
      bg: 'bg-success/10',
      href: '/dashboard/customer/reviews',
    },
    {
      label: 'Total Spent',
      value: totalSpent > 0
        ? `Rp ${(totalSpent / 1_000_000).toFixed(1)}M`
        : 'Rp 0',
      sub: 'Lifetime value',
      icon: TrendingUp,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      href: '/dashboard/customer/bookings',
    },
  ]

  const statusColors: Record<string, string> = {
    pending:   'bg-warning/10 text-warning',
    confirmed: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  }

  const requestStatus = upgradeRequest?.status

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s an overview of your bookings and activities.
          </p>
        </div>
        <Link href="/search" className={cn(buttonVariants({ size: 'sm' }))}>
          <Search className="mr-2 h-4 w-4" /> Find Services
        </Link>
      </div>

      {/* Feedback banners */}
      {params.upgrade === 'submitted' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <span>Your business upgrade request has been submitted! We&apos;ll review it shortly.</span>
        </div>
      )}
      {params.error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{params.error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} className="block">
              <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                    {s.label}
                  </CardTitle>
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', s.bg)}>
                    <Icon className={cn('h-4 w-4', s.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.sub}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
              <CardDescription className="text-xs mt-0.5">Your latest appointments</CardDescription>
            </div>
            <Link
              href="/dashboard/customer/bookings"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5 shrink-0"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {!recentBookings || recentBookings.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-medium text-foreground">No bookings yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start by finding a service you like.
                  </p>
                </div>
                <Link href="/search" className="text-xs text-primary font-medium hover:underline">
                  Browse services →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((booking) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const service  = booking.services  as any
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const business = booking.businesses as any
                  const statusColor = statusColors[booking.status] ?? statusColors.pending

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {business?.name ?? 'Business'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {service?.name ?? 'Service'} ·{' '}
                          {new Date(booking.scheduled_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short',
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          Rp {Number(booking.total_price).toLocaleString('id-ID')}
                        </p>
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize', statusColor)}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs mt-0.5">Manage your account and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/dashboard/profile',             icon: Search,   bg: 'bg-primary/10',     color: 'text-primary',     label: 'Edit Profile' },
              { href: '/dashboard/customer/bookings',   icon: Calendar, bg: 'bg-warning/10',     color: 'text-warning',     label: 'View All Bookings' },
              { href: '/dashboard/customer/reviews',    icon: Star,     bg: 'bg-success/10',     color: 'text-success',     label: 'My Reviews' },
              {
                href: '/dashboard/customer/favorites',
                icon: Heart,
                bg: 'bg-destructive/10',
                color: 'text-destructive',
                label: `Saved Favorites${favoritesCount ? ` (${favoritesCount})` : ''}`,
              },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 w-full p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group"
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', action.bg)}>
                    <Icon className={cn('h-4 w-4', action.color)} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">{action.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* ────── Become a Business Owner ────── */}
      <Card className={cn(
        'shadow-sm border-2',
        requestStatus === 'approved'
          ? 'border-success/30 bg-success/5'
          : requestStatus === 'rejected'
          ? 'border-destructive/30 bg-destructive/5'
          : requestStatus === 'pending'
          ? 'border-warning/30 bg-warning/5'
          : 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary shrink-0" />
            Become a Business Owner
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Have a business idea? Apply to upgrade your account and start listing your services on Pesanaja.Lab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ── APPROVED ── */}
          {requestStatus === 'approved' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-success text-sm">Your application has been approved! 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account has been upgraded to Business Owner. Please log out and log back in to access your Business Dashboard.
                </p>
                {upgradeRequest?.admin_note && (
                  <p className="text-xs text-foreground mt-2 italic">&ldquo;{upgradeRequest.admin_note}&rdquo;</p>
                )}
              </div>
            </div>
          )}

          {/* ── REJECTED ── */}
          {requestStatus === 'rejected' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-destructive text-sm">Your application was not approved.</p>
                  {upgradeRequest?.admin_note && (
                    <p className="text-xs text-foreground mt-1 italic">&ldquo;{upgradeRequest.admin_note}&rdquo;</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    You can apply again with updated information.
                  </p>
                </div>
              </div>
              <ApplyForm />
            </div>
          )}

          {/* ── PENDING ── */}
          {requestStatus === 'pending' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-warning text-sm">Application under review</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your application for <strong>{upgradeRequest?.business_name}</strong> was submitted on{' '}
                  {new Date(upgradeRequest!.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}. We&apos;ll notify you once it&apos;s reviewed.
                </p>
              </div>
            </div>
          )}

          {/* ── NO REQUEST YET ── */}
          {!requestStatus && <ApplyForm />}
        </CardContent>
      </Card>
    </div>
  )
}

function ApplyForm() {
  return (
    <form action={submitUpgradeRequest} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="upgrade_business_name" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            Business Name <span className="text-destructive">*</span>
          </label>
          <input
            id="upgrade_business_name"
            name="business_name"
            type="text"
            required
            placeholder="e.g. Smile Dental Clinic"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="upgrade_contact_email" className="text-sm font-medium text-foreground">
            Business Email
          </label>
          <input
            id="upgrade_contact_email"
            name="contact_email"
            type="email"
            placeholder="business@email.com"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="upgrade_contact_phone" className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <input
            id="upgrade_contact_phone"
            name="contact_phone"
            type="tel"
            placeholder="+62 8xx xxxx xxxx"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="upgrade_description" className="text-sm font-medium text-foreground">
            Tell us about your business
          </label>
          <textarea
            id="upgrade_description"
            name="description"
            rows={3}
            placeholder="Describe your business, services you offer, and why you want to join Pesanaja.Lab..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowRight className="h-4 w-4" /> Submit Application
        </button>
        <p className="text-xs text-muted-foreground">
          Reviewed within 1–2 business days.
        </p>
      </div>
    </form>
  )
}
