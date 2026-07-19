import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Privacy Policy | Pesanaja.Lab',
  description: 'Privacy Policy for Pesanaja.Lab',
}

export default function PrivacyPage() {
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
            <h1 className="mb-8 font-heading text-4xl font-bold text-foreground">Privacy Policy</h1>
            <div className="prose prose-slate max-w-none text-secondary-foreground">
              <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
              
              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, and payment method.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, develop new features, provide customer support to Users and Providers, and send product updates and administrative messages.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">3. Sharing of Information</h2>
              <p className="mb-4">
                We may share your information with our Service Providers to facilitate the booking process. We do not sell or share your personal information with third parties for their direct marketing purposes.
              </p>

              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">4. Data Security</h2>
              <p className="mb-4">
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
              </p>
              
              <h2 className="mt-8 mb-4 text-2xl font-bold text-foreground">5. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at business@asimetrilab.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
