import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Pricing | Pesanaja.Lab',
  description: 'Simple, transparent pricing for businesses',
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/30 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-5xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="pl-0 text-secondary-foreground hover:text-primary hover:bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
          <div className="mb-16 text-center">
            <h1 className="font-heading text-4xl font-bold text-foreground">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-secondary-foreground text-lg">Choose the right plan to grow your business on Pesanaja.Lab</p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Customer/Free Tier */}
            <div className="rounded-3xl border bg-white p-8 shadow-sm md:p-12">
              <h3 className="font-heading text-2xl font-bold text-foreground">For Customers</h3>
              <p className="mt-2 text-secondary-foreground">Everything you need to find and book services.</p>
              <div className="my-8">
                <span className="font-heading text-5xl font-bold">Free</span>
                <span className="text-secondary-foreground"> / forever</span>
              </div>
              <ul className="mb-8 space-y-4">
                {['Browse all services', 'Book appointments instantly', 'Receive email confirmations', 'Leave reviews and ratings'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full h-12 text-base rounded-xl">Create Account</Button>
              </Link>
            </div>

            {/* Business/Pro Tier */}
            <div className="rounded-3xl border-2 border-primary bg-white p-8 shadow-xl md:p-12 relative overflow-hidden">
              <div className="absolute top-6 right-[-30px] rotate-45 bg-primary px-10 py-1 text-sm font-bold text-primary-foreground shadow-sm">
                POPULAR
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">For Businesses</h3>
              <p className="mt-2 text-secondary-foreground">Powerful tools to manage and grow your customer base.</p>
              <div className="my-8">
                <span className="font-heading text-5xl font-bold">Rp 150k</span>
                <span className="text-secondary-foreground"> / month</span>
              </div>
              <ul className="mb-8 space-y-4">
                {['List unlimited services', 'Manage bookings & calendar', 'Automated email alerts', 'Dashboard analytics', 'Verified business badge'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-secondary-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=business">
                <Button className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground">Become a Partner</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
