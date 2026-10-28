import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { fulfillPaidOrder, orderIdFromRazorpayNotes } from '@/lib/orders/fulfill-razorpay'

function validWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)
  if (expectedBuf.length !== signatureBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

    if (!secret) {
      console.error('[webhook] RAZORPAY_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (!validWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const body = JSON.parse(rawBody)
    console.log('Razorpay webhook received:', body.event)

    if (body.event !== 'payment.captured' && body.event !== 'order.paid') {
      return NextResponse.json({ success: true })
    }

    const payment = body?.payload?.payment?.entity
    const rzOrder = body?.payload?.order?.entity
    const orderId =
      orderIdFromRazorpayNotes(payment?.notes) || orderIdFromRazorpayNotes(rzOrder?.notes)

    if (!orderId) {
      console.error('[webhook] Missing order_id in notes')
      return NextResponse.json({ success: true })
    }

    const result = await fulfillPaidOrder(orderId, payment?.id ?? null)
    if (!result.ok) {
      console.error('[webhook] fulfill failed:', result.message)
      return NextResponse.json({ error: result.message ?? 'Fulfillment failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, skipped: result.skipped ?? false })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
