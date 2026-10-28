import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/stock'
import { newServerOrderMeta, priceOrderFromDatabase, sanitizeShippingAddress } from '@/lib/orders/price-order'

export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const shippingAddress = sanitizeShippingAddress(body?.shipping_address)
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Valid shipping address is required' }, { status: 400 })
    }

    const priced = await priceOrderFromDatabase(
      Array.isArray(body?.items) ? body.items : [],
      typeof body?.coupon_code === 'string' ? body.coupon_code : null
    )

    if (!priced.ok) {
      return NextResponse.json({ error: priced.message }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const meta = newServerOrderMeta()
    const admin = getAdminClient()
    const payload = {
      user_id: user.id,
      order_number: meta.order_number,
      items: priced.items,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      discount: priced.discount,
      total: priced.total,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'Razorpay',
      shipping_address: shippingAddress,
      coupon_code: priced.couponCode,
      estimated_delivery: meta.estimated_delivery,
      stock_decremented: false,
    }

    const { data: dbOrder, error: insertError } = await admin.from('orders').insert(payload).select().single()
    if (insertError || !dbOrder) {
      console.error('[create-order] insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })

      const amountInPaise = Math.round(Number(priced.total) * 100)
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: String(dbOrder.order_number).replace('#', '').slice(0, 40),
        notes: {
          order_id: dbOrder.id,
        },
      })

      return NextResponse.json({ order, orderId: dbOrder.id })
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      await admin.from('orders').delete().eq('id', dbOrder.id).eq('user_id', user.id).eq('payment_status', 'pending')
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
