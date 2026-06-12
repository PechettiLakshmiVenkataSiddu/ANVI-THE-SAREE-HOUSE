import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Check payment method
    if (order.payment_method === 'Razorpay') {
      return NextResponse.json({ error: 'Razorpay refund will be added soon' }, { status: 400 })
    }

    // Update order status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // Insert record into cancellations table
    const { error: cancellationError } = await supabaseAdmin
      .from('cancellations')
      .insert({
        order_id: orderId,
        razorpay_payment_id: null,
        razorpay_refund_id: null,
        refund_amount: 0,
        cancelled_at: new Date().toISOString(),
      })

    if (cancellationError) {
      console.error('Failed to insert cancellation record:', cancellationError)
      // Don't fail the request if cancellation record insertion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
