import { Wrench } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance | Pesanaja.Lab",
  description: "We are currently performing scheduled maintenance. We will be back online shortly.",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4 relative overflow-hidden">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-brand/20">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand/20 opacity-75"></div>
        <Wrench className="h-16 w-16 text-primary relative z-10" />
      </div>
      
      <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl relative z-10">
        Under Maintenance
      </h1>
      
      <p className="mx-auto max-w-md text-lg text-secondary-foreground relative z-10">
        We&apos;re currently upgrading <span className="font-semibold text-primary">Pesanaja.Lab</span> to bring you an even better experience. We&apos;ll be back shortly!
      </p>
      
      {/* Decorative Background Elements */}
      <div className="absolute left-1/2 top-0 -z-10 h-full w-[150%] -translate-x-1/2 bg-[url('/noise.svg')] opacity-10"></div>
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand/50 blur-3xl"></div>
    </div>
  );
}
