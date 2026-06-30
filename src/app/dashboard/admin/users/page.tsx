import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Shield, Briefcase, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import UserActionMenu from './UserActionMenu'

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

      {/* Users table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Users</CardTitle>
          <CardDescription>{users?.length ?? 0} registered accounts on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center text-sm text-destructive">
              Failed to load users. Please try again.
            </div>
          ) : !users || users.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => {
                    const cfg = roleConfig[user.role ?? 'customer'] ?? roleConfig.customer
                    const Icon = cfg.icon
                    const displayName =
                      user.first_name
                        ? `${user.first_name} ${user.last_name ?? ''}`.trim()
                        : user.email?.split('@')[0] ?? '—'
                    return (
                      <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-foreground">{displayName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{user.email ?? '—'}</td>
                        <td className="py-3 px-2">
                          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', cfg.color)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{user.phone_number ?? '—'}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <UserActionMenu 
                            userId={user.id} 
                            currentRole={user.role ?? 'customer'} 
                            isCurrentUser={currentUser?.id === user.id} 
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
