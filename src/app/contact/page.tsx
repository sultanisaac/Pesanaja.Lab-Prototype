import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { ContactForm } from "./ContactForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Contact Us | Pesanaja.Lab',
  description: 'Get in touch with the Pesanaja.Lab team',
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/30 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <Link href="/">
                <Button variant="ghost" className="pl-0 text-secondary-foreground hover:text-primary hover:bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
            <div className="mb-12 text-center">
              <h1 className="font-heading text-4xl font-bold text-foreground">Contact Us</h1>
              <p className="mt-4 text-secondary-foreground text-lg">We'd love to hear from you. Please fill out this form or get in touch using the information below.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="flex flex-col space-y-8 rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
                <div>
                  <h3 className="font-heading text-2xl font-bold mb-6">Get in touch</h3>
                  <p className="opacity-90">Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.</p>
                </div>
                
                <div className="space-y-6 flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Phone Number</p>
                      <p className="font-semibold text-lg">+62 821 1715 945</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Email Address</p>
                      <p className="font-semibold text-lg">business@asimetrilab.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-80">Location</p>
                      <p className="font-semibold text-lg">Jakarta, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
