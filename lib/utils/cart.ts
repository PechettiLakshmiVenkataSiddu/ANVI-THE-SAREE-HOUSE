import { COUPONS, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/constants'
import type { CartItem } from '@/lib/types'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST
}

export function calculateDiscount(subtotal: number, couponCode: string | null): number {
  if (!couponCode) return 0
  const coupon = COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())
  if (!coupon || subtotal < coupon.minOrder) return 0
  return Math.round((subtotal * coupon.discountPercent) / 100)
}

export function calculateTotal(items: CartItem[], couponCode: string | null = null): {
  subtotal: number
  shipping: number
  discount: number
  total: number
} {
  const subtotal = calculateSubtotal(items)
  const shipping = calculateShipping(subtotal)
  const discount = calculateDiscount(subtotal, couponCode)
  const total = subtotal + shipping - discount
  return { subtotal, shipping, discount, total }
}

export function validateCoupon(code: string, subtotal: number): { valid: boolean; message: string } {
  const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase())
  if (!coupon) return { valid: false, message: 'Invalid coupon code' }
  if (subtotal < coupon.minOrder) {
    return { valid: false, message: `Minimum order of ₹${coupon.minOrder} required` }
  }
  return { valid: true, message: `${coupon.discountPercent}% discount applied!` }
}

export function getCartItemKey(productId: string, color: string, size: string): string {
  return `${productId}-${color}-${size}`
}
