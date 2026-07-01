import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Xendit } from 'xendit-node'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // @ts-expect-error - TS expects a specific literal that changes per SDK version
  apiVersion: '2025-02-24.acacia',
})

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_placeholder',
})

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const provider = process.env.PAYMENT_PROVIDER || 'stripe'

    if (provider === 'xendit') {
      const invoice = await xendit.Invoice.createInvoice({
        data: {
          externalId: `sub-${user.id}-${Date.now()}`,
          amount: 150000, // Rp 150.000
          payerEmail: user.email,
          description: 'Subscription to Pesanaja.Lab',
          successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/business?success=true`,
          failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/business?canceled=true`,
          currency: 'IDR'
        }
      })
      
      return NextResponse.json({ url: invoice.invoiceUrl })
    }

    // Default: Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'idr',
            product: 'prod_UmUeVZrVPzrARG',
            unit_amount: 15000000, // Rp 150.000,00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/business?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/business?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Error'
    return new NextResponse(errorMessage, { status: 500 })
  }
}
