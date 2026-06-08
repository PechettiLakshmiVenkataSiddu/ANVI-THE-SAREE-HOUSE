'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { getCartItemKey } from '@/lib/utils/cart'
import type { CartItem, Product } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  couponCode: string | null
  isHydrated: boolean
  addItem: (product: Product, quantity?: number, color?: string, size?: string, blouseOption?: string) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  itemCount: number
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems, isHydrated] = useLocalStorage<CartItem[]>('saree-cart', [])
  const [couponCode, setCouponCode] = useLocalStorage<string | null>('saree-coupon', null)

  // ✅ Fixed — handles both Supabase and static data
const addItem = useCallback(
  (
    product: Product,
    quantity = 1,
    color = product.colors?.[0]?.color ?? product.colors?.[0] ?? 'Default',
    size = product.sizes?.[0] ?? 'Free Size',
    blouseOption = (product.blouseOptions ?? product.blouseOptions)?.[0] ?? 'Without Blouse'
  ) => {
      setItems((prev) => {
        const key = getCartItemKey(product.id, color, size)
        const existing = prev.find((item) => getCartItemKey(item.productId, item.color, item.size) === key)
        if (existing) {
          return prev.map((item) =>
            getCartItemKey(item.productId, item.color, item.size) === key
              ? { ...item, quantity: item.quantity + quantity }
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
    },
    [setItems]
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
    (productId: string, color: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, color, size)
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          getCartItemKey(item.productId, item.color, item.size) === getCartItemKey(productId, color, size)
            ? { ...item, quantity }
            : item
        )
      )
    },
    [setItems, removeItem]
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
