import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import { AppointmentsClient } from './AppointmentsClient'

export default async function BusinessAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get business details
  const { data: business } = await supabase
    .from('businesses')
    .select('id, status, payment_status')
    .eq('owner_id', user.id)
    .single()

  if (!business || business.payment_status !== 'paid' || business.status !== 'verified') {
    redirect('/dashboard/business')
  }

  // Fetch all bookings for this business
  const { data: rawBookings } = await supabase
    .from('bookings')
    .select(`
      id, status, scheduled_at, total_price, notes,
      customer:customer_id ( first_name, last_name, email, phone_number ),
      service:service_id ( name, duration_minutes )
    `)
    .eq('business_id', business.id)
    .order('scheduled_at', { ascending: false })

  // Fetch services for the manual booking modal
  const { data: services } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = (rawBookings || []) as any[]

  // Calculate metrics
  const today = new Date().toISOString().split('T')[0]
  const todaysBookings = bookings.filter(b => b.scheduled_at.startsWith(today))
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  
  const todaysRevenue = todaysBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0)

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" /> Appointments Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          View, confirm, and manage your incoming bookings.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todaysBookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Booked for today</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires your confirmation</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expected Revenue (Today)</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Rp {todaysRevenue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground mt-1">From confirmed/completed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Component for interactive list & modal */}
      <AppointmentsClient initialBookings={bookings} services={services || []} />
    </div>
  )
}
