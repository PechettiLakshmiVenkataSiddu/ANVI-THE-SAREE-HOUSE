'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { getCartItemKey } from '@/lib/utils/cart'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, Product } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  couponCode: string | null
  isHydrated: boolean
  addItem: (product: Product, quantity?: number, color?: string, size?: string, blouseOption?: string) => Promise<boolean>
  removeItem: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => Promise<void>
  clearCart: () => void
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  itemCount: number
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  // Cart key is unique per user
  const cartKey = user ? `saree-cart-${user.id}` : 'saree-cart-guest'
  const couponKey = user ? `saree-coupon-${user.id}` : 'saree-coupon-guest'

  const [items, setItems, isHydrated] = useLocalStorage<CartItem[]>(cartKey, [])
  const [couponCode, setCouponCode] = useLocalStorage<string | null>(couponKey, null)
  const supabase = createClient()

  // ✅ Fixed — handles both Supabase and static data
const addItem = useCallback(
  async (
    product: Product,
    quantity = 1,
    color = product.colors?.[0]?.color ?? product.colors?.[0] ?? 'Default',
    size = product.sizes?.[0] ?? 'Free Size',
    blouseOption = (product.blouseOptions ?? product.blouseOptions)?.[0] ?? 'Without Blouse'
  ) => {
      const { data } = await supabase.from('products').select('stock').eq('id', product.id).maybeSingle()
      const stock = typeof data?.stock === 'number' ? data.stock : Number(product.stock) || 0
      if (stock <= 0) return false

      let added = true
      setItems((prev) => {
        const key = getCartItemKey(product.id, color, size)
        const existing = prev.find((item) => getCartItemKey(item.productId, item.color, item.size) === key)
        const nextQty = (existing?.quantity ?? 0) + quantity
        if (nextQty > stock) {
          added = false
          return prev
        }
        if (existing) {
          return prev.map((item) =>
            getCartItemKey(item.productId, item.color, item.size) === key
              ? { ...item, quantity: nextQty }
              : item
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0],
            quantity,
            color,
            size,
            blouseOption,
          },
        ]
      })
      return added
    },
    [setItems, supabase]
  )

  const removeItem = useCallback(
    (productId: string, color: string, size: string) => {
      setItems((prev) =>
        prev.filter((item) => getCartItemKey(item.productId, item.color, item.size) !== getCartItemKey(productId, color, size))
      )
    },
    [setItems]
  )

  const updateQuantity = useCallback(
    async (productId: string, color: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, color, size)
        return
      }
      const { data } = await supabase.from('products').select('stock').eq('id', productId).maybeSingle()
      const stock = typeof data?.stock === 'number' ? data.stock : 0
      if (quantity > stock) return
      setItems((prev) =>
        prev.map((item) =>
          getCartItemKey(item.productId, item.color, item.size) === getCartItemKey(productId, color, size)
            ? { ...item, quantity }
            : item
        )
      )
    },
    [setItems, removeItem, supabase]
  )

  const clearCart = useCallback(() => {
    setItems([])
    setCouponCode(null)
  }, [setItems, setCouponCode])

  const applyCoupon = useCallback(
    (code: string) => {
      setCouponCode(code.toUpperCase())
    },
    [setCouponCode]
  )

  const removeCoupon = useCallback(() => {
    setCouponCode(null)
  }, [setCouponCode])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const isInCart = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        couponCode,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        itemCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
