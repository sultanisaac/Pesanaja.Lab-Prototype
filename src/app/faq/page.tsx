import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Pesanaja.Lab",
  description: "Frequently Asked Questions about Pesanaja.Lab. Everything you need to know about booking services and listing your business.",
};

const FAQS = [
  { q: "How do I book a service?", a: "You can search for a service, select a provider, and pick an available date and time. Once confirmed, you'll receive an email notification." },
  { q: "Is Pesanaja.Lab free to use for customers?", a: "Yes! Customers can browse and book services completely free of charge. You only pay for the services you book." },
  { q: "How can I list my business?", a: "You can register a business account, complete your profile, and pay a small activation fee via Xendit to list your services publicly." },
  { q: "How do I know the professionals are trusted?", a: "We have a verification process for businesses. Look for the 'Verified' badge on a business profile to know they have been vetted by our team." },
  { q: "Can I cancel or reschedule my booking?", a: "Yes, you can manage your bookings through your customer dashboard. Please note that businesses may have their own cancellation policies." },
  { q: "How do I leave a review for a service?", a: "After your appointment is completed, you can submit a review and rating directly from your bookings history in the dashboard." },
  { q: "What payment methods are supported?", a: "Customers generally pay the service provider directly at the time of service. For businesses, activation and subscription fees are processed securely via Xendit." },
  { q: "What if I can't find the service I'm looking for?", a: "We are constantly expanding our network across new locations. Try adjusting your search filters or check back soon as new businesses join every day." }
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="bg-secondary/50 py-24 min-h-[80vh]">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">Frequently Asked Questions</h1>
              <p className="mt-4 text-lg text-secondary-foreground">Everything you need to know about Pesanaja.Lab</p>
            </div>
            <div className="mx-auto max-w-3xl space-y-4">
              {FAQS.map((faq, i) => (
                <details key={i} className="group rounded-2xl border bg-white p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between font-heading text-lg font-semibold text-foreground list-none">
                    {faq.q}
                    <span className="ml-4 transition duration-300 group-open:rotate-45 text-primary shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </span>
                  </summary>
                  <div className="mt-4 text-secondary-foreground animate-in fade-in slide-in-from-top-2 duration-300">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
