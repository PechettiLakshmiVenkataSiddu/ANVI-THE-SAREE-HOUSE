import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { decrementStockItems, getAdminClient, mergeLineQuantities, restoreStockItems } from '@/lib/stock'
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

    const stockItems = priced.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    const decremented = await decrementStockItems(stockItems)
    if (!decremented.ok) {
      return NextResponse.json({ error: decremented.message }, { status: 409 })
    }

    const meta = newServerOrderMeta()
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
      payment_method: 'Cash on Delivery',
      shipping_address: shippingAddress,
      coupon_code: priced.couponCode,
      estimated_delivery: meta.estimated_delivery,
      stock_decremented: true,
    }

    const admin = getAdminClient()
    const { data, error } = await admin.from('orders').insert(payload).select().single()

    if (error || !data) {
      await restoreStockItems(mergeLineQuantities(stockItems))
      console.error('[place-cod] insert failed:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('[place-cod]', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
