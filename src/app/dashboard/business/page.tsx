import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users, Activity, Briefcase } from "lucide-react"
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckoutButton } from "@/components/CheckoutButton"

export default async function BusinessDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.user_metadata?.first_name ?? 'Owner'

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Business Hub</h1>
          <p className="text-secondary-foreground">Welcome back, {displayName}. Here&apos;s your business performance.</p>
        </div>
        <Link href="/dashboard/business/settings" className={cn(buttonVariants())}><Briefcase className="mr-2 h-4 w-4" /> Manage Business</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 12.5M</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Upcoming customer bookings for today and tomorrow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Siti Nurhaliza", service: "Spa Treatment", time: "Today, 14:00", price: "Rp 250.000" },
                { name: "Budi Santoso", service: "Haircut & Styling", time: "Today, 16:30", price: "Rp 150.000" },
                { name: "Anita Wijaya", service: "Manicure", time: "Tomorrow, 10:00", price: "Rp 100.000" },
              ].map((booking, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-brand/30 flex items-center justify-center font-bold text-primary">
                      {booking.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{booking.name}</h4>
                      <p className="text-xs text-muted-foreground">{booking.service} &bull; {booking.time}</p>
                    </div>
                  </div>
                  <div className="font-medium text-sm">{booking.price}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your Pesanaja.Lab plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-primary">Pro Plan</span>
                <span className="text-sm font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-secondary-foreground mb-4">Rp 150.000 / month</p>
              <CheckoutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
