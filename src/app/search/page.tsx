import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Filter, Star, BadgeCheck, Heart, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const location = searchParams.location || "";

  const supabase = await createClient();

  // Basic search query for verified and active businesses
  let dbQuery = supabase
    .from('businesses')
    .select(`
      id, name, description, banner_url, logo_url,
      services ( price ),
      addresses ( city, state )
    `)
    .eq('is_active', true)
    .eq('status', 'verified');

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }
  // We can add location filtering later if needed

  const { data: businesses } = await dbQuery;
  const results = businesses || [];

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white border-b sticky top-[64px] z-30">
        <div className="container mx-auto px-4 py-4">
          <form className="flex flex-col sm:flex-row gap-4 items-center">
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
                placeholder="Location" 
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto h-12 px-8">Search</Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto h-12 sm:hidden"><SlidersHorizontal className="mr-2 h-4 w-4"/> Filters</Button>
          </form>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4 flex items-center"><Filter className="mr-2 h-5 w-5"/> Filters</h3>
              
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {["Dentist", "Beauty Salon", "Car Wash", "Home Cleaning"].map(cat => (
                      <div key={cat} className="flex items-center space-x-2">
                        <input type="checkbox" id={`cat-${cat}`} className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor={`cat-${cat}`} className="text-sm font-normal">{cat}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min" className="h-9" />
                    <span>-</span>
                    <Input placeholder="Max" className="h-9" />
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <h4 className="font-medium mb-3">Minimum Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5].map(rating => (
                      <div key={rating} className="flex items-center space-x-2">
                        <input type="radio" name="rating" id={`rating-${rating}`} className="text-primary focus:ring-primary h-4 w-4" />
                        <Label htmlFor={`rating-${rating}`} className="text-sm font-normal flex items-center">
                          {rating} <Star className="h-3 w-3 fill-warning text-warning ml-1" /> & Up
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div>
                  <h4 className="font-medium mb-3">More Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="open-now" className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                      <Label htmlFor="open-now" className="text-sm font-normal">Open Now</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="verified" className="rounded border-input text-primary focus:ring-primary h-4 w-4" />
                      <Label htmlFor="verified" className="text-sm font-normal">Verified Only</Label>
                    </div>
                  </div>
                </div>

              </div>
              <Button className="w-full mt-6">Apply Filters</Button>
            </div>
          </aside>

          {/* Search Results */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{results.length} results found {query && `for "${query}"`}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select className="text-sm border-0 bg-transparent font-medium focus:ring-0 cursor-pointer">
                  <option>Relevance</option>
                  <option>Highest Rated</option>
                  <option>Lowest Price</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>

            {/* List of results */}
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-border shadow-sm">
                  <p className="text-muted-foreground text-lg">No businesses found matching your criteria.</p>
                  <Link href="/search" className="text-primary font-medium hover:underline mt-2 inline-block">Clear filters</Link>
                </div>
              ) : (
                results.map((item) => {
                  // Calculate starting price
                  const prices = item.services?.map((s: { price: number }) => s.price) || [];
                  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                  
                  // Extract location safely (if it's an array or object)
                  const addressList = item.addresses as { city?: string; state?: string }[] | null;
                  const firstAddress = Array.isArray(addressList) ? addressList[0] : addressList;
                  const locationStr = firstAddress 
                    ? `${firstAddress.city || ''}, ${firstAddress.state || ''}`.replace(/^, /, '').replace(/, $/, '')
                    : 'Location varies';

                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 bg-muted">
                          {item.banner_url || item.logo_url ? (
                            <Image
                              src={item.banner_url || item.logo_url || ''}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-4xl font-heading font-bold opacity-20">
                              {item.name.charAt(0)}
                            </div>
                          )}
                          <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardContent className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Link href={`/business/${item.id}`} className="hover:underline">
                                    <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                                  </Link>
                                  <BadgeCheck className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-sm text-secondary-foreground mb-2">{locationStr}</p>
                              </div>
                              <div className="flex items-center bg-warning/10 px-2 py-1 rounded">
                                <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                                <span className="font-bold text-sm">--</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {item.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Starting from</p>
                              <p className="font-bold">
                                {minPrice !== null ? `Rp ${minPrice.toLocaleString('id-ID')}` : 'Varies'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/business/${item.id}`} className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex")}>View Profile</Link>
                              <Link href={`/business/${item.id}`} className={cn(buttonVariants())}>Book Now</Link>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
            
            {/* Pagination placeholder */}
            <div className="flex justify-center mt-10">
              <div className="flex gap-1">
                <Button variant="outline" size="icon" disabled>&lt;</Button>
                <Button variant="default" size="icon">1</Button>
                <Button variant="outline" size="icon">2</Button>
                <Button variant="outline" size="icon">3</Button>
                <Button variant="outline" size="icon">&gt;</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
