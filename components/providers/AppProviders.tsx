'use client'

import { CartProvider } from '@/lib/context/cart-context'
import { WishlistProvider } from '@/lib/context/wishlist-context'
import { OrderProvider } from '@/lib/context/order-context'
import { AuthProvider } from '@/components/providers/AuthProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>{children}</OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
