import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar, Clock, Star, Search, CreditCard,
  TrendingUp, Briefcase, CheckCircle2, XCircle, ArrowRight, AlertCircle
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

  // Check if the customer has an upgrade request
  const { data: upgradeRequest } = await supabase
    .from('business_upgrade_requests')
    .select('id, status, admin_note, created_at, business_name')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

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

  const requestStatus = upgradeRequest?.status

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

      {/* Upgrade request feedback */}
      {params.upgrade === 'submitted' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Your business upgrade request has been submitted! We&apos;ll review it shortly.
        </div>
      )}
      {params.error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /> {params.error}
        </div>
      )}

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

        {/* Quick Actions */}
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

      {/* ────── Become a Business Owner ────── */}
      <Card className={cn(
        'shadow-sm border-2',
        requestStatus === 'approved' ? 'border-success/30 bg-success/5'
          : requestStatus === 'rejected' ? 'border-destructive/30 bg-destructive/5'
          : requestStatus === 'pending'  ? 'border-warning/30 bg-warning/5'
          : 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'
      )}>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Become a Business Owner
          </CardTitle>
          <CardDescription>
            Have a business idea? Apply to upgrade your account and start listing your services on Pesanaja.Lab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ── APPROVED ── */}
          {requestStatus === 'approved' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-success text-sm">Your application has been approved! 🎉</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your account has been upgraded to Business Owner. Please log out and log back in to access your Business Dashboard.
                  </p>
                  {upgradeRequest?.admin_note && (
                    <p className="text-xs text-foreground mt-2 italic">&ldquo;{upgradeRequest.admin_note}&rdquo;</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── REJECTED ── */}
          {requestStatus === 'rejected' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive text-sm">Your application was not approved.</p>
                  {upgradeRequest?.admin_note && (
                    <p className="text-xs text-foreground mt-1 italic">&ldquo;{upgradeRequest.admin_note}&rdquo;</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    You can apply again with updated information.
                  </p>
                </div>
              </div>
              {/* Re-apply form */}
              <ApplyForm />
            </div>
          )}

          {/* ── PENDING ── */}
          {requestStatus === 'pending' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning text-sm">Application under review</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your application for <strong>{upgradeRequest?.business_name}</strong> was submitted on{' '}
                  {new Date(upgradeRequest!.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  We&apos;ll notify you once it&apos;s reviewed.
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

// Extracted form component to avoid repetition
function ApplyForm() {
  return (
    <form action={submitUpgradeRequest} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="upgrade_business_name" className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Business Name <span className="text-destructive">*</span>
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
          <label htmlFor="upgrade_contact_email" className="text-sm font-medium text-foreground">Business Email</label>
          <input
            id="upgrade_contact_email"
            name="contact_email"
            type="email"
            placeholder="business@email.com"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="upgrade_contact_phone" className="text-sm font-medium text-foreground">Phone Number</label>
          <input
            id="upgrade_contact_phone"
            name="contact_phone"
            type="tel"
            placeholder="+62 8xx xxxx xxxx"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="upgrade_description" className="text-sm font-medium text-foreground">Tell us about your business</label>
          <textarea
            id="upgrade_description"
            name="description"
            rows={3}
            placeholder="Describe your business, services you offer, and why you want to join Pesanaja.Lab..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
          />
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
      >
        <ArrowRight className="h-4 w-4" /> Submit Application
      </button>
      <p className="text-xs text-muted-foreground">
        Our team will review your application within 1–2 business days.
      </p>
    </form>
  )
}

