'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Briefcase, Shield, Search, Mail, Phone, Calendar as CalendarIcon, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import UserActionMenu from './UserActionMenu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getUserDetailedInfo } from './actions'

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string | null
  phone_number: string | null
  created_at: string
}

type UserDetailedInfo = Profile & {
  business?: {
    id: string
    name: string
    description: string | null
    status: string
    contact_email: string | null
    contact_phone: string | null
    address: string | null
  } | null
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  customer: { label: 'Customer', color: 'bg-primary/10 text-primary', icon: User },
  business: { label: 'Business', color: 'bg-warning/10 text-warning', icon: Briefcase },
  admin: { label: 'Admin', color: 'bg-destructive/10 text-destructive', icon: Shield },
}

export default function UsersClient({ users, currentUserId }: { users: Profile[]; currentUserId?: string }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detailedUser, setDetailedUser] = useState<UserDetailedInfo | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)
  
  const handleRowClick = async (user: Profile) => {
    setSelectedUserId(user.id)
    setLoadingModal(true)
    setDetailedUser({ ...user }) // Optimistic initial data
    
    // Fetch deep data (business info)
    const res = await getUserDetailedInfo(user.id)
    if (res.success && res.data) {
      setDetailedUser(prev => prev ? { ...prev, ...res.data } : null)
    }
    setLoadingModal(false)
  }

  const handleCloseModal = () => {
    setSelectedUserId(null)
    setTimeout(() => setDetailedUser(null), 200) // Clear after animation
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Users</CardTitle>
          <CardDescription>{users.length} registered accounts on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
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
                      <tr 
                        key={user.id} 
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={(e) => {
                          // Prevent opening modal if clicking the action menu
                          if ((e.target as HTMLElement).closest('.action-menu-container')) return
                          handleRowClick(user)
                        }}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{displayName}</span>
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
                        <td className="py-3 px-2 text-right action-menu-container">
                          <UserActionMenu 
                            userId={user.id} 
                            currentRole={user.role ?? 'customer'} 
                            isCurrentUser={currentUserId === user.id} 
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

      {/* User Details Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-lg w-full sm:rounded-xl p-0 overflow-hidden bg-background">
          {detailedUser && (
            <>
              <DialogHeader className="p-6 bg-muted/30 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const RoleIcon = roleConfig[detailedUser.role ?? 'customer']?.icon || User;
                        return <RoleIcon className="h-8 w-8 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold font-heading text-foreground">
                        {detailedUser.first_name ? `${detailedUser.first_name} ${detailedUser.last_name || ''}` : 'Unknown User'}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize',
                          roleConfig[detailedUser.role ?? 'customer']?.color || roleConfig.customer.color
                        )}>
                          {roleConfig[detailedUser.role ?? 'customer']?.label || 'Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Contact Information</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{detailedUser.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{detailedUser.phone_number || 'No phone provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Joined {new Date(detailedUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Business Info (If applicable) */}
                {loadingModal ? (
                  <div className="py-8 flex justify-center">
                    <Search className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                ) : detailedUser.business ? (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Associated Business</h4>
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary" />
                          <p className="font-bold text-foreground text-base">{detailedUser.business.name}</p>
                        </div>
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                          detailedUser.business.status === 'verified' ? 'bg-success/10 text-success' :
                          detailedUser.business.status === 'pending' ? 'bg-warning/10 text-warning' :
                          'bg-destructive/10 text-destructive'
                        )}>
                          {detailedUser.business.status}
                        </span>
                      </div>
                      
                      {detailedUser.business.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {detailedUser.business.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {detailedUser.business.contact_email && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {detailedUser.business.contact_email}
                          </div>
                        )}
                        {detailedUser.business.contact_phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {detailedUser.business.contact_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (detailedUser.role === 'business' || detailedUser.role === 'admin') && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Associated Business</h4>
                    <p className="text-sm text-muted-foreground italic">No business profile found for this user.</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
