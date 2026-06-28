'use client'

import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/client';
import { logout } from '@/app/(auth)/actions';
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <>
      <div className="bg-destructive text-destructive-foreground text-center py-1.5 px-4 text-xs font-medium tracking-wide">
        ⚠️ Prototype Version: This is a demonstration website. No real transactions or bookings will be processed.
      </div>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Pesanaja.Lab Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">
              Pesanaja<span className="text-foreground">.Lab</span>
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
              href="/search"
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
            {user ? (
              <>
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>Dashboard</Link>
                <form action={logout}>
                  <button type="submit" className={cn(buttonVariants({ variant: "outline" }), "border-danger text-danger hover:bg-danger/10")}>Sign Out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Login</Link>
                <Link href="/register" className={cn(buttonVariants(), "bg-primary text-primary-foreground hover:bg-primary-hover")}>Register</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
    </>
  );
}
