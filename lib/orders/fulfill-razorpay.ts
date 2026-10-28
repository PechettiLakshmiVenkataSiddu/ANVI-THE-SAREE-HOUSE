import { applyStockForOrder, getAdminClient } from '@/lib/stock'

export function orderIdFromRazorpayNotes(notes: unknown): string | null {
  if (!notes || typeof notes !== 'object') return null
  const record = notes as Record<string, unknown>
  const value = record.order_id ?? record.supabase_order_id
  return typeof value === 'string' && value.length > 0 ? value : null
}

export async function fulfillPaidOrder(
  orderId: string,
  paymentId?: string | null
): Promise<{ ok: boolean; skipped?: boolean; message?: string }> {
  const admin = getAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) {
    return { ok: false, message: 'Order not found' }
  }

  if (order.status === 'cancelled') {
    return { ok: true, skipped: true }
  }

  const updates: Record<string, unknown> = {
    payment_status: 'paid',
  }
  if (order.status === 'pending') {
    updates.status = 'processing'
  }
  if (paymentId) {
    updates.razorpay_payment_id = paymentId
  }

  await admin.from('orders').update(updates).eq('id', orderId)

  return applyStockForOrder(orderId)
}
