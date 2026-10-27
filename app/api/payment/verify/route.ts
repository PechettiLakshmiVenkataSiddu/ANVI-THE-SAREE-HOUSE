import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { applyStockByRazorpayPaymentId } from '@/lib/stock'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || ''

    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Decrement only after a valid signature, and only if the DB order already exists.
    // Checkout creates the order after this response; apply-order / webhook cover that path.
    await applyStockByRazorpayPaymentId(razorpay_payment_id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}