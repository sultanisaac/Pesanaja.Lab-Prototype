'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2, Briefcase, ShieldCheck, DollarSign, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Period = '7d' | '30d' | '90d'

interface AnalyticsData {
  newBusinesses: number
  verifiedBusinesses: number
  totalRevenue: number
  totalBookings: number
  businessPayments: Array<{
    name: string
    bookings: number
    revenue: number
    status: string
  }>
}

interface AdminAnalyticsClientProps {
  data: Record<Period, AnalyticsData>
}

export default function AdminAnalyticsClient({ data }: AdminAnalyticsClientProps) {
  const [period, setPeriod] = useState<Period>('7d')
  const current = data[period]

  const periods: { label: string; value: Period }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
  ]

  const stats = [
    {
      label: 'New Businesses',
      value: current.newBusinesses,
      icon: Briefcase,
      color: 'text-primary',
      bg: 'bg-primary/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Verified',
      value: current.verifiedBusinesses,
      icon: ShieldCheck,
      color: 'text-success',
      bg: 'bg-success/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Platform Bookings',
      value: current.totalBookings,
      icon: TrendingUp,
      color: 'text-warning',
      bg: 'bg-warning/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Platform Revenue',
      value: current.totalRevenue,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
      format: (v: number) => `Rp ${v.toLocaleString('id-ID')}`,
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    verified: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="space-y-8">
      {/* Header + period switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" /> Platform Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Business activity and revenue across the platform</p>
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

      {/* Stats cards */}
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

      {/* Payment Records per Business */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Business Payment Records</CardTitle>
          <CardDescription>
            Revenue and booking breakdown per business for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {current.businessPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-2 pr-4">Business</th>
                    <th className="text-center font-medium text-muted-foreground py-2 px-4">Bookings</th>
                    <th className="text-right font-medium text-muted-foreground py-2 px-4">Revenue</th>
                    <th className="text-right font-medium text-muted-foreground py-2 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {current.businessPayments.map((biz, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{biz.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{biz.bookings}</td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        Rp {biz.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full capitalize', statusColors[biz.status] ?? 'bg-muted text-muted-foreground')}>
                          {biz.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <BarChart2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No business activity recorded in this period.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Data will appear here as bookings are made.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
