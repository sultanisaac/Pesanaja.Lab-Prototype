import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Filter, Star, BadgeCheck, Heart, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/lib/supabase/server';

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; location?: string; min_price?: string; max_price?: string; min_rating?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const location = searchParams.location || "";
  const minPrice = searchParams.min_price ? parseInt(searchParams.min_price) : null;
  const maxPrice = searchParams.max_price ? parseInt(searchParams.max_price) : null;
  const minRating = searchParams.min_rating ? parseFloat(searchParams.min_rating) : null;

  const supabase = await createClient();

  // Fetch all active businesses with their addresses, services, and reviews
  let dbQuery = supabase
    .from('businesses')
    .select(`
      id, name, description, banner_url, logo_url,
      services ( id, price ),
      addresses ( city, state ),
      reviews ( rating )
    `)
    .eq('is_active', true);

  // Filter by business name
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  const { data: businesses } = await dbQuery;
  let results = businesses || [];

  // Filter by location (city or state) — done in JS since it's a joined table
  if (location) {
    const loc = location.toLowerCase();
    results = results.filter((b) => {
      const addrs = b.addresses as { city?: string; state?: string }[] | null;
      if (!addrs || addrs.length === 0) return false;
      return addrs.some(
        (a) =>
          a.city?.toLowerCase().includes(loc) ||
          a.state?.toLowerCase().includes(loc)
      );
    });
  }

  // Filter by price range — based on minimum service price
  if (minPrice !== null || maxPrice !== null) {
    results = results.filter((b) => {
      const prices = (b.services as { price: number }[] | null)?.map((s) => s.price) || [];
      if (prices.length === 0) return false;
      const lowestPrice = Math.min(...prices);
      if (minPrice !== null && lowestPrice < minPrice) return false;
      if (maxPrice !== null && lowestPrice > maxPrice) return false;
      return true;
    });
  }

  // Filter by minimum average rating
  if (minRating !== null) {
    results = results.filter((b) => {
      const ratings = (b.reviews as { rating: number }[] | null)?.map((r) => r.rating) || [];
      if (ratings.length === 0) return false;
      const avg = ratings.reduce((a, c) => a + c, 0) / ratings.length;
      return avg >= minRating;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white border-b sticky top-[64px] z-30">
        <div className="container mx-auto px-4 py-4">
          <form className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Preserve active filter params across search */}
            {minPrice !== null && <input type="hidden" name="min_price" value={minPrice} />}
            {maxPrice !== null && <input type="hidden" name="max_price" value={maxPrice} />}
            {minRating !== null && <input type="hidden" name="min_rating" value={minRating} />}
            <div className="flex-1 w-full flex items-center bg-muted/50 rounded-lg px-3">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                name="q"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-12"
                defaultValue={query}
                placeholder="What service are you looking for?"
              />
            </div>
            <div className="flex-1 w-full flex items-center bg-muted/50 rounded-lg px-3">
              <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                name="location"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-12"
                defaultValue={location}
                placeholder="City or State (e.g. Jakarta)"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto h-12 px-8">Search</Button>
          </form>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters — submit via form to URL params */}
          <aside className="hidden lg:block w-64 shrink-0">
            <form method="GET" action="/search">
              {/* Preserve service name + location search params */}
              {query && <input type="hidden" name="q" value={query} />}
              {location && <input type="hidden" name="location" value={location} />}

              <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-6">
                <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Filters
                </h3>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Price Range (Rp)</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      name="min_price"
                      type="number"
                      placeholder="Min"
                      defaultValue={minPrice ?? ""}
                      className="h-9 text-sm"
                      min={0}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      name="max_price"
                      type="number"
                      placeholder="Max"
                      defaultValue={maxPrice ?? ""}
                      className="h-9 text-sm"
                      min={0}
                    />
                  </div>
                </div>

                {/* Minimum Rating */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="min_rating"
                          value={rating}
                          defaultChecked={minRating === rating}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <span className="text-sm font-normal flex items-center gap-1 group-hover:text-primary transition-colors">
                          {rating}+ <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        </span>
                      </label>
                    ))}
                    {minRating !== null && (
                      <Link
                        href={`/search?${query ? `q=${encodeURIComponent(query)}&` : ''}${location ? `location=${encodeURIComponent(location)}` : ''}`}
                        className="text-xs text-muted-foreground hover:text-primary underline mt-1 inline-block"
                      >
                        Clear rating filter
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <Button type="submit" className="w-full">Apply Filters</Button>
                  <Link
                    href="/search"
                    className={cn(buttonVariants({ variant: "ghost" }), "w-full text-muted-foreground text-sm")}
                  >
                    Clear All
                  </Link>
                </div>
              </div>
            </form>
          </aside>

          {/* Search Results */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {results.length} result{results.length !== 1 ? 's' : ''} found
                {query && <span className="text-primary"> for &quot;{query}&quot;</span>}
                {location && <span className="text-muted-foreground text-base font-normal"> in {location}</span>}
              </h2>
              {/* Mobile filter button */}
              <Button type="button" variant="outline" className="lg:hidden h-10">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>

            {/* Active filter pills */}
            {(minPrice !== null || maxPrice !== null || minRating !== null) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {(minPrice !== null || maxPrice !== null) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    Price: Rp{minPrice?.toLocaleString('id-ID') ?? '0'} – {maxPrice ? `Rp${maxPrice.toLocaleString('id-ID')}` : '∞'}
                  </span>
                )}
                {minRating !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs rounded-full font-medium">
                    <Star className="h-3 w-3 fill-warning" /> {minRating}+ stars
                  </span>
                )}
              </div>
            )}

            {/* List of results */}
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-border shadow-sm">
                  <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">No businesses found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                  <Link href="/search" className="text-primary font-medium hover:underline mt-4 inline-block">
                    Clear all filters
                  </Link>
                </div>
              ) : (
                results.map((item) => {
                  const prices = (item.services as { price: number }[] | null)?.map((s) => s.price) || [];
                  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

                  const addressList = item.addresses as { city?: string; state?: string }[] | null;
                  const firstAddress = Array.isArray(addressList) ? addressList[0] : addressList;
                  const locationStr = firstAddress
                    ? [firstAddress.city, firstAddress.state].filter(Boolean).join(', ')
                    : 'Location not set';

                  const ratings = (item.reviews as { rating: number }[] | null)?.map((r) => r.rating) || [];
                  const avgRating = ratings.length > 0
                    ? (ratings.reduce((a, c) => a + c, 0) / ratings.length).toFixed(1)
                    : null;

                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow bg-white">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-56 h-44 sm:h-auto shrink-0 bg-muted">
                          {item.banner_url || item.logo_url ? (
                            <Image
                              src={item.banner_url || item.logo_url || ''}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-5xl font-heading font-bold opacity-10">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardContent className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <Link href={`/business/${item.id}`} className="hover:underline">
                                  <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                                </Link>
                                <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                              </div>
                              <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded shrink-0">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span className="font-bold text-sm">{avgRating ?? '--'}</span>
                                {ratings.length > 0 && (
                                  <span className="text-xs text-muted-foreground">({ratings.length})</span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                              <MapPin className="h-3.5 w-3.5 shrink-0" /> {locationStr}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                            <div>
                              <p className="text-xs text-muted-foreground">Starting from</p>
                              <p className="font-bold text-foreground">
                                {minPrice !== null ? `Rp ${minPrice.toLocaleString('id-ID')}` : 'Varies'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/business/${item.id}`} className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex")}>
                                View Profile
                              </Link>
                              <Link href={`/business/${item.id}`} className={cn(buttonVariants())}>
                                Book Now
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
