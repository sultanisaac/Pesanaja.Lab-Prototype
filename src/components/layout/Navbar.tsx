import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">
              Pesanaja.Lab
            </span>
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              Browse Services
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/partner"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              Become a Partner
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Login</Link>
            <Link href="/register" className={cn(buttonVariants(), "bg-primary text-primary-foreground hover:bg-primary-hover")}>Register</Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}
