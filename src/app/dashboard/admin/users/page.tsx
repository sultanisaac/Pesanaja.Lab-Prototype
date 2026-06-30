import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Briefcase, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import UsersClient from './UsersClient'

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  customer: { label: 'Customer', color: 'bg-primary/10 text-primary', icon: User },
  business: { label: 'Business', color: 'bg-warning/10 text-warning', icon: Briefcase },
  admin: { label: 'Admin', color: 'bg-destructive/10 text-destructive', icon: Shield },
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get current user to check who is viewing the list
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, role, phone_number, created_at')
    .order('created_at', { ascending: false })

  const totalByRole = {
    customer: users?.filter((u) => u.role === 'customer').length ?? 0,
    business: users?.filter((u) => u.role === 'business').length ?? 0,
    admin: users?.filter((u) => u.role === 'admin').length ?? 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> Manage Users
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all registered platform users.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(totalByRole) as [keyof typeof roleConfig, number][]).map(([role, count]) => {
          const cfg = roleConfig[role]
          const Icon = cfg.icon
          return (
            <Card key={role} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">{cfg.label}s</CardTitle>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', cfg.color.replace('text-', 'bg-').split(' ')[0] + '/10')}>
                  <Icon className={cn('h-4 w-4', cfg.color.split(' ')[1])} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Users table - Client Component */}
      {error ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center text-sm text-destructive">
            Failed to load users. Please try again.
          </CardContent>
        </Card>
      ) : (
        <UsersClient users={users || []} currentUserId={currentUser?.id} />
      )}
    </div>
  )
}
