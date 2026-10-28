import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/stock'
import { fulfillPaidOrder } from '@/lib/orders/fulfill-razorpay'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || ''

    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const expectedBuf = Buffer.from(expectedSignature)
    const signatureBuf = Buffer.from(razorpay_signature)
    const isValid =
      expectedBuf.length === signatureBuf.length &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    if (typeof orderId === 'string' && orderId) {
      const authClient = await createServerClient()
      const {
        data: { user },
      } = await authClient.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const admin = getAdminClient()
      const { data: order } = await admin
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const result = await fulfillPaidOrder(orderId, razorpay_payment_id)
      if (!result.ok) {
        return NextResponse.json({ error: result.message ?? 'Could not update order' }, { status: 409 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
