'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Booking = {
  id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  scheduled_at: string
  total_price: number
  notes: string | null
  customer: { first_name: string | null; last_name: string | null; email: string; phone_number: string | null } | null
  service: { name: string; duration_minutes: number } | null
}

export function AppointmentDetailsModal({
  booking,
  isOpen,
  onClose,
  onUpdateStatus,
  loadingId
}: {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => void
  loadingId: string | null
}) {
  if (!booking) return null

  const customerName = booking.customer?.first_name 
    ? `${booking.customer.first_name} ${booking.customer.last_name || ''}` 
    : booking.customer?.email.split('@')[0] || 'Unknown Customer'

  const scheduledDate = new Date(booking.scheduled_at)
  const isLoading = loadingId === booking.id

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full sm:rounded-xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 bg-muted/30 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold font-heading text-foreground">
                Appointment Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Booking Reference: <span className="font-mono text-xs">{booking.id.split('-')[0].toUpperCase()}</span>
              </p>
            </div>
            <div className={cn(
              'px-3 py-1 text-xs font-bold rounded-full capitalize border',
              booking.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
              booking.status === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' :
              booking.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
              'bg-destructive/10 text-destructive border-destructive/20'
            )}>
              {booking.status}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Schedule Info */}
          <div className="flex items-center gap-4 bg-background border rounded-xl p-4 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {scheduledDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {booking.service?.duration_minutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Service Information</h4>
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <p className="font-medium text-foreground">{booking.service?.name}</p>
                {booking.notes && (
                  <div className="flex gap-2 mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="italic">&quot;{booking.notes}&quot;</p>
                  </div>
                )}
              </div>
              <p className="font-bold text-foreground">Rp {Number(booking.total_price).toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Customer Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">{customerName}</p>
              </div>
              
              {booking.customer?.email && (
                <div className="flex items-center gap-3 pl-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${booking.customer.email}`} className="text-sm text-primary hover:underline">
                    {booking.customer.email}
                  </a>
                </div>
              )}
              
              {booking.customer?.phone_number && (
                <div className="flex items-center gap-3 pl-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${booking.customer.phone_number}`} className="text-sm text-primary hover:underline">
                    {booking.customer.phone_number}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          
          {booking.status === 'pending' && (
            <>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                disabled={isLoading}
                className="px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decline'}
              </button>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                disabled={isLoading}
                className="px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Booking'}
              </button>
              <button 
                onClick={() => onUpdateStatus(booking.id, 'completed')}
                disabled={isLoading}
                className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Completed'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
