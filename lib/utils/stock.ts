import { supabase } from '@/lib/supabase'
import type { CartItem } from '@/lib/types'

export async function fetchProductStocks(productIds: string[]): Promise<Record<string, number>> {
  const ids = [...new Set(productIds.filter(Boolean))]
  if (ids.length === 0) return {}

  const { data, error } = await supabase.from('products').select('id, stock').in('id', ids)
  if (error || !data) return {}

  return Object.fromEntries(data.map((row) => [row.id as string, Number(row.stock) || 0]))
}

export function cartStockIssue(
  items: CartItem[],
  stocks: Record<string, number>
): { ok: true } | { ok: false; message: string } {
  const qtyByProduct = new Map<string, { name: string; quantity: number }>()

  for (const item of items) {
    const current = qtyByProduct.get(item.productId)
    if (current) {
      current.quantity += item.quantity
    } else {
      qtyByProduct.set(item.productId, { name: item.name, quantity: item.quantity })
    }
  }

  for (const [productId, { name, quantity }] of qtyByProduct) {
    if (!(productId in stocks)) continue
    const stock = stocks[productId] ?? 0
    if (stock <= 0) {
      return { ok: false, message: `${name} is out of stock` }
    }
    if (quantity > stock) {
      return { ok: false, message: `Only ${stock} left for ${name}` }
    }
  }

  return { ok: true }
}
