import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, CheckCircle2, BarChart2, Shield, ArrowRight } from 'lucide-react'
import { CheckoutButton } from '@/components/CheckoutButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    priceNote: 'Forever free',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 appointments/month',
      'Basic business profile',
      'Customer reviews',
      '1 service listing',
    ],
    cta: null,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Rp 150.000',
    priceNote: '/month',
    description: 'For growing businesses',
    features: [
      'Unlimited appointments',
      'Full analytics dashboard',
      'Priority listing in search',
      'Up to 20 service listings',
      'Customer management tools',
      'Verified badge eligibility',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'Contact us',
    description: 'For large operations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited service listings',
      'White-label options',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const featureCompare = [
  { feature: 'Appointments per month', starter: '10', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Service listings',       starter: '1',  pro: '20',         enterprise: 'Unlimited' },
  { feature: 'Analytics',              starter: 'Basic', pro: 'Full',    enterprise: 'Full + Export' },
  { feature: 'Verified badge',         starter: false, pro: true,        enterprise: true },
  { feature: 'Priority search listing',starter: false, pro: true,        enterprise: true },
  { feature: 'Account manager',        starter: false, pro: false,       enterprise: true },
]

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, status')
    .eq('owner_id', user?.id)
    .single()

  // Simulate current plan — you'd store this in your DB/Stripe in production
  const currentPlan = 'starter'

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
          <Zap className="h-3.5 w-3.5" /> Subscription Plans
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Choose your plan</h1>
        <p className="text-muted-foreground text-sm">
          Scale your business on Pesanaja.Lab. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current plan banner */}
      {business && (
        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {business.name ?? 'Your business'} is currently on the{' '}
                <span className="text-primary capitalize">{currentPlan}</span> plan.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upgrade to unlock unlimited appointments, full analytics, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan
          return (
            <Card
              key={plan.id}
              className={cn(
                'shadow-sm relative flex flex-col',
                plan.highlight && 'border-primary ring-2 ring-primary/20 shadow-md',
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                    MOST POPULAR
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-success text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
                    CURRENT
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-xs">{plan.description}</CardDescription>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.priceNote}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-4">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  {plan.cta === 'Upgrade to Pro' ? (
                    <CheckoutButton />
                  ) : plan.cta === 'Contact Sales' ? (
                    <a
                      href="mailto:hello@pesanaja.lab"
                      className="flex items-center justify-center gap-2 w-full py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                    >
                      {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full py-2 rounded-lg text-sm font-medium text-muted-foreground bg-muted/40">
                      {isCurrent ? 'Your current plan' : 'Free plan'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature comparison table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Feature Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-muted-foreground font-medium w-1/2">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} className={cn('py-3 px-3 text-center font-bold', p.highlight ? 'text-primary' : 'text-foreground')}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureCompare.map((row, i) => (
                  <tr key={row.feature} className={cn('border-b border-border/50', i % 2 === 0 && 'bg-muted/20')}>
                    <td className="py-3 pr-4 text-foreground">{row.feature}</td>
                    {[row.starter, row.pro, row.enterprise].map((val, j) => (
                      <td key={j} className="py-3 px-3 text-center">
                        {typeof val === 'boolean' ? (
                          val
                            ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                            : <span className="text-muted-foreground/50">—</span>
                        ) : (
                          <span className={cn('text-xs font-medium', j === 1 && 'text-primary')}>{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom note */}
      <p className="text-center text-xs text-muted-foreground">
        All plans include a 7-day free trial. No credit card required for Starter.{' '}
        <Link href="/dashboard/business/settings" className="text-primary hover:underline">
          Manage your business →
        </Link>
      </p>
    </div>
  )
}
