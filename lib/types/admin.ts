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
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export interface DbCustomer {
  id: string
  user_id: string | null
  email: string
  full_name: string | null
  phone: string | null
  joined_at: string
  order_count: number
}

export interface DbCollection {
  id: string
  slug: string
  title: string
  description: string | null
  image_url: string | null
  banner_url: string | null
  is_active: boolean
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
  payment_status: string | null
  coupon_code: string | null
  razorpay_payment_id: string | null
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

// Map UI status values to valid database status values
export const UI_STATUS_TO_DB_STATUS: Record<AdminOrderStatus, string> = {
  placed: 'pending',
  confirmed: 'processing',
  packed: 'processing',
  shipped: 'shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
}

// Map database status values back to UI status values for display
export const DB_STATUS_TO_UI_STATUS: Record<string, AdminOrderStatus> = {
  pending: 'placed',
  processing: 'confirmed',
  shipped: 'shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'delivered',
}
