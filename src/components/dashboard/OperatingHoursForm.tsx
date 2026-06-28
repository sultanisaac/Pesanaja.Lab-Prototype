'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Loader2 } from 'lucide-react'
import { updateOperatingHours } from '@/app/dashboard/business/settings/actions'
import { cn } from '@/lib/utils'

export type OperatingHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
}

const defaultHours: OperatingHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
  sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export function OperatingHoursForm({ currentHours }: { currentHours: any }) {
  const [hours, setHours] = useState<OperatingHours>(
    currentHours && Object.keys(currentHours).length > 0 ? currentHours : defaultHours
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleToggle = (day: keyof OperatingHours) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }))
  }

  const handleTimeChange = (day: keyof OperatingHours, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate times
    for (const day of Object.keys(hours) as (keyof OperatingHours)[]) {
      const dayConfig = hours[day];
      if (dayConfig.isOpen) {
        if (dayConfig.openTime >= dayConfig.closeTime) {
          setMessage({ text: `Invalid times for ${day.charAt(0).toUpperCase() + day.slice(1)}. Open time must be before close time.`, type: 'error' })
          setLoading(false)
          return
        }
      }
    }

    const formData = new FormData()
    formData.append('operating_hours', JSON.stringify(hours))

    const res = await updateOperatingHours(formData)
    setLoading(false)
    if (res?.error) {
      setMessage({ text: res.error, type: 'error' })
    } else {
      setMessage({ text: 'Operating hours updated successfully!', type: 'success' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Availability & Operating Hours
        </CardTitle>
        <CardDescription>Set the times when customers can book your services</CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={cn(
            "p-3 mb-4 rounded-lg text-sm border flex items-center justify-between",
            message.type === 'success' ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
          )}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayConfig = hours[day]
              return (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3 w-32">
                    <button
                      type="button"
                      onClick={() => handleToggle(day)}
                      className={cn(
                        "w-10 h-5 rounded-full flex items-center transition-colors px-0.5",
                        dayConfig.isOpen ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                        dayConfig.isOpen ? "translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                    <span className="text-sm font-medium capitalize text-foreground">
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 sm:justify-end">
                    {dayConfig.isOpen ? (
                      <>
                        <input
                          type="time"
                          value={dayConfig.openTime}
                          onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          className="px-2 py-1.5 text-sm rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50 w-24"
                          required
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <input
                          type="time"
                          value={dayConfig.closeTime}
                          onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          className="px-2 py-1.5 text-sm rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50 w-24"
                          required
                        />
                      </>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground italic px-4">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Availability
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
