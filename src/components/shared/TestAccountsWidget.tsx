'use client'

import { KeyRound, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function TestAccountsWidget() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

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
          "flex items-center justify-center bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer list-none select-none",
          "ml-auto"
        )}
      >
        <KeyRound className="h-6 w-6" />
      </summary>

      {/* Widget Panel */}
      <div className="w-80 bg-white border border-border shadow-xl rounded-2xl rounded-tr-none overflow-hidden animate-in fade-in duration-200 mt-[-1px]">
        <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-foreground font-heading">Test Credentials</h3>
            <p className="text-xs text-muted-foreground mt-1">Click the copy icon to copy.</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {accounts.map((acc, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{acc.role}</span>
              <div className="bg-muted rounded-md p-2 text-sm flex flex-col space-y-2">
                <div className="flex justify-between items-center bg-background rounded px-2 py-1.5 border border-border/50">
                  <span className="font-medium text-foreground text-xs">{acc.email}</span>
                  <button onClick={() => handleCopy(acc.email)} className="text-muted-foreground hover:text-primary transition-colors" title="Copy Email">
                    {copiedText === acc.email ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="flex justify-between items-center bg-background rounded px-2 py-1.5 border border-border/50">
                  <span className="text-muted-foreground text-xs">Pass: {acc.pass}</span>
                  <button onClick={() => handleCopy(acc.pass)} className="text-muted-foreground hover:text-primary transition-colors" title="Copy Password">
                    {copiedText === acc.pass ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
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
