import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // SECURITY FIX 1: Verify logged in user
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // SECURITY FIX 2: Verify order belongs to this user
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY FIX 3: Only allow cancel for placed/confirmed
    const cancellableStatuses = ['pending', 'processing']
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json({ 
        error: `Order cannot be cancelled. Current status: ${order.status}` 
      }, { status: 400 })
    }

    // SECURITY FIX 4: Prevent double refund
    if (order.refund_status === 'refunded') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 })
    }

    // Handle Razorpay refund
    if (order.payment_method === 'razorpay' || order.payment_method === 'Razorpay') {
      
      if (!order.razorpay_payment_id) {
        return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 })
      }

      // Call Razorpay refund API
      const auth = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
      ).toString('base64')

      const refundRes = await fetch(
        `https://api.razorpay.com/v1/payments/${order.razorpay_payment_id}/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: Math.round(order.total * 100) // convert to paise
          }),
        }
      )

      const refund = await refundRes.json()

      if (!refundRes.ok) {
        console.error('Razorpay refund failed:', refund)
        return NextResponse.json({ 
          error: refund.error?.description || 'Refund failed' 
        }, { status: 400 })
      }

      // Update order with refund info
      await supabaseAdmin.from('orders').update({
        status: 'cancelled',
        refund_status: 'refunded',
        refund_id: refund.id,
        cancelled_at: new Date().toISOString(),
      }).eq('id', orderId)

      // Log cancellation
      await supabaseAdmin.from('cancellations').insert({
        order_id: orderId,
        razorpay_payment_id: order.razorpay_payment_id,
        razorpay_refund_id: refund.id,
        refund_amount: order.total,
        cancelled_at: new Date().toISOString(),
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Order cancelled and refund initiated. Money will be credited in 5-7 business days.'
      })
    }

    // COD - just cancel, no refund needed
    await supabaseAdmin.from('orders').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', orderId)

    await supabaseAdmin.from('cancellations').insert({
      order_id: orderId,
      razorpay_payment_id: null,
      razorpay_refund_id: null,
      refund_amount: 0,
      cancelled_at: new Date().toISOString(),
    })

    return NextResponse.json({ 
      success: true,
      message: 'Order cancelled successfully.'
    })

  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}