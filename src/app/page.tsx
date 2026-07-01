import { Search, MapPin, Star, BadgeCheck, ShieldCheck, Heart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '@/lib/supabase/server'

const POPULAR_SEARCHES = ["Dentist", "Beauty Salon", "Car Wash", "Clinic", "Restaurant", "Photographer"];

const CATEGORIES = [
  { name: "Health & Clinics", icon: ShieldCheck, count: "1.2k+" },
  { name: "Beauty & Spa", icon: Star, count: "850+" },
  { name: "Home Services", icon: MapPin, count: "2.1k+" },
  { name: "Automotive", icon: ShieldCheck, count: "430+" },
  { name: "Professional", icon: Star, count: "620+" },
  { name: "Events", icon: Star, count: "310+" },
];

export default async function Home() {
  const supabase = await createClient()

    const { data: results } = await supabase
    .from('businesses')
    .select('*, services(*), addresses(*)')
    .eq('is_active', true)
    .eq('status', 'verified')
    .limit(3);

  const trendingBusinesses = results || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-brand/30 py-24 md:py-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div
              className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700"
            >
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Find <span className="text-primary">Trusted</span> Local Services Near You
              </h1>
              <p className="text-lg text-secondary-foreground md:text-xl">
                Discover verified professionals, compare prices, and book appointments instantly. Your one-stop destination for everyday needs.
              </p>

              {/* Intelligent Search Bar */}
              <form action="/search" className="mx-auto mt-8 flex max-w-2xl flex-col items-center space-y-4 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:space-y-0">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="q"
                    className="h-12 border-0 bg-transparent pl-12 text-base shadow-none focus-visible:ring-0"
                    placeholder="What service are you looking for?"
                  />
                </div>
                <div className="hidden h-8 w-px bg-border sm:block"></div>
                <div className="relative flex-1 w-full">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="location"
                    className="h-12 border-0 bg-transparent pl-12 text-base shadow-none focus-visible:ring-0"
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
                <Button type="submit" className="h-12 w-full rounded-xl bg-primary px-8 text-base text-primary-foreground hover:bg-primary-hover sm:w-auto">
                  Search
                </Button>
              </form>

              {/* Popular Searches */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-secondary-foreground">Popular:</span>
                {POPULAR_SEARCHES.map((search) => (
                  <Link
                    key={search}
                    href={`/search?q=${search.toLowerCase()}`}
                    className="text-sm text-primary transition-colors hover:text-primary-hover hover:underline"
                  >
                    {search}
                  </Link>
                ))}
              </div>
              </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute left-1/2 top-0 -z-10 h-full w-[150%] -translate-x-1/2 bg-[url('/noise.svg')] opacity-10"></div>
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand/50 blur-3xl"></div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center space-y-4">
            <h2 className="font-heading text-3xl font-bold text-foreground">Explore Categories</h2>
            <p className="text-secondary-foreground">Browse services by popular categories</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md animate-in fade-in zoom-in-95 duration-500"
              >
                <Link href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-brand/50 p-4 transition-colors group-hover:bg-primary/10">
                        <category.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-medium text-foreground">{category.name}</h3>
                      <p className="mt-1 text-xs text-secondary-foreground">{category.count} businesses</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Businesses */}
        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col justify-between space-y-4 md:flex-row md:items-end md:space-y-0">
              <div className="space-y-4">
                <h2 className="font-heading text-3xl font-bold text-foreground">Trending Businesses</h2>
                <p className="text-secondary-foreground">Highly rated professionals in your area</p>
              </div>
              <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                View All Services
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trendingBusinesses.map((business: {
                id: string;
                name: string;
                description: string;
                status: string;
                banner_url: string;
                logo_url: string;
                addresses: { city: string; state: string }[];
                services: { price: number }[];
              }) => {
                const address = business.addresses?.[0];
                const locationStr = address ? `${address.city}, ${address.state}` : "Unknown Location";
                
                // Calculate lowest price if services exist
                let lowestPrice = 0;
                if (business.services && business.services.length > 0) {
                  lowestPrice = Math.min(...business.services.map((s: { price: number }) => s.price || 0));
                }
                const formattedPrice = lowestPrice > 0 
                  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(lowestPrice)
                  : "Price varies";

                const displayImage = business.banner_url || business.logo_url || "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=60";
                const displayLogo = business.logo_url || "https://images.unsplash.com/photo-1514416432279-50fac261c7dd?w=100&auto=format&fit=crop&q=60";

                return (
                  <div
                    key={business.id}
                    className="overflow-hidden transition-all hover:shadow-lg animate-in fade-in zoom-in-95 duration-500"
                  >
                    <Card className="overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative h-48 w-full bg-muted">
                        <Image
                          src={displayImage}
                          alt={business.name}
                          fill
                          className="object-cover"
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                        >
                          <Heart className="h-4 w-4 text-secondary-foreground" />
                        </Button>
                        <div className="absolute -bottom-6 left-6">
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm">
                            <Image
                              src={displayLogo}
                              alt={`${business.name} logo`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      <CardHeader className="pt-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-heading text-lg font-bold text-foreground line-clamp-1">{business.name}</h3>
                            {business.status === 'verified' && (
                              <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-sm font-medium">--</span>
                            <span className="text-xs text-secondary-foreground">(0)</span>
                          </div>
                        </div>
                        <p className="text-sm text-secondary-foreground line-clamp-1">{business.description || "Local service"}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-secondary-foreground truncate mr-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">{locationStr}</span>
                          </div>
                          <Badge variant="outline" className="border-success text-success whitespace-nowrap">
                            Open Now
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-6">
                        <div>
                          <p className="text-xs text-secondary-foreground">Starting from</p>
                          <p className="font-bold text-foreground">{formattedPrice}</p>
                        </div>
                        <Link href={`/business/${business.id}`} className={cn(buttonVariants(), "rounded-full bg-primary hover:bg-primary-hover shrink-0")}>
                          View Details
                        </Link>
                      </CardFooter>
                    </Card>
                  </div>
                );
              })}
            </div>
            {trendingBusinesses.length === 0 && (
               <div className="text-center py-12">
                 <p className="text-muted-foreground">No trending businesses found.</p>
               </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-24">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-4 text-secondary-foreground">Simple steps to find what you need or grow your business</p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Customer Flow */}
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="mb-8 font-heading text-2xl font-bold text-foreground">For Customers</h3>
              <div className="space-y-8">
                {[
                  { title: "Search", desc: "Find services near you easily.", step: "1" },
                  { title: "Compare", desc: "Read verified reviews and compare prices.", step: "2" },
                  { title: "Book / Contact", desc: "Connect with professionals directly.", step: "3" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-secondary-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Flow */}
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h3 className="mb-8 font-heading text-2xl font-bold text-foreground">For Businesses</h3>
              <div className="space-y-8">
                {[
                  { title: "Register", desc: "Create your business account.", step: "1" },
                  { title: "Setup", desc: "Add your services, prices, and locations.", step: "2" },
                  { title: "Grow", desc: "Publish your profile and get booked.", step: "3" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-secondary-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
