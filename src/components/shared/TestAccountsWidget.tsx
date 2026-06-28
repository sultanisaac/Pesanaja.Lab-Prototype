'use client'

import { KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TestAccountsWidget() {
  const accounts = [
    { role: 'Admin', email: 'admin1@gmail.com', pass: 'admin123' },
    { role: 'Business Owner', email: 'bo1@gmail.com', pass: 'bo123' },
    { role: 'Customer', email: 'customer1@gmail.com', pass: 'customer123' },
  ]

  return (
    <details className="fixed top-24 right-4 z-[9999] group flex flex-col items-end">
      {/* Toggle Button */}
      <summary
        className={cn(
          "flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer list-none select-none",
          "group-open:rounded-b-none group-open:shadow-none ml-auto w-max"
        )}
      >
        <KeyRound className="h-4 w-4" />
        Test Accounts
        {/* Chevron icons handled via CSS/group-open to avoid JS state */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
      </summary>

      {/* Widget Panel */}
      <div className="w-80 bg-white border border-border shadow-xl rounded-2xl rounded-tr-none overflow-hidden animate-in fade-in duration-200 mt-[-1px]">
        <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-foreground font-heading">Test Credentials</h3>
            <p className="text-xs text-muted-foreground mt-1">Use these to explore different roles.</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {accounts.map((acc, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{acc.role}</span>
              <div className="bg-muted rounded-md p-2 text-sm flex justify-between items-center group/item">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{acc.email}</span>
                  <span className="text-muted-foreground text-xs">Pass: {acc.pass}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-primary/5 text-xs text-primary border-t border-primary/10">
          <strong>Note:</strong> You can register a new account or login with Google, and it will automatically be a Customer account (not Business Owner nor Admin).
        </div>
      </div>
    </details>
  )
}
