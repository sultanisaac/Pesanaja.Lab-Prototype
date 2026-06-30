'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Clock, XCircle, User, Phone, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateBookingStatus, createManualBooking } from './actions'

type Booking = {
  id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  scheduled_at: string
  total_price: number
  notes: string | null
  customer: { first_name: string | null; last_name: string | null; email: string; phone_number: string | null } | null
  service: { name: string; duration_minutes: number } | null
}

type Service = {
  id: string
  name: string
  price: number
  duration_minutes: number
}

export function AppointmentsClient({
  initialBookings,
  services,
}: {
  initialBookings: Booking[]
  services: Service[]
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const filteredBookings = initialBookings.filter(b => filter === 'all' || b.status === filter)

  const handleStatusUpdate = async (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    setLoadingId(id)
    await updateBookingStatus(id, status)
    setLoadingId(null)
  }

  const handleManualBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalLoading(true)
    setModalError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createManualBooking(formData)
    
    if (result?.error) {
      setModalError(result.error)
      setModalLoading(false)
    } else {
      setShowModal(false)
      setModalLoading(false)
      // Form resets automatically when unmounted
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                filter === f
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> New Appointment
        </button>
      </div>

      {/* Bookings List */}
      {!filteredBookings.length ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <CalendarIcon className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                There are no {filter !== 'all' ? filter : ''} appointments to display.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const customerName = booking.customer?.first_name 
              ? `${booking.customer.first_name} ${booking.customer.last_name || ''}` 
              : booking.customer?.email.split('@')[0] || 'Unknown Customer'

            return (
              <Card key={booking.id} className="shadow-sm overflow-hidden flex flex-col sm:flex-row">
                {/* Left Side: Time & Date */}
                <div className="bg-muted/30 p-4 sm:w-48 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-border">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Clock className="h-4 w-4 text-primary" />
                    {new Date(booking.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(booking.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="mt-3 inline-flex">
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                      booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                      booking.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                      booking.status === 'completed' ? 'bg-success/10 text-success' :
                      'bg-destructive/10 text-destructive'
                    )}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Middle: Details */}
                <CardContent className="p-4 flex-1 flex flex-col justify-center min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{booking.service?.name || 'Unknown Service'}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 min-w-0 truncate">
                          <User className="h-3.5 w-3.5" /> {customerName}
                        </span>
                        {booking.customer?.phone_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {booking.customer.phone_number}
                          </span>
                        )}
                      </div>
                      {booking.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/20 pl-2 line-clamp-2">
                          &quot;{booking.notes}&quot;
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-bold text-foreground">Rp {Number(booking.total_price).toLocaleString('id-ID')}</p>
                      <p className="text-xs text-muted-foreground">{booking.service?.duration_minutes} mins</p>
                    </div>
                  </div>
                </CardContent>

                {/* Right Side: Actions */}
                <div className="p-4 bg-muted/10 border-t sm:border-t-0 sm:border-l border-border flex flex-row sm:flex-col flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:w-40 shrink-0">
                  {loadingId === booking.id ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />
                  ) : (
                    <>
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="flex-1 sm:w-full px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="flex-1 sm:w-full px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-md hover:bg-destructive/20 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            className="flex-1 sm:w-full px-3 py-1.5 bg-success text-white text-xs font-semibold rounded-md hover:bg-success/90 transition-colors"
                          >
                            Mark Completed
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="flex-1 sm:w-full px-3 py-1.5 bg-transparent border border-border text-muted-foreground hover:text-foreground text-xs font-semibold rounded-md hover:bg-muted transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-xs text-muted-foreground font-medium">
                          No actions available
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Manual Booking Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-lg border-primary/20 animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-lg">Add Manual Appointment</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              {modalError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                  {modalError}
                </div>
              )}
              
              <form onSubmit={handleManualBooking} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Customer Email *</label>
                  <input 
                    name="customer_email" 
                    type="email" 
                    required
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground">Customer must have a registered account.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Service *</label>
                  <select 
                    name="service_id" 
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                  >
                    <option value="">Select a service...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - Rp {s.price.toLocaleString('id-ID')} ({s.duration_minutes}m)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Date *</label>
                    <input 
                      name="date" 
                      type="date" 
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Time *</label>
                    <input 
                      name="time" 
                      type="time" 
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Internal Notes (Optional)</label>
                  <textarea 
                    name="notes" 
                    rows={2}
                    placeholder="Walk-in, phone booking, etc."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={modalLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {modalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Booking'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
