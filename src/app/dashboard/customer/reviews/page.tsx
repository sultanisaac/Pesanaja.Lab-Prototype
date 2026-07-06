import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReviewForm } from './ReviewForm'
import { RealtimeReviews } from './RealtimeReviews'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            star <= rating ? 'fill-warning text-warning' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  )
}

export default async function CustomerReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all completed but unreviewed bookings
  const { data: unreviewedBookingsResponse } = await supabase
    .from('bookings')
    .select(`
      id, scheduled_at, business_id,
      businesses:business_id ( name, logo_url ),
      services:service_id ( name )
    `)
    .eq('customer_id', user.id)
    .eq('status', 'completed')
    .eq('has_been_reviewed', false)
    .order('scheduled_at', { ascending: false })

  const unreviewedBookings = unreviewedBookingsResponse || []

  // Fetch submitted reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, booking_id, rating, comment, created_at,
      businesses:business_id ( name, logo_url ),
      bookings:booking_id (
        scheduled_at,
        services:service_id ( name )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-8 max-w-3xl">
      <RealtimeReviews customerId={user.id} />
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/customer" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Star className="h-6 w-6 text-warning" /> My Reviews
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and submit reviews for your completed appointments</p>
        </div>
      </div>

      {/* Summary stat */}
      {reviews && reviews.length > 0 && (
        <div className="flex items-center gap-6 p-4 rounded-xl bg-warning/5 border border-warning/20">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{avgRating}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg. rating</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{reviews.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Reviews given</p>
          </div>
          <div className="flex-1 flex justify-center">
            <StarRating rating={Math.round(Number(avgRating))} />
          </div>
        </div>
      )}

      {/* Pending Reviews */}
      {unreviewedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" /> Needs Review
          </h2>
          <div className="space-y-3">
            {unreviewedBookings.map((booking) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const business = booking.businesses as any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const service  = booking.services as any

              return (
                <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {business?.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{business?.name ?? 'Business'}</p>
                        <p className="text-xs text-muted-foreground">
                          {service?.name} · {new Date(booking.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <ReviewForm bookingId={booking.id} businessId={booking.business_id} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Submitted Reviews */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> Submitted Reviews
        </h2>
        {!reviews || reviews.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">No submitted reviews</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Once you leave a review, it will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const business = review.businesses as any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const booking  = review.bookings  as any
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const service  = booking?.services as any

              return (
                <Card key={review.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {business?.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={business.logo_url} alt={business.name} className="h-full w-full object-cover" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{business?.name ?? 'Business'}</p>
                        {service?.name && (
                          <p className="text-xs text-muted-foreground">{service.name}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <StarRating rating={review.rating} />
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{review.comment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
