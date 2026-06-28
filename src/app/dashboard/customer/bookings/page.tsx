import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle2, XCircle, ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const statusCfg: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-warning/10 text-warning',         icon: Clock        },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary',         icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-success/10 text-success',         icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive', icon: XCircle      },
}

export default async function CustomerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const filter = params.filter ?? 'all'

  let query = supabase
    .from('bookings')
    .select(`
      id, status, scheduled_at, total_price, notes, created_at,
      services:service_id ( name, duration_minutes ),
      businesses:business_id ( name, logo_url )
    `)
    .eq('customer_id', user.id)
    .order('scheduled_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data: bookings } = await query

  const filters = [
    { id: 'all',       label: 'All' },
    { id: 'pending',   label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/customer" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> My Bookings
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">View and manage all your appointments</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.id}
            href={`/dashboard/customer/bookings${f.id === 'all' ? '' : `?filter=${f.id}`}`}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              filter === f.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Bookings list */}
      {!bookings || bookings.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'all'
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings.`}
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Search className="h-4 w-4" /> Find Services
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const service  = booking.services  as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const business = booking.businesses as any
            const cfg = statusCfg[booking.status] ?? statusCfg.pending
            const StatusIcon = cfg.icon
            const scheduledDate = new Date(booking.scheduled_at)
            const isPast = scheduledDate < new Date()

            return (
              <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Business avatar */}
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {business?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                      ) : (
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{service?.name ?? 'Service'}</p>
                          <p className="text-xs text-muted-foreground truncate">{business?.name ?? 'Business'}</p>
                        </div>
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0', cfg.color)}>
                          <StatusIcon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {scheduledDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {service?.duration_minutes && (
                          <span>{service.duration_minutes} min</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <p className="font-semibold text-foreground text-sm">
                          Rp {Number(booking.total_price).toLocaleString('id-ID')}
                        </p>
                        {booking.status === 'completed' && !isPast && (
                          <Link
                            href={`/dashboard/customer/reviews?booking=${booking.id}`}
                            className="text-xs text-primary font-medium hover:underline"
                          >
                            Leave a review →
                          </Link>
                        )}
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                          Note: {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
