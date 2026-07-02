'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, CheckCircle, XCircle, Store, Mail, Phone, Calendar as CalendarIcon, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { updateBusinessStatus } from '../verifications/actions'

// Type definition based on query from page.tsx
type Business = {
  id: string
  name: string
  description: string | null
  status: string
  payment_status: string
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
  owner_id: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string | null
  } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  verified: { label: 'Verified', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
}

export default function BusinessesClient({ businesses }: { businesses: Business[] }) {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null)

  const handleRowClick = (biz: Business) => {
    setSelectedBiz(biz)
  }

  const handleCloseModal = () => {
    setSelectedBiz(null)
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Businesses</CardTitle>
          <CardDescription>{businesses?.length ?? 0} businesses registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {!businesses || businesses.length === 0 ? (
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
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {businesses.map((biz) => {
                    const cfg = statusConfig[biz.status] ?? statusConfig.pending
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
                            <div>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{biz.name}</p>
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
                            'text-[10px] font-semibold px-2 py-1 rounded-full capitalize',
                            biz.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          )}>
                            {biz.payment_status || 'unpaid'}
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
                          statusConfig[selectedBiz.status]?.color || statusConfig.pending.color
                        )}>
                          {statusConfig[selectedBiz.status]?.label || 'Pending'}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                          selectedBiz.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        )}>
                          {selectedBiz.payment_status || 'unpaid'}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          selectedBiz.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        )}>
                          {selectedBiz.is_active ? 'Active' : 'Inactive'}
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
    </>
  )
}
