import { NextRequest, NextResponse } from 'next/server'
import { applyStockByRazorpayPaymentId } from '@/lib/stock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Razorpay webhook received:', body.event)

    const paymentId = body?.payload?.payment?.entity?.id as string | undefined
    if (paymentId && (body.event === 'payment.captured' || body.event === 'order.paid')) {
      await applyStockByRazorpayPaymentId(paymentId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}