import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Terms of Service | Pesanaja.Lab',
  description: 'Terms and conditions for using Pesanaja.Lab',
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/30 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-4xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="pl-0 text-secondary-foreground hover:text-primary hover:bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
          <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-8 shadow-sm md:p-12">
            <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Terms of Service</h1>
            <div className="prose prose-slate max-w-none text-secondary-foreground">
              <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Pesanaja.Lab, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">2. Description of Service</h2>
              <p className="mb-4">
                Pesanaja.Lab provides an online platform connecting customers with local service professionals. We act as an intermediary and are not responsible for the actual performance of the services booked through our platform.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">3. User Responsibilities</h2>
              <p className="mb-4">
                You agree to provide accurate information when registering an account and to keep your login credentials secure. Businesses agree to provide accurate pricing, availability, and to fulfill bookings to the best of their abilities.
              </p>
              
              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">4. Payments and Fees</h2>
              <p className="mb-4">
                Certain features for businesses may require a payment or subscription fee. All payments are processed securely via our third-party payment gateway (Xendit). We do not store your credit card details.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">5. Prototype Disclaimer</h2>
              <p className="mb-4">
                Please note that this is currently a prototype version of Pesanaja.Lab. No real services are provided, and no real monetary transactions should be expected to be fulfilled.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
