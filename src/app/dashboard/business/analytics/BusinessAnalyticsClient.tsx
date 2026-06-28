'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Period = '7d' | '30d' | '90d'

interface PeriodData {
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  pendingBookings: number
  totalRevenue: number
  uniqueCustomers: number
  recentBookings: Array<{
    customer_name: string
    service_name: string
    scheduled_at: string
    total_price: number
    status: string
  }>
}

interface BusinessAnalyticsClientProps {
  data: Record<Period, PeriodData>
  businessName: string
}

export default function BusinessAnalyticsClient({ data, businessName }: BusinessAnalyticsClientProps) {
  const [period, setPeriod] = useState<Period>('7d')
  const current = data[period]

  const periods: { label: string; value: Period }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
  ]

  const stats = [
    {
      label: 'Total Bookings',
      value: current.totalBookings,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Confirmed',
      value: current.confirmedBookings,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Unique Customers',
      value: current.uniqueCustomers,
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Revenue',
      value: current.totalRevenue,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
      format: (v: number) => `Rp ${v.toLocaleString('id-ID')}`,
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-success/10 text-success',
    completed: 'bg-primary/10 text-primary',
    cancelled: 'bg-destructive/10 text-destructive',
  }

  const completionRate = current.totalBookings > 0
    ? Math.round((current.confirmedBookings / current.totalBookings) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header + period switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" /> Business Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {businessName ? `Booking and revenue data for ${businessName}` : 'Booking and revenue data'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                period === p.value
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', s.bg)}>
                  <Icon className={cn('h-4 w-4', s.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{s.format(s.value)}</div>
                <p className="text-xs text-muted-foreground mt-1">In the selected period</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Booking breakdown + recent list */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Booking Breakdown</CardTitle>
            <CardDescription>Status distribution this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Confirmed', value: current.confirmedBookings, color: 'bg-success' },
              { label: 'Pending', value: current.pendingBookings, color: 'bg-warning' },
              { label: 'Cancelled', value: current.cancelledBookings, color: 'bg-destructive' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color)}
                    style={{
                      width: current.totalBookings > 0
                        ? `${Math.round((item.value / current.totalBookings) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confirmation Rate</span>
                <span className="font-semibold text-success">{completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
            <CardDescription>Latest booking activity in this period</CardDescription>
          </CardHeader>
          <CardContent>
            {current.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {current.recentBookings.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                      {b.customer_name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{b.customer_name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.service_name ?? 'Service'} · {new Date(b.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">Rp {Number(b.total_price).toLocaleString('id-ID')}</p>
                      <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize', statusColors[b.status] ?? 'bg-muted text-muted-foreground')}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No bookings in this period.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Data will appear here once customers book your services.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
