export const FREE_SHIPPING_THRESHOLD = 0
export const SHIPPING_COST = 99
export const TAX_RATE = 0

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
}

export const COUPONS = [
  { code: 'SAREE10', discountPercent: 10, minOrder: 1500 },
  { code: 'WELCOME20', discountPercent: 20, minOrder: 2500 },
  { code: 'FESTIVE15', discountPercent: 15, minOrder: 2000 },
]
