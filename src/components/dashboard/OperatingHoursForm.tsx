'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TimeSlot = {
  openTime: string
  closeTime: string
}

export type OperatingHours = {
  [day in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
    isOpen: boolean
    openTime?: string
    closeTime?: string
    hasBreak?: boolean
    openTime2?: string
    closeTime2?: string
    slots?: TimeSlot[]
  }
}

const defaultHours: OperatingHours = {
  monday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  tuesday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  wednesday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  thursday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  friday: { isOpen: true, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  saturday: { isOpen: false, slots: [{ openTime: '09:00', closeTime: '17:00' }] },
  sunday: { isOpen: false, slots: [{ openTime: '09:00', closeTime: '17:00' }] }
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const normalizeHours = (hours: Partial<OperatingHours> | null): OperatingHours => {
  const result: OperatingHours = JSON.parse(JSON.stringify(defaultHours)) // deep copy
  if (!hours || Object.keys(hours).length === 0) return result

  for (const day of DAYS) {
    if (hours[day]) {
      const hd = hours[day]!
      result[day].isOpen = hd.isOpen

      if (hd.slots && hd.slots.length > 0) {
        result[day].slots = hd.slots
      } else if (hd.openTime && hd.closeTime) {
        // Migrate legacy formats
        const newSlots: TimeSlot[] = [{ openTime: hd.openTime, closeTime: hd.closeTime }]
        if (hd.hasBreak && hd.openTime2 && hd.closeTime2) {
          newSlots.push({ openTime: hd.openTime2, closeTime: hd.closeTime2 })
        }
        result[day].slots = newSlots
      } else {
        result[day].slots = [{ openTime: '09:00', closeTime: '17:00' }]
      }
    }
  }
  return result
}

export function OperatingHoursForm({ currentHours }: { currentHours: Partial<OperatingHours> | null }) {
  const [hours, setHours] = useState<OperatingHours>(() => normalizeHours(currentHours))

  const handleToggle = (day: keyof OperatingHours) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }))
  }

  const handleTimeChange = (day: keyof OperatingHours, index: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev) => {
      const newSlots = [...(prev[day].slots || [])]
      newSlots[index] = { ...newSlots[index], [field]: value }
      return { ...prev, [day]: { ...prev[day], slots: newSlots } }
    })
  }

  const handleAddSlot = (day: keyof OperatingHours) => {
    setHours((prev) => {
      const newSlots = [...(prev[day].slots || [])]
      // Try to determine a smart default for the new slot
      const lastSlot = newSlots[newSlots.length - 1]
      let newOpen = '13:00'
      let newClose = '17:00'
      
      if (lastSlot && lastSlot.closeTime) {
        const [hours, minutes] = lastSlot.closeTime.split(':').map(Number)
        if (hours < 22) {
          newOpen = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
          newClose = `${String(Math.min(hours + 5, 23)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        }
      }

      newSlots.push({ openTime: newOpen, closeTime: newClose })
      return { ...prev, [day]: { ...prev[day], slots: newSlots } }
    })
  }

  const handleRemoveSlot = (day: keyof OperatingHours, index: number) => {
    setHours((prev) => {
      const newSlots = prev[day].slots?.filter((_, i) => i !== index) || []
      // Don't allow removing the last slot entirely, just reset it
      if (newSlots.length === 0) newSlots.push({ openTime: '09:00', closeTime: '17:00' })
      return { ...prev, [day]: { ...prev[day], slots: newSlots } }
    })
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
        <div className="space-y-4">
          <input type="hidden" name="operating_hours" value={JSON.stringify(hours)} />
          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayConfig = hours[day]
              const slots = dayConfig.slots || [{ openTime: '09:00', closeTime: '17:00' }]
              
              return (
                <div key={day} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3 w-32 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(day)}
                      className={cn(
                        "w-10 h-5 rounded-full flex items-center transition-colors px-0.5 shrink-0",
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
                  
                  <div className="flex flex-col gap-2 flex-1 sm:justify-end">
                    {dayConfig.isOpen ? (
                      <div className="flex flex-col gap-2 items-end w-full">
                        {slots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="time"
                              value={slot.openTime}
                              onChange={(e) => handleTimeChange(day, index, 'openTime', e.target.value)}
                              className="px-2 py-1.5 text-sm rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50 w-24"
                              required
                            />
                            <span className="text-muted-foreground text-sm">to</span>
                            <input
                              type="time"
                              value={slot.closeTime}
                              onChange={(e) => handleTimeChange(day, index, 'closeTime', e.target.value)}
                              className="px-2 py-1.5 text-sm rounded-md border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50 w-24"
                              required
                            />
                            
                            {/* Actions for this slot */}
                            <div className="flex items-center w-14 ml-1">
                              {index === slots.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddSlot(day)}
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                  title="Add another shift"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              ) : (
                                <div className="w-7" />
                              )}
                              
                              {slots.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlot(day, index)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                  title="Remove shift"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground italic px-4 flex justify-end mt-1.5">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

