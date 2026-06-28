import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, ArrowLeft, Star, MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { removeFavorite } from './actions'

export default async function CustomerFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id, created_at,
      businesses:business_id (
        id, name, description, logo_url, contact_email,
        addresses:addresses ( city, state )
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/customer" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-destructive fill-destructive" /> Saved Favorites
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {favorites?.length
              ? `${favorites.length} saved business${favorites.length !== 1 ? 'es' : ''}`
              : 'Businesses you\'ve saved for later'}
          </p>
        </div>
      </div>

      {/* Favorites list */}
      {!favorites || favorites.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Save businesses you love and find them here quickly.
              </p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Search className="h-4 w-4" /> Explore Businesses
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((fav) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const biz = fav.businesses as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const addr = Array.isArray(biz?.addresses) ? biz.addresses[0] as any : null
            const location = addr ? `${addr.city}, ${addr.state}` : null

            return (
              <Card key={fav.id} className="shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {/* Business logo */}
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {biz?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover" />
                      ) : (
                        <Star className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{biz?.name ?? 'Business'}</p>
                      {location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {location}
                        </p>
                      )}
                    </div>
                    {/* Remove from favorites */}
                    <form action={removeFavorite}>
                      <input type="hidden" name="favorite_id" value={fav.id} />
                      <button
                        type="submit"
                        title="Remove from favorites"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </form>
                  </div>

                  {biz?.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{biz.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                      Saved {new Date(fav.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <Link
                      href={`/business/${biz?.id}`}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      View details →
                    </Link>
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
