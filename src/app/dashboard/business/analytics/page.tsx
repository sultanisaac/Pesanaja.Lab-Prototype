import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BusinessAnalyticsClient from './BusinessAnalyticsClient'

type Period = '7d' | '30d' | '90d'

function getPeriodStart(period: Period): string {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  now.setDate(now.getDate() - days)
  return now.toISOString()
}

export default async function BusinessAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status, payment_status')
    .eq('owner_id', user?.id)
    .single()

  if (!business || business.payment_status !== 'paid' || business.status !== 'verified') {
    redirect('/dashboard/business')
  }

  const businessId = business?.id
  const businessName = business?.name ?? ''

  const periods: Period[] = ['7d', '30d', '90d']

  const analyticsData = await Promise.all(
    periods.map(async (period) => {
      const since = getPeriodStart(period)

      if (!businessId) {
        return {
          period,
          totalBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          uniqueCustomers: 0,
          recentBookings: [],
        }
      }

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          total_price,
          scheduled_at,
          customer_id,
          services ( name ),
          profiles ( first_name, last_name )
        `)
        .eq('business_id', businessId)
        .gte('created_at', since)
        .order('scheduled_at', { ascending: false })

      const allBookings = bookings ?? []
      const totalBookings = allBookings.length
      const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length
      const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length
      const pendingBookings = allBookings.filter((b) => b.status === 'pending').length
      const totalRevenue = allBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
      const uniqueCustomers = new Set(allBookings.map((b) => b.customer_id)).size

      const recentBookings = allBookings.slice(0, 5).map((b) => {
        const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles
        const service = Array.isArray(b.services) ? b.services[0] : b.services
        return {
          customer_name: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : 'Unknown',
          service_name: service?.name ?? 'Service',
          scheduled_at: b.scheduled_at,
          total_price: b.total_price,
          status: b.status,
        }
      })

      return { period, totalBookings, confirmedBookings, cancelledBookings, pendingBookings, totalRevenue, uniqueCustomers, recentBookings }
    })
  )

  const data = Object.fromEntries(analyticsData.map((d) => [d.period, d])) as Record<Period, typeof analyticsData[0]>

  return <BusinessAnalyticsClient data={data} businessName={businessName} />
}
