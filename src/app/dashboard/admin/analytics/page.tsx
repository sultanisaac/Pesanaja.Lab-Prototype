import { createClient } from '@/lib/supabase/server'
import AdminAnalyticsClient from './AdminAnalyticsClient'

type Period = '7d' | '30d' | '90d'

function getPeriodStart(period: Period): string {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  now.setDate(now.getDate() - days)
  return now.toISOString()
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const periods: Period[] = ['7d', '30d', '90d']

  const analyticsData = await Promise.all(
    periods.map(async (period) => {
      const since = getPeriodStart(period)

      const [
        { count: newBusinesses },
        { count: verifiedBusinesses },
        bookingsResult,
        allBusinesses,
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'verified').gte('created_at', since),
        supabase.from('bookings').select('total_price, business_id').gte('created_at', since),
        supabase.from('businesses').select('id, name, status'),
      ])

      const bookings = bookingsResult.data ?? []
      const businesses = allBusinesses.data ?? []

      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
      const totalBookings = bookings.length

      // Group by business
      const businessMap: Record<string, { name: string; bookings: number; revenue: number; status: string }> = {}
      for (const biz of businesses) {
        businessMap[biz.id] = { name: biz.name, bookings: 0, revenue: 0, status: biz.status }
      }
      for (const booking of bookings) {
        if (booking.business_id && businessMap[booking.business_id]) {
          businessMap[booking.business_id].bookings += 1
          businessMap[booking.business_id].revenue += Number(booking.total_price) || 0
        }
      }

      const businessPayments = Object.values(businessMap)
        .filter((b) => b.bookings > 0 || businesses.some((biz) => biz.name === b.name))
        .sort((a, b) => b.revenue - a.revenue)

      return { period, newBusinesses: newBusinesses ?? 0, verifiedBusinesses: verifiedBusinesses ?? 0, totalRevenue, totalBookings, businessPayments }
    })
  )

  const data = Object.fromEntries(analyticsData.map((d) => [d.period, d])) as Record<Period, typeof analyticsData[0]>

  return <AdminAnalyticsClient data={data} />
}
