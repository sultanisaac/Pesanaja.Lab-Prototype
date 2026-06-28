import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mail, Phone, User, BadgeCheck, Clock, Star, ShieldAlert,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch business with owner profile
  const { data: business, error } = await supabase
    .from('businesses')
    .select(`
      id, name, description, contact_email, contact_phone,
      status, is_active, logo_url, banner_url, created_at,
      profiles ( first_name, last_name, email, avatar_url ),
      services ( id, name, description, price, duration_minutes, is_active )
    `)
    .eq('id', id)
    .single()

  if (error || !business) notFound()

  const owner = Array.isArray(business.profiles) ? business.profiles[0] : business.profiles
  const services = (Array.isArray(business.services) ? business.services : []).filter((s) => s.is_active)
  const ownerName = owner ? `${owner.first_name ?? ''} ${owner.last_name ?? ''}`.trim() : 'Business Owner'
  const isVerified = business.status === 'verified'

  const statusConfig = {
    verified: { label: 'Verified', color: 'bg-success/10 text-success', icon: BadgeCheck },
    pending: { label: 'Pending Review', color: 'bg-warning/10 text-warning', icon: Clock },
    rejected: { label: 'Not Verified', color: 'bg-destructive/10 text-destructive', icon: ShieldAlert },
  }
  const statusInfo = statusConfig[business.status as keyof typeof statusConfig] ?? statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Navbar />

      {/* Banner */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden">
        {business.banner_url ? (
          <Image src={business.banner_url} alt={`${business.name} banner`} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)',
            }} />
          </div>
        )}
      </div>

      <main className="flex-1 container mx-auto px-4 max-w-5xl py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card className="shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-2xl shadow-sm overflow-hidden">
                    {business.logo_url
                      ? <Image src={business.logo_url} alt={business.name} width={64} height={64} className="object-cover" />
                      : business.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-2xl font-heading font-bold text-foreground">{business.name}</h1>
                      {isVerified && <BadgeCheck className="h-5 w-5 text-primary shrink-0" />}
                    </div>
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', statusInfo.color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                    {business.description && (
                      <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{business.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <div>
              <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Available Services</h2>
              {services.length > 0 ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <Card key={service.id} className="shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                          )}
                          {service.duration_minutes && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {service.duration_minutes} min
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-foreground">
                            Rp {Number(service.price).toLocaleString('id-ID')}
                          </p>
                          <Link
                            href={`/business/${business.id}/book?service=${service.id}`}
                            className={cn(buttonVariants({ size: 'sm' }), 'mt-2')}
                          >
                            Book
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No services listed yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right: Sidebar info */}
          <div className="space-y-4">
            {/* Owner card */}
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Business Owner</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {ownerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{ownerName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Business Owner</span>
                    </div>
                  </div>
                </div>
                {isVerified && (
                  <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-2 rounded-lg">
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Identity verified by Pesanaja.Lab</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
                {business.contact_email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <a href={`mailto:${business.contact_email}`} className="text-primary hover:underline truncate">
                      {business.contact_email}
                    </a>
                  </div>
                )}
                {business.contact_phone && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <a href={`tel:${business.contact_phone}`} className="text-foreground hover:text-primary">
                      {business.contact_phone}
                    </a>
                  </div>
                )}
                {!business.contact_email && !business.contact_phone && (
                  <p className="text-xs text-muted-foreground">No contact information provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Member since */}
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 shrink-0" />
                  <span>Member since {new Date(business.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
