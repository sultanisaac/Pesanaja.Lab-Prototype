import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t bg-secondary">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">
              Pesanaja.Lab
            </span>
            <p className="text-sm text-secondary-foreground">
              Find trusted local services in one place. Discover, compare, and book the best professionals near you.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading font-semibold text-foreground">For Customers</h3>
            <Link href="/services" className="text-sm text-secondary-foreground hover:text-primary">Browse Services</Link>
            <Link href="/categories" className="text-sm text-secondary-foreground hover:text-primary">Categories</Link>
            <Link href="/how-it-works" className="text-sm text-secondary-foreground hover:text-primary">How it Works</Link>
            <Link href="/faq" className="text-sm text-secondary-foreground hover:text-primary">FAQ</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading font-semibold text-foreground">For Businesses</h3>
            <Link href="/partner" className="text-sm text-secondary-foreground hover:text-primary">Become a Partner</Link>
            <Link href="/pricing" className="text-sm text-secondary-foreground hover:text-primary">Pricing</Link>
            <Link href="/resources" className="text-sm text-secondary-foreground hover:text-primary">Resources</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="font-heading font-semibold text-foreground">Legal</h3>
            <Link href="/terms" className="text-sm text-secondary-foreground hover:text-primary">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-secondary-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/contact" className="text-sm text-secondary-foreground hover:text-primary">Contact Us</Link>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-secondary-foreground">
          <p>&copy; {new Date().getFullYear()} Pesanaja.Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
