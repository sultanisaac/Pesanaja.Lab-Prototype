import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  verified: { label: 'Verified', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
}

export default async function AdminBusinessesPage() {
  const supabase = await createClient()

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      description,
      status,
      contact_email,
      contact_phone,
      is_active,
      created_at,
      owner_id,
      profiles:owner_id (first_name, last_name, email)
    `)
    .order('created_at', { ascending: false })

  const totalByStatus = {
    pending: businesses?.filter((b) => b.status === 'pending').length ?? 0,
    verified: businesses?.filter((b) => b.status === 'verified').length ?? 0,
    rejected: businesses?.filter((b) => b.status === 'rejected').length ?? 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-warning" /> Manage Businesses
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all registered businesses on the platform.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(totalByStatus) as [keyof typeof statusConfig, number][]).map(([status, count]) => {
          const cfg = statusConfig[status]
          const Icon = cfg.icon
          return (
            <Card key={status} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{cfg.label}</CardTitle>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', cfg.color.split(' ')[0])}>
                  <Icon className={cn('h-4 w-4', cfg.color.split(' ')[1])} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{count}</div>
                <p className="text-xs text-muted-foreground mt-1">Businesses</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Businesses table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Businesses</CardTitle>
          <CardDescription>{businesses?.length ?? 0} businesses registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center text-sm text-destructive">
              Failed to load businesses. Please try again.
            </div>
          ) : !businesses || businesses.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No businesses registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {businesses.map((biz) => {
                    const cfg = statusConfig[biz.status] ?? statusConfig.pending
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const owner = biz.profiles as any
                    const ownerName = owner?.first_name
                      ? `${owner.first_name} ${owner.last_name ?? ''}`.trim()
                      : owner?.email?.split('@')[0] ?? '—'
                    return (
                      <tr key={biz.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{biz.name}</p>
                              {biz.contact_email && (
                                <p className="text-xs text-muted-foreground">{biz.contact_email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{ownerName}</td>
                        <td className="py-3 px-2">
                          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', cfg.color)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-1 rounded-full',
                            biz.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {biz.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(biz.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
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
