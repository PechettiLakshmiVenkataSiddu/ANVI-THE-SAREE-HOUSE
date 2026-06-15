import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check cancellable status
    const cancellableStatuses = ['pending', 'processing']
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json({
        error: 'Order cannot be cancelled at this stage.'
      }, { status: 400 })
    }

    // ATOMIC LOCK - prevents double refund
    // Only ONE request can get true, all others get false
    const { data: lockResult } = await supabaseAdmin
      .rpc('lock_order_for_refund', { order_id: orderId })

    if (!lockResult) {
      return NextResponse.json({
        error: 'Order cancellation already in progress.'
      }, { status: 400 })
    }

    // Check if already refunded
    if (order.refund_status === 'refunded') {
      return NextResponse.json({ 
        error: 'Order already refunded' 
      }, { status: 400 })
    }

    const isLiveMode = process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')

    // Handle Razorpay refund (only in live mode)
    if (
      (order.payment_method === 'razorpay' || order.payment_method === 'Razorpay') &&
      order.razorpay_payment_id &&
      isLiveMode
    ) {
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
            amount: Math.round(order.total * 100)
          }),
        }
      )

      const refund = await refundRes.json()

      if (!refundRes.ok) {
        // Release lock if refund failed
        await supabaseAdmin
          .from('orders')
          .update({ refund_initiated_at: null })
          .eq('id', orderId)

        return NextResponse.json({
          error: refund.error?.description || 'Refund failed'
        }, { status: 400 })
      }

      // Mark as refunded
      await supabaseAdmin.from('orders').update({
        status: 'cancelled',
        refund_status: 'refunded',
        refund_id: refund.id,
        cancelled_at: new Date().toISOString(),
      }).eq('id', orderId)

      try {
        await supabaseAdmin.from('cancellations').insert({
          order_id: orderId,
          razorpay_payment_id: order.razorpay_payment_id,
          razorpay_refund_id: refund.id,
          refund_amount: order.total,
          cancelled_at: new Date().toISOString(),
        })
      } catch (e) {
        console.log('Cancellations log failed - continuing')
      }

      return NextResponse.json({
        success: true,
        message: 'Order cancelled. Refund will be credited in 5-7 business days.'
      })
    }

    // COD or Test mode - just cancel
    await supabaseAdmin.from('orders').update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    }).eq('id', orderId)

    try {
      await supabaseAdmin.from('cancellations').insert({
        order_id: orderId,
        razorpay_payment_id: null,
        razorpay_refund_id: null,
        refund_amount: 0,
        cancelled_at: new Date().toISOString(),
      })
    } catch (e) {
      console.log('Cancellations log failed - continuing')
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully.'
    })

  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}