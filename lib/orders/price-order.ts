import { generateOrderNumber } from '@/lib/data/orders'
import { getAdminClient } from '@/lib/stock'
import type { ShippingAddress } from '@/lib/types'
import { calculateShipping } from '@/lib/utils/cart'

export type IncomingLine = {
  productId?: string
  product_id?: string
  quantity?: number
  color?: string
  size?: string
  blouseOption?: string
}

export type PricedOrderItem = {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  color: string
  size?: string
  blouseOption?: string
}

const ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'pincode',
  'country',
] as const

function productImage(images: unknown): string {
  if (!images) return '/images/placeholder.png'
  if (typeof images === 'string') return images
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && 'url' in first) {
      return String((first as { url?: string }).url || '/images/placeholder.png')
    }
  }
  return '/images/placeholder.png'
}

export function sanitizeShippingAddress(raw: unknown): ShippingAddress | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const address = {} as ShippingAddress

  for (const field of ADDRESS_FIELDS) {
    const value = String(source[field] ?? '').trim()
    address[field] = value
  }

  if (!address.country) address.country = 'India'

  const required = ADDRESS_FIELDS.filter((field) => field !== 'country')
  if (required.some((field) => !address[field])) return null

  return address
}

async function couponDiscount(couponCode: string | null, subtotal: number): Promise<number> {
  if (!couponCode) return 0

  const admin = getAdminClient()
  const { data } = await admin
    .from('coupons')
    .select('discount_percent, min_order')
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .maybeSingle()

  if (!data || subtotal < Number(data.min_order || 0)) return 0
  return Math.round((subtotal * Number(data.discount_percent)) / 100)
}

export async function priceOrderFromDatabase(
  lines: IncomingLine[],
  couponCode: string | null = null
): Promise<
  | { ok: true; items: PricedOrderItem[]; subtotal: number; shipping: number; discount: number; total: number; couponCode: string | null }
  | { ok: false; message: string }
> {
  const parsed = lines
    .map((line) => ({
      productId: String(line.productId ?? line.product_id ?? ''),
      quantity: Math.floor(Number(line.quantity) || 0),
      color: String(line.color ?? 'Default'),
      size: line.size ? String(line.size) : undefined,
      blouseOption: line.blouseOption ? String(line.blouseOption) : undefined,
    }))
    .filter((line) => line.productId && line.quantity > 0)

  if (parsed.length === 0) {
    return { ok: false, message: 'Cart is empty' }
  }

  if (parsed.some((line) => line.quantity > 99)) {
    return { ok: false, message: 'Invalid quantity' }
  }

  const ids = [...new Set(parsed.map((line) => line.productId))]
  const admin = getAdminClient()
  const { data: products, error } = await admin
    .from('products')
    .select('id, name, price, images')
    .in('id', ids)

  if (error || !products) {
    return { ok: false, message: 'Failed to load products' }
  }

  const byId = new Map(products.map((product) => [product.id as string, product]))
  if (ids.some((id) => !byId.has(id))) {
    return { ok: false, message: 'One or more products were not found' }
  }

  const items: PricedOrderItem[] = parsed.map((line) => {
    const product = byId.get(line.productId)!
    return {
      productId: line.productId,
      name: String(product.name),
      price: Number(product.price) || 0,
      image: productImage(product.images),
      quantity: line.quantity,
      color: line.color,
      size: line.size,
      blouseOption: line.blouseOption,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = calculateShipping(subtotal)
  const normalizedCoupon = couponCode ? couponCode.toUpperCase() : null
  const discount = await couponDiscount(normalizedCoupon, subtotal)
  const total = Math.max(0, subtotal + shipping - discount)

  return {
    ok: true,
    items,
    subtotal,
    shipping,
    discount,
    total,
    couponCode: discount > 0 ? normalizedCoupon : null,
  }
}

export function newServerOrderMeta() {
  const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  deliveryDate.setHours(11, 0, 0, 0)
  return {
    order_number: generateOrderNumber(),
    estimated_delivery: deliveryDate.toISOString(),
  }
}
