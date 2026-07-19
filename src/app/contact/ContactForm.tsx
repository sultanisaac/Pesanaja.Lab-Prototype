'use client';

import { useActionState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from './actions';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, null);

  if (state?.success) {
    return (
      <div className="rounded-3xl border bg-white p-8 shadow-sm md:p-12 text-center h-full flex flex-col items-center justify-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground">Message Sent!</h3>
        <p className="mt-2 text-secondary-foreground">Thank you for contacting us. We&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm md:p-12">
      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {state.error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" className="h-12" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" className="h-12" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+62 812 3456 7890" className="h-12" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <textarea 
            id="message" 
            name="message"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="How can we help you?"
            required
          ></textarea>
        </div>
        
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-70"
        >
          {isPending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
