import { NextResponse } from 'next/server'
import { Xendit } from 'xendit-node'
import { createClient } from '@/lib/supabase/server'

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
  } catch (error) {
    console.error('Payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Error'
    return new NextResponse(errorMessage, { status: 500 })
  }
}
