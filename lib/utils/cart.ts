import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/constants'
import type { CartItem } from '@/lib/types'
import { supabase } from '@/lib/supabase'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateShipping(subtotal: number, country: string = 'India'): number {
  if (country === 'India' || country === '' || subtotal === 0) return 0
  return SHIPPING_COST
}

export async function calculateDiscount(subtotal: number, couponCode: string | null): Promise<number> {
  if (!couponCode) return 0
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .maybeSingle()
  
  if (error || !data || subtotal < data.min_order) return 0
  return Math.round((subtotal * data.discount_percent) / 100)
}

export async function calculateTotal(items: CartItem[], couponCode: string | null = null): Promise<{
  subtotal: number
  shipping: number
  discount: number
  total: number
}> {
  const subtotal = calculateSubtotal(items)
  const shipping = calculateShipping(subtotal)
  const discount = await calculateDiscount(subtotal, couponCode)
  const total = subtotal + shipping - discount
  return { subtotal, shipping, discount, total }
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; message: string }> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .maybeSingle()
  
  if (error || !data) return { valid: false, message: 'Invalid coupon code' }
  if (subtotal < data.min_order) {
    return { valid: false, message: `Minimum order of ₹${data.min_order} required` }
  }
  return { valid: true, message: `${data.discount_percent}% discount applied!` }
}

export function getCartItemKey(productId: string, color: string, size: string): string {
  return `${productId}-${color}-${size}`
}
