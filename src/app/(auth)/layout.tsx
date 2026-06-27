import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand/10">
      {/* Left side - Decorative/Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div>
          <Link href="/" className="inline-block font-heading text-2xl font-bold tracking-tighter">
            Pesanaja<span className="text-brand">.Lab</span>
          </Link>
          <div className="mt-24 space-y-6">
            <h1 className="font-heading text-4xl font-bold leading-tight">
              Join the premier marketplace for local services.
            </h1>
            <p className="max-w-md text-lg text-primary-foreground/80">
              Find trusted professionals, book appointments, and manage everything in one place.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-brand/50"></div>
            ))}
          </div>
          <p className="text-sm font-medium">Over 10,000+ satisfied customers</p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 sm:px-6 lg:px-8 bg-background">
        <div className="absolute top-4 left-4 lg:hidden">
          <Link href="/" className="font-heading text-xl font-bold tracking-tighter text-foreground">
            Pesanaja<span className="text-primary">.Lab</span>
          </Link>
        </div>
        
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "mb-8 -ml-4 hidden lg:inline-flex text-muted-foreground hover:text-foreground")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          
          {children}
        </div>
      </div>
    </div>
  );
}
