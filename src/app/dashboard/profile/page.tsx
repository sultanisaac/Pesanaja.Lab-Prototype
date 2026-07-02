import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Shield, Phone, Lock } from 'lucide-react'
import { updateProfile } from './actions'
import { AvatarUpload } from '@/components/dashboard/AvatarUpload'
import { ChangePasswordForm } from '@/components/dashboard/ChangePasswordForm'

const roleLabels: Record<string, { label: string; color: string }> = {
  customer: { label: 'Customer', color: 'bg-primary/10 text-primary' },
  business: { label: 'Business Owner', color: 'bg-warning/10 text-warning' },
  admin: { label: 'Administrator', color: 'bg-destructive/10 text-destructive' },
}

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, role, phone_number, created_at, avatar_url')
    .eq('id', user?.id)
    .single()

  const isGoogleUser = user?.app_metadata?.provider === 'google'
  const roleInfo = roleLabels[profile?.role ?? 'customer']
  
  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim() 
    : user?.email?.split('@')[0] ?? 'User'

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Profile Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and account security.</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <AvatarUpload 
            userId={user!.id} 
            currentAvatarUrl={profile?.avatar_url} 
            displayName={displayName} 
          />
        </CardContent>
      </Card>

      {/* Account Info — read-only */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account Information</CardTitle>
          <CardDescription>Your account details managed by the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{profile?.email ?? user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>
          {profile?.created_at && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Edit Profile</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-sm font-medium text-foreground">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  defaultValue={profile?.first_name ?? ''}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  defaultValue={profile?.last_name ?? ''}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone_number" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                defaultValue={profile?.phone_number ?? ''}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="+62 8xx xxxx xxxx"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Save Changes
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password — hidden for Google users */}
      {!isGoogleUser && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {isGoogleUser && (
        <Card className="shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0" />
              <p>Your account uses Google Sign-In. Password management is handled by Google.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
