import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Resources | Pesanaja.Lab',
  description: 'Guides and resources to help you grow your business',
}

export default function ResourcesPage() {
  const resources = [
    {
      title: "How to Optimize Your Business Profile",
      category: "Guide",
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      desc: "Learn the best practices for setting up your profile, taking great photos, and writing descriptions that convert visitors into customers."
    },
    {
      title: "Pricing Strategy for Local Services",
      category: "Strategy",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      desc: "Discover how to price your services competitively while maximizing your profit margins in your local market."
    },
    {
      title: "Managing Customer Reviews",
      category: "Tips",
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
      desc: "A comprehensive guide on how to handle both positive and negative reviews to build a trustworthy brand reputation."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-secondary/30 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-6xl mx-auto">
            <Link href="/">
              <Button variant="ghost" className="pl-0 text-secondary-foreground hover:text-primary hover:bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
          <div className="mb-16 text-center">
            <h1 className="font-heading text-4xl font-bold text-foreground">Resources Hub</h1>
            <p className="mt-4 text-secondary-foreground text-lg">Everything you need to succeed and grow on Pesanaja.Lab</p>
          </div>
          
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {resources.map((resource, i) => (
              <Card key={i} className="group overflow-hidden rounded-3xl border transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    {resource.icon}
                  </div>
                  <span className="mb-3 block text-sm font-semibold tracking-wider text-primary uppercase">{resource.category}</span>
                  <h3 className="mb-4 font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-secondary-foreground">
                    {resource.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mx-auto mt-16 max-w-4xl rounded-3xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="mb-4 font-heading text-3xl font-bold">Ready to grow your business?</h2>
            <p className="mb-8 opacity-90 text-lg">Join thousands of local professionals already using Pesanaja.Lab to reach more customers.</p>
            <Link href="/register?role=business">
              <Button size="lg" className="rounded-xl bg-white text-primary hover:bg-gray-100 font-semibold h-12 px-8">
                Become a Partner Today
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
