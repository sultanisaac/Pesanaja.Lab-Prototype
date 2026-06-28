'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { addLocation, deleteLocation } from '@/app/dashboard/business/settings/actions'

type Address = {
  id: string
  street_address: string
  city: string
  state: string
  postal_code: string | null
}

export function LocationsManager({ businessId, locations }: { businessId: string; locations: Address[] }) {
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setLoading(true)
    setError(null)
    const res = await addLocation(businessId, formData)
    if (res.error) {
      setError(res.error)
    } else {
      setIsAdding(false)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this location?')) return
    setLoading(true)
    await deleteLocation(id)
    setLoading(false)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Business Locations</CardTitle>
          <CardDescription>Add the physical branches for your business</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Location
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        
        {isAdding && (
          <form action={handleAdd} className="bg-muted/40 p-4 rounded-lg space-y-4 border border-border">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="street_address">Street Address *</Label>
                <Input id="street_address" name="street_address" required placeholder="123 Main St, Building A" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" required placeholder="Jakarta Selatan" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State/Province *</Label>
                <Input id="state" name="state" required placeholder="DKI Jakarta" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input id="postal_code" name="postal_code" placeholder="12345" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Location'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {locations.length === 0 && !isAdding ? (
            <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg border-dashed">
              No locations added yet. Add your first location!
            </div>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="flex justify-between items-start p-3 border rounded-lg hover:border-primary/50 transition-colors bg-white">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{location.street_address}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {location.city}, {location.state} {location.postal_code || ''}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8" disabled={loading}>
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
