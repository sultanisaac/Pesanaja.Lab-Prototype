import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ShieldCheck, CheckCircle, XCircle, Clock, Briefcase,
  ArrowUpCircle, User, Mail, Phone, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { approveUpgradeRequest, rejectUpgradeRequest } from '../upgrade-requests/actions'
import VerificationsClient from './VerificationsClient'

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; success?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const activeTab = params.tab === 'upgrades' ? 'upgrades' : 'verifications'

  // ── Business profile verifications ──
  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      id, name, description, status, contact_email, contact_phone, created_at,
      profiles:owner_id (first_name, last_name, email)
    `)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false })

  const pendingBiz   = businesses?.filter((b) => b.status === 'pending')  ?? []
  const reviewedBiz  = businesses?.filter((b) => b.status !== 'pending')  ?? []

  // ── Role upgrade requests ──
  const { data: upgradeRequests } = await supabase
    .from('business_upgrade_requests')
    .select(`
      id, business_name, description, contact_email, contact_phone,
      status, admin_note, created_at, reviewed_at,
      user:profiles!business_upgrade_requests_user_id_fkey(first_name, last_name, email),
      reviewer:profiles!business_upgrade_requests_reviewed_by_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  const pendingUpgrades   = upgradeRequests?.filter((r) => r.status === 'pending')  ?? []
  const reviewedUpgrades  = upgradeRequests?.filter((r) => r.status !== 'pending')  ?? []

  const upgStatusCfg: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
    pending:  { label: 'Pending',  classes: 'bg-warning/10 text-warning',         icon: Clock       },
    approved: { label: 'Approved', classes: 'bg-success/10 text-success',         icon: CheckCircle },
    rejected: { label: 'Rejected', classes: 'bg-destructive/10 text-destructive', icon: XCircle     },
  }

  const tabs = [
    {
      id: 'verifications',
      label: 'Business Verifications',
      icon: ShieldCheck,
      badge: pendingBiz.length,
    },
    {
      id: 'upgrades',
      label: 'Upgrade Requests',
      icon: ArrowUpCircle,
      badge: pendingUpgrades.length,
    },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-destructive" /> Verifications & Requests
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review business profile verifications and customer upgrade requests in one place.
        </p>
      </div>

      {/* Feedback banners */}
      {params.success === 'updated' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
          <CheckCircle className="h-5 w-5 shrink-0" /> Business status updated successfully.
        </div>
      )}
      {params.success === 'approved' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
          <CheckCircle className="h-5 w-5 shrink-0" /> Upgrade approved — account has been switched to Business Owner.
        </div>
      )}
      {params.success === 'rejected' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          <XCircle className="h-5 w-5 shrink-0" /> Request rejected.
        </div>
      )}
      {params.error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Error: {params.error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <a
              key={tab.id}
              href={`/dashboard/admin/verifications${tab.id === 'upgrades' ? '?tab=upgrades' : ''}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                  isActive ? 'bg-warning text-white' : 'bg-warning/20 text-warning'
                )}>
                  {tab.badge}
                </span>
              )}
            </a>
          )
        })}
      </div>
      {/* ═══════════════ TAB: BUSINESS VERIFICATIONS ═══════════════ */}
      {activeTab === 'verifications' && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <VerificationsClient pendingBiz={(pendingBiz as any) || []} reviewedBiz={(reviewedBiz as any) || []} />
      )}

      {/* ═══════════════ TAB: UPGRADE REQUESTS ═══════════════ */}
      {activeTab === 'upgrades' && (
        <div className="space-y-6">
          {/* Pending upgrades */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Pending Upgrade Requests
                {pendingUpgrades.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-warning text-white rounded-full">
                    {pendingUpgrades.length}
                  </span>
                )}
              </CardTitle>
              <CardDescription>Customers applying to become Business Owners</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUpgrades.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CheckCircle className="h-10 w-10 text-success/40" />
                  <p className="text-sm text-muted-foreground">All caught up! No pending upgrade requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUpgrades.map((req) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const applicant = req.user as any
                    const applicantName = applicant
                      ? `${applicant.first_name ?? ''} ${applicant.last_name ?? ''}`.trim() || applicant.email
                      : 'Unknown'
                    const initials = applicantName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

                    return (
                      <div key={req.id} className="border border-border rounded-xl p-5 space-y-4 bg-muted/20">
                        {/* Applicant */}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {initials || <User className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{applicantName}</p>
                            <p className="text-xs text-muted-foreground">{applicant?.email}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Applied {new Date(req.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-warning/10 text-warning">PENDING</span>
                        </div>

                        {/* Business details */}
                        <div className="grid gap-3 sm:grid-cols-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">Business Name</p>
                              <p className="font-medium text-foreground">{req.business_name}</p>
                            </div>
                          </div>
                          {req.contact_email && (
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Contact Email</p>
                                <p className="font-medium text-foreground">{req.contact_email}</p>
                              </div>
                            </div>
                          )}
                          {req.contact_phone && (
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium text-foreground">{req.contact_phone}</p>
                              </div>
                            </div>
                          )}
                          {req.description && (
                            <div className="flex items-start gap-2 sm:col-span-2">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-foreground">{req.description}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Approve / Reject */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
                          <form action={approveUpgradeRequest} className="flex-1 space-y-2">
                            <input type="hidden" name="request_id" value={req.id} />
                            <textarea
                              name="admin_note"
                              rows={2}
                              placeholder="Optional note (e.g. Welcome to Pesanaja.Lab!)"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-success/30 focus:border-success transition-colors resize-none"
                            />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors">
                              <CheckCircle className="h-4 w-4" /> Approve & Upgrade Role
                            </button>
                          </form>
                          <form action={rejectUpgradeRequest} className="flex-1 space-y-2">
                            <input type="hidden" name="request_id" value={req.id} />
                            <textarea
                              name="admin_note"
                              rows={2}
                              placeholder="Reason for rejection"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive transition-colors resize-none"
                            />
                            <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold rounded-lg hover:bg-destructive/20 transition-colors">
                              <XCircle className="h-4 w-4" /> Reject Request
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade history */}
          {reviewedUpgrades.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Review History</CardTitle>
                <CardDescription>Previously reviewed upgrade requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewedUpgrades.map((req) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const applicant = req.user as any
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const reviewer = req.reviewer as any
                    const cfg = upgStatusCfg[req.status] ?? upgStatusCfg.pending
                    const StatusIcon = cfg.icon
                    const applicantName = applicant
                      ? `${applicant.first_name ?? ''} ${applicant.last_name ?? ''}`.trim() || applicant.email
                      : 'Unknown'

                    return (
                      <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{applicantName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {req.business_name}
                            {reviewer && ` · Reviewed by ${reviewer.first_name ?? ''} ${reviewer.last_name ?? ''}`.trim()}
                          </p>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.classes)}>
                            <StatusIcon className="h-3 w-3" /> {cfg.label}
                          </span>
                          {req.reviewed_at && (
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(req.reviewed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
