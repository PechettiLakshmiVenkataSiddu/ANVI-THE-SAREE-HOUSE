import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type StockLine = { productId: string; quantity: number }

export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase service role is not configured')
  }
  return createClient(url, key)
}

export function mergeLineQuantities(items: StockLine[]): { productId: string; quantity: number }[] {
  const merged = new Map<string, number>()
  for (const item of items) {
    const id = item.productId
    const qty = Math.floor(Number(item.quantity) || 0)
    if (!id || qty <= 0) continue
    merged.set(id, (merged.get(id) ?? 0) + qty)
  }
  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))
}

export async function restoreStockItems(
  applied: { productId: string; quantity: number }[],
  admin: SupabaseClient = getAdminClient()
) {
  for (const { productId, quantity } of applied) {
    await admin.rpc('increment_stock', { p_id: productId, qty: quantity })
  }
}

export async function decrementStockItems(
  items: StockLine[],
  admin: SupabaseClient = getAdminClient()
): Promise<{ ok: true } | { ok: false; message: string }> {
  const lines = mergeLineQuantities(items)
  const applied: { productId: string; quantity: number }[] = []

  for (const { productId, quantity } of lines) {
    const { data, error } = await admin.rpc('decrement_stock', {
      p_id: productId,
      qty: quantity,
    })

    if (error || data !== true) {
      await restoreStockItems(applied, admin)
      return { ok: false, message: 'One or more items are out of stock' }
    }

    applied.push({ productId, quantity })
  }

  return { ok: true }
}

function orderLines(order: { items?: unknown }): StockLine[] {
  if (!Array.isArray(order.items)) return []
  return order.items.map((item: { productId?: string; product_id?: string; quantity?: number }) => ({
    productId: item.productId ?? item.product_id ?? '',
    quantity: item.quantity ?? 0,
  }))
}

export async function applyStockForOrder(
  orderId: string,
  options?: { userId?: string }
): Promise<{ ok: boolean; skipped?: boolean; message?: string }> {
  const admin = getAdminClient()

  let query = admin
    .from('orders')
    .select('id, items, status, stock_decremented, user_id')
    .eq('id', orderId)

  if (options?.userId) {
    query = query.eq('user_id', options.userId)
  }

  const { data: order, error } = await query.maybeSingle()

  if (error || !order) {
    return { ok: false, message: 'Order not found' }
  }

  if (order.status === 'cancelled' || order.stock_decremented) {
    return { ok: true, skipped: true }
  }

  let lockQuery = admin
    .from('orders')
    .update({ stock_decremented: true })
    .eq('id', orderId)
    .eq('stock_decremented', false)

  if (options?.userId) {
    lockQuery = lockQuery.eq('user_id', options.userId)
  }

  const { data: locked } = await lockQuery.select('id').maybeSingle()

  if (!locked) {
    return { ok: true, skipped: true }
  }

  const result = await decrementStockItems(orderLines(order), admin)
  if (!result.ok) {
    let unlock = admin.from('orders').update({ stock_decremented: false }).eq('id', orderId)
    if (options?.userId) {
      unlock = unlock.eq('user_id', options.userId)
    }
    await unlock
    return result
  }

  return { ok: true }
}

export async function applyStockByRazorpayPaymentId(razorpayPaymentId: string) {
  if (!razorpayPaymentId) {
    return { ok: true, skipped: true }
  }

  const admin = getAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id')
    .eq('razorpay_payment_id', razorpayPaymentId)
    .maybeSingle()

  if (!order) {
    return { ok: true, skipped: true }
  }

  return applyStockForOrder(order.id)
}
