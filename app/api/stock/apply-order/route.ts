import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { applyStockForOrder, getAdminClient } from '@/lib/stock'
import { priceOrderFromDatabase } from '@/lib/orders/price-order'

export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data: order } = await admin
      .from('orders')
      .select('id, items, coupon_code, status, stock_decremented, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'cancelled' || order.stock_decremented) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const priced = await priceOrderFromDatabase(
      Array.isArray(order.items) ? order.items : [],
      typeof order.coupon_code === 'string' ? order.coupon_code : null
    )

    if (!priced.ok) {
      return NextResponse.json({ error: priced.message }, { status: 400 })
    }

    const { data: repriced } = await admin
      .from('orders')
      .update({
        items: priced.items,
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        discount: priced.discount,
        total: priced.total,
        coupon_code: priced.couponCode,
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('stock_decremented', false)
      .select('id')
      .maybeSingle()

    if (!repriced) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const result = await applyStockForOrder(orderId, { userId: user.id })
    if (!result.ok) {
      return NextResponse.json({ error: result.message ?? 'Out of stock' }, { status: 409 })
    }

    return NextResponse.json({ success: true, skipped: result.skipped ?? false })
  } catch (error) {
    console.error('[apply-order]', error)
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 })
  }
}
