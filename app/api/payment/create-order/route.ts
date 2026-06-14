import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
const { amount } = await request.json()

// Verify user is logged in

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Razorpay expects amount in paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100)

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        key1: 'value1',
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
