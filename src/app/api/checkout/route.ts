import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSubscriptionInvoice } from '@/lib/xendit'

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

    const invoice = await createSubscriptionInvoice(externalId, user.email || '')
    
    return NextResponse.json({ url: invoice.invoiceUrl })
  } catch (error) {
    console.error('Payment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Error'
    return new NextResponse(errorMessage, { status: 500 })
  }
}
