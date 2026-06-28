import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Users, Briefcase, Activity, AlertCircle } from "lucide-react"
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.user_metadata?.first_name ?? 'Admin'

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Admin Control Center</h1>
          <p className="text-secondary-foreground">Welcome, {displayName}. Platform overview and management.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,234</div>
            <p className="text-xs text-muted-foreground">+502 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Businesses</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+34 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-danger">Requires immediate action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High</div>
            <p className="text-xs text-success">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Business Registrations</CardTitle>
            <CardDescription>Review and approve new businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "CleanPro Services", type: "Home Cleaning", status: "Pending" },
                { name: "Mechanic Expert", type: "Automotive", status: "Pending" },
                { name: "Healthy Smiles", type: "Dentist", status: "Verified" },
              ].map((biz, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{biz.name}</h4>
                      <p className="text-xs text-muted-foreground">{biz.type}</p>
                    </div>
                  </div>
                  {biz.status === "Pending" ? (
                    <Button size="sm" variant="outline" className="border-warning text-warning hover:bg-warning/10">
                      Review
                    </Button>
                  ) : (
                    <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">Verified</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent notifications and issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-danger/10 border border-danger/20">
                <AlertCircle className="h-5 w-5 text-danger mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-danger">High API Latency Detected</h4>
                  <p className="text-xs text-danger/80">Search API response time exceeded 500ms.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-primary">Database Backup Completed</h4>
                  <p className="text-xs text-primary/80">Daily backup successful at 02:00 AM.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
