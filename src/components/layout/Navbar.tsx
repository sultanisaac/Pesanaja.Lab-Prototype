'use client'

import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/(auth)/actions';
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu when navigating
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="bg-destructive text-destructive-foreground text-center py-1.5 px-4 text-xs font-medium tracking-wide">
        ⚠️ Prototype Version: This is a demonstration website. No real transactions or bookings will be processed.
      </div>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
              <Image src="/logo.png" alt="Pesanaja.Lab Logo" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="font-heading text-xl md:text-2xl font-bold tracking-tight text-primary">
                Pesanaja<span className="text-foreground">.Lab</span>
              </span>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link
                href="/search"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
              >
                Browse Services
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
              >
                Contact Us
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>Dashboard</Link>
                    <form action={logout}>
                      <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-danger text-danger hover:bg-danger/10")}>Sign Out</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>Login</Link>
                    <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "bg-primary text-primary-foreground hover:bg-primary-hover")}>Register</Link>
                  </>
                )}
              </div>
              <button
                className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full h-[calc(100dvh-4rem)] flex flex-col justify-between bg-background border-t z-40">
            <div className="space-y-6 px-6 py-12 overflow-y-auto flex flex-col items-center">
              <Link
                href="/search"
                onClick={handleLinkClick}
                className="block text-2xl font-semibold tracking-tight text-foreground/80 hover:text-foreground text-center"
              >
                Browse Services
              </Link>
              <Link
                href="/faq"
                onClick={handleLinkClick}
                className="block text-2xl font-semibold tracking-tight text-foreground/80 hover:text-foreground text-center"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                onClick={handleLinkClick}
                className="block text-2xl font-semibold tracking-tight text-foreground/80 hover:text-foreground text-center"
              >
                Contact Us
              </Link>
            </div>
            
            <div className="border-t p-6 space-y-4 bg-background pb-12">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={handleLinkClick}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-lg font-medium")}
                  >
                    Dashboard
                  </Link>
                  <form action={logout} className="w-full">
                    <button type="submit" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-lg font-medium border-danger text-danger hover:bg-danger/10")}>Sign Out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center text-lg font-medium")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={handleLinkClick}
                    className={cn(buttonVariants({ size: "lg" }), "w-full justify-center text-lg font-medium bg-primary text-primary-foreground hover:bg-primary-hover")}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
