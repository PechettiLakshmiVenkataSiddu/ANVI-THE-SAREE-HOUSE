import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await request.json()

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

    // ✅ Save order to Supabase
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid', 
        payment_id: razorpay_payment_id,
        status: 'confirmed'
      })
      .eq('razorpay_order_id', razorpay_order_id)

    if (error) {
      console.error('Supabase order save error:', error)
      return NextResponse.json({ 
        error: `Payment received but order saving failed. Contact support with Payment ID: ${razorpay_payment_id}` 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}