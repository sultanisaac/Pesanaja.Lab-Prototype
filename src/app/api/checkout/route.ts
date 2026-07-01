import { NextResponse } from 'next/server'
import { Xendit } from 'xendit-node'
import { createClient } from '@/lib/supabase/server'

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_placeholder',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { businessId, upgradeId } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!businessId && !upgradeId) {
      return new NextResponse('Missing businessId or upgradeId', { status: 400 })
    }

    const externalId = businessId ? `business_id:${businessId}` : `upgrade_id:${upgradeId}`

    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: 150000, // Rp 150.000
        payerEmail: user.email,
        description: 'Subscription to Pesanaja.Lab',
        successRedirectUrl: `https://pesanajalab-prototype.vercel.app/dashboard/business`,
        failureRedirectUrl: `https://pesanajalab-prototype.vercel.app/dashboard/business?canceled=true`,
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
