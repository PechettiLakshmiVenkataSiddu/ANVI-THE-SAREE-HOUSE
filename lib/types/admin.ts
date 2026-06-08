export type AdminOrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'

export type ProfileRole = 'admin' | 'customer'

export interface DbProfile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: ProfileRole
  created_at: string
  updated_at: string
}

export interface DbCollection {
  id: string
  slug: string
  title: string
  description: string | null
  image_url: string | null
  banner_url: string | null
  created_at: string
  updated_at: string
}

export interface DbProduct {
  id: string
  slug: string
  name: string
  description: string | null
  details: string[]
  price: number
  original_price: number
  stock: number
  category: string | null
  category_label: string | null
  images: string[]
  colors: { color: string; colorHex: string }[]
  sizes: string[]
  blouse_options: string[]
  rating: number
  reviews: number
  is_new: boolean
  is_best_seller: boolean
  is_featured: boolean
  tags: string[]
  collection_id: string | null
  created_at: string
  updated_at: string
}

export interface DbOrderItem {
  product_id: string
  name: string
  price: number
  image: string
  quantity: number
  color: string
}

export interface DbOrder {
  id: string
  order_number: string
  user_id: string | null
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  items: DbOrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: AdminOrderStatus
  shipping_address: Record<string, string> | null
  payment_method: string | null
  coupon_code: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: DbOrder[]
}

export const ADMIN_ORDER_STATUSES: { value: AdminOrderStatus; label: string }[] = [
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
]
