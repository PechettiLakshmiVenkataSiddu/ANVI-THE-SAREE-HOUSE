export type { Product, ProductVariant, Category, CartItem, WishlistItem, Order, OrderItem, TrackingStep, ShippingAddress, User, Testimonial, Coupon, OrderStatus } from '@/lib/types'
export { products, getProductBySlug, getProductById, getProductsByCategory, getFeaturedProducts, getNewArrivals, getBestSellers, getRelatedProducts, searchProducts } from '@/lib/data/products'
export { categories, getCategoryBySlug } from '@/lib/data/categories'
export { createDemoOrder, createTrackingSteps, generateOrderNumber } from '@/lib/data/orders'
