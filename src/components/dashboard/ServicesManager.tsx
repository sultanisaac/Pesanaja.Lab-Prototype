'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Tag, Clock } from 'lucide-react'
import { addService, deleteService } from '@/app/dashboard/business/settings/actions'

type Service = {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
}

export function ServicesManager({ businessId, services }: { businessId: string; services: Service[] }) {
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await addService(businessId, formData)
    if (res.error) {
      setError(res.error)
    } else {
      setIsAdding(false)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return
    setLoading(true)
    await deleteService(id)
    setLoading(false)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Services & Prices</CardTitle>
          <CardDescription>Manage the services your business offers</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Service
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        
        {isAdding && (
          <form action={handleAdd} className="bg-muted/40 p-4 rounded-lg space-y-4 border border-border">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. Basic Haircut" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Brief description of the service" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (IDR) *</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="price" name="price" type="number" required min="0" className="pl-9" placeholder="50000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration_minutes">Duration (Minutes) *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="duration_minutes" name="duration_minutes" type="number" required min="5" step="5" className="pl-9" placeholder="30" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Service'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {services.length === 0 && !isAdding ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
              No services added yet. Add your first service above!
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors bg-white">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{service.name}</h4>
                  {service.description && <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs font-medium text-secondary-foreground">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Rp {service.price.toLocaleString('id-ID')}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {service.duration_minutes} mins</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" disabled={loading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
