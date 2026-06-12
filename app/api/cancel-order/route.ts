import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { orderId, razorpayPaymentId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If razorpayPaymentId not provided, try to get it from the order
    const paymentId = razorpayPaymentId || order.razorpay_payment_id

    if (!paymentId) {
      return NextResponse.json({ error: 'razorpayPaymentId is required and not found on order' }, { status: 400 })
    }

    // Trigger Razorpay refund
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID

    if (!razorpayKeySecret || !razorpayKeyId) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const refundResponse = await fetch('https://api.razorpay.com/v1/payments/' + paymentId + '/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(razorpayKeyId + ':' + razorpayKeySecret).toString('base64'),
      },
      body: JSON.stringify({
        amount: order.total * 100, // Razorpay expects amount in paise
      }),
    })

    const refundData = await refundResponse.json()

    if (!refundResponse.ok) {
      console.error('Razorpay refund failed:', refundData)
      return NextResponse.json({ error: 'Refund failed: ' + (refundData.error?.description || 'Unknown error') }, { status: 500 })
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
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
    const { error: cancellationError } = await supabase
      .from('cancellations')
      .insert({
        order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_refund_id: refundData.id,
        refund_amount: refundData.amount / 100, // Convert back to rupees
        cancelled_at: new Date().toISOString(),
      })

    if (cancellationError) {
      console.error('Failed to insert cancellation record:', cancellationError)
      // Don't fail the request if cancellation record insertion fails
    }

    return NextResponse.json({ success: true, refundId: refundData.id })
  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
