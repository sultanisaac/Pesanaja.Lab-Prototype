'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Star, MapPin, Heart, ArrowLeft, Loader2, Info, Mail, Phone } from 'lucide-react'
import { createBooking, toggleFavorite, getBookedSlots } from './actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type Service = {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  customer: { first_name: string | null; last_name: string | null } | null
}

type BusinessStorefrontProps = {
  business: {
    id: string
    name: string
    description: string | null
    banner_url: string | null
    logo_url: string | null
    contact_phone: string | null
    contact_email: string | null
    operating_hours?: Record<string, { 
      isOpen: boolean; 
      openTime?: string; 
      closeTime?: string; 
      hasBreak?: boolean; 
      openTime2?: string; 
      closeTime2?: string;
      slots?: { openTime: string; closeTime: string }[] 
    }>
  }
  services: Service[]
  reviews: Review[]
  addresses: { id: string; street_address: string; city: string; state: string; postal_code?: string | null }[]
  isFavorite: boolean
  isAuthenticated: boolean
}

export function BusinessStorefront({ business, services, reviews, addresses, isFavorite: initialFavorite, isAuthenticated }: BusinessStorefrontProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [favLoading, setFavLoading] = useState(false)
  
  // Booking Modal State
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [bookedSlots, setBookedSlots] = useState<{time: string, duration_minutes: number}[]>([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    async function fetchBookedSlots() {
      if (selectedDate && business.id) {
        try {
          const slots = await getBookedSlots(business.id, selectedDate)
          setBookedSlots(slots)
        } catch (error) {
          console.error('Failed to fetch booked slots', error)
        }
      } else {
        setBookedSlots([])
      }
    }
    fetchBookedSlots()
  }, [selectedDate, business.id])

  // Generate available time slots based on operating hours
  const generateTimeSlots = () => {
    if (!selectedDate || !business.operating_hours) return []
    
    const [year, month, day] = selectedDate.split('-')
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dateObj.getDay()]
    const dayConfig = business.operating_hours[dayName]
    
    if (!dayConfig || !dayConfig.isOpen) return []

    const slots: string[] = []
    
    // Duration step (e.g., if service is 30 mins, step is 30. If 60, step is 60. Default 30 if null)
    const stepMins = selectedService?.duration_minutes || 30
    
    const now = new Date()

    const generateSlotsForShift = (startStr: string, endStr: string) => {
      const current = new Date(`${selectedDate}T${startStr}:00`)
      const endTime = new Date(`${selectedDate}T${endStr}:00`)

      while (current < endTime) {
        // Ensure the slot + duration doesn't exceed closeTime
        const slotEnd = new Date(current.getTime() + stepMins * 60000)
        if (slotEnd > endTime) break

        // Only add slot if it's in the future and doesn't overlap with confirmed bookings
        if (current > now) {
          const isOverlapping = bookedSlots.some(booked => {
            const bookedStart = new Date(`${selectedDate}T${booked.time}:00`)
            const bookedEnd = new Date(bookedStart.getTime() + booked.duration_minutes * 60000)
            // Strict overlap check (current slot must not overlap at all with booked slot)
            return (current < bookedEnd && slotEnd > bookedStart)
          })

          if (!isOverlapping) {
            const hh = current.getHours().toString().padStart(2, '0');
            const mm = current.getMinutes().toString().padStart(2, '0');
            slots.push(`${hh}:${mm}`);
          }
        }
        current.setMinutes(current.getMinutes() + stepMins)
      }
    }

    if (dayConfig.slots && dayConfig.slots.length > 0) {
      dayConfig.slots.forEach(slot => generateSlotsForShift(slot.openTime, slot.closeTime))
    } else if (dayConfig.openTime && dayConfig.closeTime) {
      generateSlotsForShift(dayConfig.openTime, dayConfig.closeTime)
      if (dayConfig.hasBreak && dayConfig.openTime2 && dayConfig.closeTime2) {
        generateSlotsForShift(dayConfig.openTime2, dayConfig.closeTime2)
      }
    }

    return slots
  }

  const timeSlots = generateTimeSlots()
  const averageRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'No ratings'

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    setFavLoading(true)
    const newFavState = !isFavorite
    setIsFavorite(newFavState) // Optimistic update
    const res = await toggleFavorite(business.id, isFavorite)
    if (res?.error) {
      setIsFavorite(isFavorite) // Revert on error
    }
    setFavLoading(false)
  }

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setBookingLoading(true)
    setBookingError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('business_id', business.id)
    if (selectedService) formData.append('service_id', selectedService.id)

    const result = await createBooking(formData)

    if (result.error) {
      setBookingError(result.error)
      setBookingLoading(false)
    } else {
      setBookingSuccess(true)
      setBookingLoading(false)
      // Close modal after 2 seconds
      setTimeout(() => {
        setBookingSuccess(false)
        setSelectedService(null)
        setSelectedDate('')
        setSelectedTime('')
      }, 2000)
    }
  }

  // Get tomorrow's date string for the min attribute in date picker (or today if standard hours aren't over)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 w-full bg-gradient-to-r from-primary/80 to-primary">
        {business.banner_url && (
          <Image 
            src={business.banner_url} 
            alt="Business Banner" 
            fill 
            className="object-cover opacity-50 mix-blend-overlay"
            priority
          />
        )}
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center h-10 w-10 bg-background/20 backdrop-blur-md rounded-full text-white hover:bg-background/40 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
        
      {/* Profile Info Section (Normal Flow) */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="relative flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-10 md:-mt-12 mb-10 z-10">
          
          {/* Logo */}
          <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-xl border-4 border-background bg-background overflow-hidden shadow-lg shrink-0">
            {business.logo_url ? (
              <Image src={business.logo_url} alt="Logo" fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-5xl">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Business Name & Info */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:pb-2 pt-2 md:pt-0">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{business.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium text-foreground/80">
                <span className="flex items-center gap-1.5 bg-background shadow-sm border border-border/50 px-3 py-1 rounded-full text-primary">
                  <Star className="h-4 w-4 fill-primary" /> {averageRating} ({reviews.length})
                </span>
                {addresses.length > 0 && (
                  <span className="flex items-center gap-1.5 bg-background shadow-sm border border-border/50 px-3 py-1 rounded-full text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {addresses[0].city}, {addresses[0].state}
                    {addresses.length > 1 && ` (+${addresses.length - 1} more)`}
                  </span>
                )}
              </div>
            </div>
            
            {/* Favorite Button */}
            <button 
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={cn(
                "h-12 w-12 rounded-full shadow-sm border border-border/50 flex items-center justify-center transition-all shrink-0",
                isFavorite ? "bg-rose-50 border-rose-200 text-rose-500" : "bg-background text-muted-foreground hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
              )}
            >
              <Heart className={cn("h-6 w-6 transition-all", isFavorite && "fill-rose-500 scale-110")} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left column on large screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About */}
          <section>
            <h2 className="text-xl font-bold font-heading mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {business.description || 'No description provided.'}
            </p>
          </section>

          {/* Services Menu */}
          <section>
            <h2 className="text-xl font-bold font-heading mb-4">Services</h2>
            {services.length === 0 ? (
              <p className="text-muted-foreground italic">No services available right now.</p>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="shadow-sm hover:shadow-md transition-shadow border-border/50">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5" /> {service.duration_minutes} mins
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between">
                        <p className="text-lg font-bold text-foreground mb-0 sm:mb-3">
                          Rp {service.price.toLocaleString('id-ID')}
                        </p>
                        <button 
                          onClick={() => setSelectedService(service)}
                          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                        >
                          Book Now
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-bold font-heading mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-background rounded-xl border border-border/50 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm">
                        {review.customer?.first_name 
                          ? `${review.customer.first_name} ${review.customer.last_name || ''}` 
                          : 'Anonymous Customer'}
                      </div>
                      <div className="flex text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("h-4 w-4", i < review.rating ? "fill-warning" : "text-muted stroke-muted-foreground/30")} />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <p className="text-sm text-foreground/90">{review.comment || 'No comment provided.'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/50 sticky top-24">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg">Contact & Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {(business.contact_email || business.contact_phone) && (
                <div className="space-y-3 pb-4 border-b border-border/50">
                  <p className="text-sm font-medium text-foreground">Get in touch</p>
                  {business.contact_email && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <a href={`mailto:${business.contact_email}`} className="hover:text-primary hover:underline transition-colors">{business.contact_email}</a>
                    </div>
                  )}
                  {business.contact_phone && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <a href={`tel:${business.contact_phone}`} className="hover:text-primary hover:underline transition-colors">{business.contact_phone}</a>
                    </div>
                  )}
                </div>
              )}
              {addresses.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm font-medium text-foreground mb-2">Locations</p>
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <p key={addr.id} className="text-sm text-muted-foreground leading-relaxed">
                          {addr.street_address}<br/>
                          {addr.city}, {addr.state} {addr.postal_code || ''}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {business.operating_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="w-full">
                    <p className="text-sm font-medium text-foreground mb-2">Operating Hours</p>
                    <div className="space-y-1">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const config = business.operating_hours?.[day]
                        if (!config) return null
                        return (
                          <div key={day} className="flex justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{day.slice(0,3)}</span>
                            <span className={config.isOpen ? "text-foreground font-medium" : "text-muted-foreground italic text-right"}>
                              {config.isOpen 
                                ? (config.slots && config.slots.length > 0
                                    ? <span className="text-right block">
                                        {config.slots.map((s, i) => <span key={i} className="block">{s.openTime} - {s.closeTime}</span>)}
                                      </span>
                                    : (config.hasBreak && config.openTime2 && config.closeTime2 
                                        ? <span className="text-right block">{config.openTime} - {config.closeTime}<br/>{config.openTime2} - {config.closeTime2}</span>
                                        : `${config.openTime} - ${config.closeTime}`)) 
                                : 'Closed'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal Overlay */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <Card className="w-full max-w-lg shadow-2xl border-primary/20 animate-in fade-in zoom-in-95 duration-200">
            {bookingSuccess ? (
              <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold font-heading mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground">Your appointment request has been sent to the business.</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b border-border bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Book Appointment</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">{selectedService.name}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
                    >
                      &times;
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {bookingError && (
                    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex gap-2 items-start">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>{bookingError}</p>
                    </div>
                  )}

                  <form onSubmit={handleBooking} className="space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-bold text-foreground">1. Select Date</label>
                        {business.operating_hours && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                              .filter(d => business.operating_hours?.[d as keyof typeof business.operating_hours]?.isOpen)
                              .map(d => d.charAt(0).toUpperCase() + d.slice(1, 3))
                              .join(', ') || 'None'}
                          </span>
                        )}
                      </div>
                      <input 
                        type="date" 
                        name="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value)
                          setSelectedTime('') // Reset time when date changes
                        }}
                        required
                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm"
                      />
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">2. Select Time</label>
                      {!selectedDate ? (
                        <div className="p-4 text-center bg-muted/50 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                          Please select a date first to see available times.
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <div className="p-4 text-center bg-rose-50 rounded-xl border border-rose-200 text-sm text-rose-600 flex flex-col items-center justify-center gap-2">
                          <Info className="h-5 w-5" />
                          <span>No available time slots on this date.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={cn(
                                "py-2 rounded-lg text-sm font-medium transition-all border",
                                selectedTime === time 
                                  ? "bg-primary text-white border-primary shadow-md" 
                                  : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Hidden input to pass the selected time to formData */}
                      <input type="hidden" name="time" value={selectedTime} required />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">3. Notes (Optional)</label>
                      <textarea 
                        name="notes"
                        rows={2}
                        placeholder="Any special requests or details..."
                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-sm resize-none text-sm"
                      />
                    </div>

                    {/* Summary & Submit */}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Total Price</p>
                        <p className="text-xl font-bold text-foreground">Rp {selectedService.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button 
                        type="submit"
                        disabled={bookingLoading || !selectedDate || !selectedTime}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                      >
                        {bookingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}

    </div>
  )
}

// Temporary CheckCircle2 icon since lucide-react might not have it in this exact casing if older, using standard Check
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
