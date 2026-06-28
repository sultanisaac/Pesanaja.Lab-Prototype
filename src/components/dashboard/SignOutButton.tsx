'use client'

import { logout } from '@/app/(auth)/actions'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SignOutButton({ collapsed }: { collapsed: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          'w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors text-destructive hover:bg-destructive/10',
          collapsed && 'justify-center px-0'
        )}
        title={collapsed ? 'Sign Out' : undefined}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
    </form>
  )
}
