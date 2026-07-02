import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Mail, Phone, CheckCircle2, Circle, BadgeCheck } from 'lucide-react'
import { updateBusinessProfile } from './actions'
import { BusinessImageUpload } from '@/components/dashboard/BusinessImageUpload'
import { OperatingHoursForm } from '@/components/dashboard/OperatingHoursForm'
import { ServicesManager } from '@/components/dashboard/ServicesManager'
import { LocationsManager } from '@/components/dashboard/LocationsManager'

export default async function BusinessSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user?.id)
    .single()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, description, contact_email, contact_phone, status, is_active, logo_url, banner_url, operating_hours')
    .eq('owner_id', user?.id)
    .single()

  let services = []
  let addresses = []
  if (business) {
    const { data: sData } = await supabase.from('services').select('*').eq('business_id', business.id).order('created_at', { ascending: true })
    services = sData || []
    
    const { data: aData } = await supabase.from('addresses').select('*').eq('business_id', business.id).order('created_at', { ascending: true })
    addresses = aData || []
  }

  const ownerName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : user?.email ?? 'Owner'

  // Completeness check
  const checks = [
    { label: 'Business name', done: !!business?.name },
    { label: 'Description', done: !!business?.description },
    { label: 'Contact email', done: !!business?.contact_email },
    { label: 'Contact phone', done: !!business?.contact_phone },
  ]
  const completeness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)

  const isVerified = business?.status === 'verified'
  const statusLabel = business?.status === 'verified' ? 'Verified' : business?.status === 'rejected' ? 'Rejected' : 'Pending Review'
  const statusColor = business?.status === 'verified' ? 'text-success' : business?.status === 'rejected' ? 'text-destructive' : 'text-warning'

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" /> Business Profile Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          This is the public profile customers will see when they find your business.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Images */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Business Images</CardTitle>
              <CardDescription>Logo and cover image shown to customers</CardDescription>
            </CardHeader>
            <CardContent>
              {business ? (
                <BusinessImageUpload
                  userId={user!.id}
                  businessId={business.id}
                  currentLogoUrl={business.logo_url}
                  currentBannerUrl={business.banner_url}
                />
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-muted/40 rounded-lg text-center border border-dashed border-border">
                  Please create your business profile below first before uploading images.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner info — read-only */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Business Owner</CardTitle>
              <CardDescription>This is displayed to customers to build trust</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                  {ownerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{ownerName}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email ?? user?.email}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                To update your personal name, go to{' '}
                <a href="/dashboard/profile" className="text-primary hover:underline">Profile Settings</a>.
              </p>
            </CardContent>
          </Card>

          {/* Business details form */}
          <form action={updateBusinessProfile} className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
              <CardTitle className="text-base font-semibold">Business Information</CardTitle>
              <CardDescription>This information is visible to all customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> Business Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={business?.name ?? ''}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    placeholder="e.g. Smile Dental Clinic"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={business?.description ?? ''}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                    placeholder="Tell customers about your business, what makes you special, your experience..."
                  />
                  <p className="text-xs text-muted-foreground">This appears on your public business page.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="contact_email" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Public Email
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      defaultValue={business?.contact_email ?? ''}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="business@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="contact_phone" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone Number
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      defaultValue={business?.contact_phone ?? ''}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="+62 8xx xxxx xxxx"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours Form */}
          <OperatingHoursForm currentHours={business?.operating_hours} />

          {/* Save Button */}
          <div className="pt-2 flex flex-row-reverse items-center gap-4 justify-start bg-background p-4 rounded-xl border border-border shadow-sm">
            <button
              type="submit"
              className="px-8 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
              {business ? 'Save All Changes' : 'Create Business Profile'}
            </button>
            {business && (
              <a
                href={`/business/${business.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                View public page ↗
              </a>
            )}
          </div>
        </form>

          {/* Services and Locations Managers */}
          {business && (
            <>
              <ServicesManager businessId={business.id} services={services} />
              <LocationsManager businessId={business.id} locations={addresses} />
            </>
          )}
        </div>

        {/* Right sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Verification status */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {isVerified
                  ? <BadgeCheck className="h-5 w-5 text-success" />
                  : <div className="h-5 w-5 rounded-full border-2 border-warning" />
                }
                <span className={`text-sm font-semibold ${statusColor}`}>{statusLabel}</span>
              </div>
              {!isVerified && (
                <p className="text-xs text-muted-foreground">
                  Complete your profile and submit documents to get the Verified badge, which builds customer trust.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Profile completeness */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-foreground">{completeness}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
              <ul className="space-y-2">
                {checks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2 text-sm">
                    {check.done
                      ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    }
                    <span className={check.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {check.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
