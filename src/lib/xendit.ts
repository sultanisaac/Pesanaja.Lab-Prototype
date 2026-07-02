import { Xendit } from 'xendit-node'

export const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_placeholder',
})

export async function createSubscriptionInvoice(
  externalId: string,
  payerEmail: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pesanajalab-prototype.vercel.app'
  
  return await xendit.Invoice.createInvoice({
    data: {
      externalId,
      amount: 150000,
      payerEmail,
      description: 'Subscription to Pesanaja.Lab',
      successRedirectUrl: `${baseUrl}/dashboard/business`,
      failureRedirectUrl: `${baseUrl}/dashboard/business?canceled=true`,
      currency: 'IDR'
    }
  })
}
