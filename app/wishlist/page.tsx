'use client'

import { Trash2, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useWishlist } from '@/lib/context/wishlist-context'
import { useCart } from '@/lib/context/cart-context'
import { getProductById } from '@/lib/data/products'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const moveAllToCart = () => {
    items.forEach((item) => {
      const product = getProductById(item.productId)
      if (product) addItem(product)
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">WISHLIST ({items.length})</h1>
          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={moveAllToCart}
                className="text-sm text-accent font-semibold hover:text-primary"
              >
                MOVE ALL TO BAG
              </button>
              <button onClick={clearWishlist} className="text-sm text-destructive hover:underline">
                Clear All
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
            <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold">
              Explore Sarees
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.productId} className="bg-card rounded-lg border border-border p-4 flex gap-4">
                <div className="relative w-24 h-28 rounded overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">₹{item.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      onClick={() => {
                        const product = getProductById(item.productId)
                        if (product) addItem(product)
                      }}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <ShoppingCart size={14} /> ADD TO CART
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 border border-border rounded-md hover:bg-secondary"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
