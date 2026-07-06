import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RealtimeBusinessReviews } from './RealtimeBusinessReviews'
import { deleteReview } from './actions'

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

export default async function BusinessReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Business profile not found. Please complete your profile setup.
      </div>
    )
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      profiles:customer_id ( first_name, last_name, email ),
      bookings:booking_id (
        services:service_id ( name )
      )
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6 max-w-4xl">
      <RealtimeBusinessReviews businessId={business.id} />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Star className="h-6 w-6 text-warning" /> Customer Reviews
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage the reviews left by your customers</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-3xl font-bold text-foreground">{avgRating || '-'}</p>
            <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <p className="text-3xl font-bold text-foreground">{reviews?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {!reviews || reviews.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                When customers leave reviews for your services, they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customer = review.profiles as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const booking  = review.bookings  as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const service  = booking?.services as any

            const customerName = customer?.first_name 
              ? \`\${customer.first_name} \${customer.last_name || ''}\`.trim() 
              : customer?.email?.split('@')[0] || 'Customer'

            return (
              <Card key={review.id} className="shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{customerName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        {service?.name && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {service.name}
                          </span>
                        )}
                      </div>

                      {review.comment && (
                        <p className="text-sm text-foreground/90 mt-2 bg-muted/20 p-3 rounded-lg border border-border/50">
                          {review.comment}
                        </p>
                      )}
                    </div>
                    
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-end gap-2 mt-2 sm:mt-0 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                      <form action={deleteReview}>
                        <input type="hidden" name="review_id" value={review.id} />
                        <button
                          type="submit"
                          title="Delete review"
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-2 sm:py-2 text-xs font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </form>
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
