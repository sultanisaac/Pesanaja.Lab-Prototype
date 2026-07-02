import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const xenditToken = req.headers.get('x-callback-token')
    if (xenditToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      // Allow testing without token in dev if not set
      if (process.env.NODE_ENV === 'production' || process.env.XENDIT_WEBHOOK_TOKEN) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    const payload = await req.json()
    console.log('Xendit webhook payload:', payload)

    // Check if the invoice is PAID or SETTLED
    if (payload.status !== 'PAID' && payload.status !== 'SETTLED') {
      return new NextResponse('Ignored', { status: 200 })
    }

    const externalId = payload.external_id as string
    if (!externalId) {
      return new NextResponse('Missing external_id', { status: 400 })
    }

    // We need service role key to update DB since webhooks are unauthenticated
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (externalId.startsWith('business_id:')) {
      const businessId = externalId.split(':')[1]
      
      // Update payment status (DB trigger will automatically notify admins)
      await supabase
        .from('businesses')
        .update({ payment_status: 'paid' })
        .eq('id', businessId)

    } else if (externalId.startsWith('upgrade_id:')) {
      const upgradeId = externalId.split(':')[1]

      // Update payment status on upgrade request (DB trigger will automatically notify admins)
      await supabase
        .from('business_upgrade_requests')
        .update({ payment_status: 'paid' })
        .eq('id', upgradeId)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
