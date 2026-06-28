import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, CheckCircle, XCircle, Clock, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateBusinessStatus } from './actions'

export default async function AdminVerificationsPage() {
  const supabase = await createClient()

  // Get all businesses with owner info — focus on pending first
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      description,
      status,
      contact_email,
      contact_phone,
      created_at,
      profiles:owner_id (first_name, last_name, email)
    `)
    .order('status', { ascending: true }) // pending comes first alphabetically after others
    .order('created_at', { ascending: false })

  const pending = businesses?.filter((b) => b.status === 'pending') ?? []
  const reviewed = businesses?.filter((b) => b.status !== 'pending') ?? []

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-warning/10 text-warning' },
    verified: { label: 'Verified', color: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-destructive" /> Business Verifications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and approve or reject business registration requests.
        </p>
      </div>

      {/* Pending verifications */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Pending Review
            {pending.length > 0 && (
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                {pending.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>Businesses awaiting your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center text-sm text-destructive">Failed to load verifications.</div>
          ) : pending.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <p>All clear! No pending verifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((biz) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const owner = biz.profiles as any
                const ownerName = owner?.first_name
                  ? `${owner.first_name} ${owner.last_name ?? ''}`.trim()
                  : owner?.email?.split('@')[0] ?? 'Unknown'
                return (
                  <div
                    key={biz.id}
                    className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{biz.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Owner: {ownerName}</p>
                          {biz.contact_email && (
                            <p className="text-xs text-muted-foreground">{biz.contact_email}</p>
                          )}
                          {biz.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{biz.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Registered: {new Date(biz.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 shrink-0">
                        <form action={updateBusinessStatus}>
                          <input type="hidden" name="business_id" value={biz.id} />
                          <input type="hidden" name="status" value="verified" />
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors border border-success/20"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        </form>
                        <form action={updateBusinessStatus}>
                          <input type="hidden" name="business_id" value={biz.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors border border-destructive/20"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed businesses */}
      {reviewed.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Previously Reviewed</CardTitle>
            <CardDescription>Businesses that have already been approved or rejected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Re-review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviewed.map((biz) => {
                    const cfg = statusConfig[biz.status] ?? statusConfig.pending
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const owner = biz.profiles as any
                    const ownerName = owner?.first_name
                      ? `${owner.first_name} ${owner.last_name ?? ''}`.trim()
                      : owner?.email?.split('@')[0] ?? '—'
                    return (
                      <tr key={biz.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-2">
                          <p className="font-medium text-foreground">{biz.name}</p>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{ownerName}</td>
                        <td className="py-3 px-2">
                          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', cfg.color)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(biz.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            {biz.status !== 'verified' && (
                              <form action={updateBusinessStatus}>
                                <input type="hidden" name="business_id" value={biz.id} />
                                <input type="hidden" name="status" value="verified" />
                                <button type="submit" className="text-xs text-success hover:underline">Approve</button>
                              </form>
                            )}
                            {biz.status !== 'rejected' && (
                              <form action={updateBusinessStatus}>
                                <input type="hidden" name="business_id" value={biz.id} />
                                <input type="hidden" name="status" value="rejected" />
                                <button type="submit" className="text-xs text-destructive hover:underline">Reject</button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
