import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import { BusinessStorefront } from './BusinessStorefront'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch business with owner profile
  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id, name, description, contact_email, contact_phone,
      status, is_active, logo_url, banner_url, created_at, operating_hours,
      profiles ( first_name, last_name, email, avatar_url ),
      services ( id, name, description, price, duration_minutes, is_active )
    `)
    .eq('id', id)
    .single()

  if (error || !business) notFound()

  // Fetch extra data for the storefront
  const { data: { user } } = await supabase.auth.getUser()
  
  const [reviewsResponse, addressResponse, favoriteResponse] = await Promise.all([
    supabase.from('reviews').select('id, rating, comment, created_at, customer:profiles(first_name, last_name)').eq('business_id', id),
    supabase.from('addresses').select('street_address, city, state, postal_code').eq('business_id', id).single(),
    user ? supabase.from('favorites').select('id').eq('business_id', id).eq('customer_id', user.id).single() : Promise.resolve({ data: null })
  ])

  const reviews = reviewsResponse.data || []
  const address = addressResponse.data || null
  const isFavorite = !!favoriteResponse.data

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1">
        <BusinessStorefront 
          business={business}
          services={services}
          reviews={reviews as any}
          address={address}
          isFavorite={isFavorite}
          isAuthenticated={!!user}
        />
      </main>

      <Footer />
    </div>
  )
}
