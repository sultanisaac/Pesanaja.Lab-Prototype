'use client'

import { useState } from 'react'
import { Shield, ShieldAlert, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleAdminRole } from './actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserActionMenu({ userId, currentRole, isCurrentUser }: { userId: string, currentRole: string, isCurrentUser: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleToggleAdmin = async () => {
    setIsLoading(true)
    try {
      const result = await toggleAdminRole(userId, currentRole)
      if (result.error) {
        alert(`Error: ${result.error}`)
      } else {
        alert(`Success: User role has been updated to ${result.newRole}.`)
        router.refresh()
      }
    } catch {
      alert('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCurrentUser) {
    return <span className="text-xs text-muted-foreground italic">You</span>
  }

  const isAdmin = currentRole === 'admin'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-muted-foreground">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={handleToggleAdmin} 
          disabled={isLoading}
          className={isAdmin ? "text-destructive focus:text-destructive" : "text-success focus:text-success"}
        >
          {isAdmin ? (
            <>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Remove Admin
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Promote to Admin
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
