export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'

export interface ProductVariant {
  color: string
  colorHex: string
  size?: string
  blouseOption?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  details: string[]
  price: number
  originalPrice: number
  images: string[]
  category: string
  categoryLabel: string
  colors: ProductVariant[]
  sizes: string[]
  blouseOptions: string[]
  rating: number
  reviews: number
  isNew?: boolean
  isBestSeller?: boolean
  isFeatured?: boolean
  tags: string[]
}

export interface Category {
  id: string
  slug: string
  title: string
  image: string
  description: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  color: string
  size: string
  blouseOption: string
}

export interface WishlistItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  image: string
  rating: number
  reviews: number
}

export interface TrackingStep {
  status: OrderStatus
  label: string
  date: string
  time: string
  completed: boolean
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  color: string
  deliveryDate?: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus?: string
  trackingSteps: TrackingStep[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  couponCode?: string
  createdAt: string
  estimatedDelivery?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  addresses: ShippingAddress[]
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  image: string
}

export interface Coupon {
  code: string
  discountPercent: number
  minOrder: number
}
