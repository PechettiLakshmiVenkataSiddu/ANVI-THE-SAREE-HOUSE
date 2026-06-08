'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import type { Product, WishlistItem } from '@/lib/types'

interface WishlistContextType {
  items: WishlistItem[]
  isHydrated: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems, isHydrated] = useLocalStorage<WishlistItem[]>('saree-wishlist', [])

  const addItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        if (prev.some((item) => item.productId === product.id)) return prev
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            rating: product.rating,
            reviews: product.reviews,
          },
        ]
      })
    },
    [setItems]
  )

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((item) => item.productId !== productId))
    },
    [setItems]
  )

  const toggleItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        if (prev.some((item) => item.productId === product.id)) {
          return prev.filter((item) => item.productId !== product.id)
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            rating: product.rating,
            reviews: product.reviews,
          },
        ]
      })
    },
    [setItems]
  )

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  )

  const clearWishlist = useCallback(() => setItems([]), [setItems])

  return (
    <WishlistContext.Provider
      value={{
        items,
        isHydrated,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearWishlist,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
