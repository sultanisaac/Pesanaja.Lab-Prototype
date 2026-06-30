'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, XCircle, Briefcase, Store, Mail, Phone, Calendar as CalendarIcon, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateBusinessStatus } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Type definition based on query from page.tsx
type Business = {
  id: string
  name: string
  description: string | null
  status: string
  contact_email: string | null
  contact_phone: string | null
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
}

const bizStatusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'bg-warning/10 text-warning'           },
  verified: { label: 'Verified', color: 'bg-success/10 text-success'           },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive'   },
}

export default function VerificationsClient({
  pendingBiz,
  reviewedBiz
}: {
  pendingBiz: Business[]
  reviewedBiz: Business[]
}) {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null)

  const handleRowClick = (biz: Business) => {
    setSelectedBiz(biz)
  }

  const handleCloseModal = () => {
    setSelectedBiz(null)
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Pending Review
            {pendingBiz.length > 0 && (
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                {pendingBiz.length}
              </span>
            )}
          </CardTitle>
          <CardDescription>Business profiles awaiting verification</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBiz.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <p>All clear! No pending verifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBiz.map((biz) => {
                const owner = biz.profiles
                const ownerName = owner?.first_name
                  ? `${owner.first_name} ${owner.last_name ?? ''}`.trim()
                  : owner?.email?.split('@')[0] ?? 'Unknown'
                return (
                  <div 
                    key={biz.id} 
                    className="p-4 rounded-xl border border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors group"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('form')) return // allow form click
                      handleRowClick(biz)
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{biz.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Owner: {ownerName}</p>
                          {biz.contact_email && <p className="text-xs text-muted-foreground">{biz.contact_email}</p>}
                          {biz.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{biz.description}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            Registered: {new Date(biz.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <form action={updateBusinessStatus}>
                          <input type="hidden" name="business_id" value={biz.id} />
                          <input type="hidden" name="status" value="verified" />
                          <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors border border-success/20">
                            <CheckCircle className="h-3.5 w-3.5" /> Verify
                          </button>
                        </form>
                        <form action={updateBusinessStatus}>
                          <input type="hidden" name="business_id" value={biz.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors border border-destructive/20">
                            <XCircle className="h-3.5 w-3.5" /> Reject
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

      {/* History */}
      {reviewedBiz.length > 0 && (
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
                  {reviewedBiz.map((biz) => {
                    const cfg = bizStatusConfig[biz.status] ?? bizStatusConfig.pending
                    const owner = biz.profiles
                    const ownerName = owner?.first_name
                      ? `${owner.first_name} ${owner.last_name ?? ''}`.trim()
                      : owner?.email?.split('@')[0] ?? '—'
                    return (
                      <tr 
                        key={biz.id} 
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('form')) return
                          handleRowClick(biz)
                        }}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{biz.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{ownerName}</td>
                        <td className="py-3 px-2">
                          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', cfg.color)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(biz.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <form action={updateBusinessStatus}>
                            <input type="hidden" name="business_id" value={biz.id} />
                            <input type="hidden" name="status" value={biz.status === 'verified' ? 'rejected' : 'verified'} />
                            <button
                              type="submit"
                              className={cn(
                                'text-xs font-semibold hover:underline',
                                biz.status === 'verified' ? 'text-destructive' : 'text-success'
                              )}
                            >
                              {biz.status === 'verified' ? 'Revoke' : 'Approve'}
                            </button>
                          </form>
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

      {/* Business Details Modal */}
      <Dialog open={!!selectedBiz} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-xl w-full sm:rounded-xl p-0 overflow-hidden bg-background">
          {selectedBiz && (
            <>
              <DialogHeader className="p-6 bg-muted/30 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold font-heading text-foreground">
                        {selectedBiz.name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                          bizStatusConfig[selectedBiz.status]?.color || bizStatusConfig.pending.color
                        )}>
                          {bizStatusConfig[selectedBiz.status]?.label || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Business Information</h4>
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                    {selectedBiz.description && (
                      <p className="text-sm text-foreground">
                        {selectedBiz.description}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" /> {selectedBiz.contact_email || 'No email provided'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" /> {selectedBiz.contact_phone || 'No phone provided'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" /> Registered {new Date(selectedBiz.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Owner Information</h4>
                  <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {selectedBiz.profiles?.first_name 
                          ? `${selectedBiz.profiles.first_name} ${selectedBiz.profiles.last_name || ''}`.trim() 
                          : 'Unknown Owner'}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedBiz.profiles?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors"
                >
                  Close
                </button>

                <div className="flex gap-2">
                  <form action={updateBusinessStatus} onSubmit={handleCloseModal}>
                    <input type="hidden" name="business_id" value={selectedBiz.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", 
                      selectedBiz.status === 'rejected' ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed' : 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                    )} disabled={selectedBiz.status === 'rejected'}>
                      Reject
                    </button>
                  </form>
                  <form action={updateBusinessStatus} onSubmit={handleCloseModal}>
                    <input type="hidden" name="business_id" value={selectedBiz.id} />
                    <input type="hidden" name="status" value="verified" />
                    <button type="submit" className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                      selectedBiz.status === 'verified' ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed' : 'bg-success text-success-foreground hover:bg-success/90'
                    )} disabled={selectedBiz.status === 'verified'}>
                      Verify
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
