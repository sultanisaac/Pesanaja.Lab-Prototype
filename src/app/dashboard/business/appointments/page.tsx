import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  pending:   { label: 'Pending',   icon: AlertCircle,  classes: 'bg-warning/10 text-warning' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, classes: 'bg-success/10 text-success' },
  completed: { label: 'Completed', icon: Loader,       classes: 'bg-primary/10 text-primary' },
  cancelled: { label: 'Cancelled', icon: XCircle,      classes: 'bg-destructive/10 text-destructive' },
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get this owner's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user?.id)
    .single()

  // Get bookings for this business with customer + service info
  const { data: bookings } = business
    ? await supabase
        .from('bookings')
        .select(`
          id, status, scheduled_at, total_price, notes,
          customer:profiles!bookings_customer_id_fkey(first_name, last_name, email),
          service:services!bookings_service_id_fkey(name)
        `)
        .eq('business_id', business.id)
        .order('scheduled_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const counts = {
    total:     bookings?.length ?? 0,
    confirmed: bookings?.filter((b) => b.status === 'confirmed').length ?? 0,
    pending:   bookings?.filter((b) => b.status === 'pending').length ?? 0,
    completed: bookings?.filter((b) => b.status === 'completed').length ?? 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Appointments
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {business ? `All bookings for ${business.name}` : 'Set up your business profile to receive bookings.'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: counts.total,     color: 'text-foreground',    bg: 'bg-muted/60' },
          { label: 'Confirmed', value: counts.confirmed, color: 'text-success',       bg: 'bg-success/10' },
          { label: 'Pending',   value: counts.pending,   color: 'text-warning',       bg: 'bg-warning/10' },
          { label: 'Completed', value: counts.completed, color: 'text-primary',       bg: 'bg-primary/10' },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-bold mt-1', s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings table / list */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Appointments</CardTitle>
          <CardDescription>Showing latest 50 bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {!business ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                You haven&apos;t set up a business profile yet.
              </p>
              <a href="/dashboard/business/settings" className="text-sm text-primary hover:underline">
                Create your business profile →
              </a>
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No appointments yet. Share your business page to get bookings!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const cfg = statusConfig[booking.status] ?? statusConfig.pending
                const StatusIcon = cfg.icon
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const customer = booking.customer as any
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const service = booking.service as any
                const customerName = customer
                  ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || customer.email
                  : 'Unknown Customer'
                const initials = customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                const scheduledDate = booking.scheduled_at
                  ? new Date(booking.scheduled_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                  : '—'

                return (
                  <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {initials || <User className="h-4 w-4" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{customerName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">{service?.name ?? 'Unknown Service'}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {scheduledDate}
                        </span>
                      </div>
                    </div>

                    {/* Price + status */}
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {booking.total_price != null
                          ? `Rp ${Number(booking.total_price).toLocaleString('id-ID')}`
                          : '—'}
                      </p>
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.classes)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
