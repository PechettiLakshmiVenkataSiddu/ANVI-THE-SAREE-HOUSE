'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/context/cart-context'
import { calculateTotal } from '@/lib/utils/cart'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, couponCode } = useCart()
  const { subtotal, shipping, discount, total } = calculateTotal(items, couponCode)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Cart ({items.length})
              </h2>
              <button onClick={onClose} aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag size={48} className="text-muted-foreground/40" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-semibold text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex gap-3 pb-4 border-b border-border"
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.color} · {item.size}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                              className="p-1 hover:bg-secondary"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                              className="p-1 hover:bg-secondary"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.color, item.size)}
                            className="text-xs text-destructive hover:underline ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full text-center border border-primary text-primary py-2.5 rounded-md font-semibold text-sm hover:bg-secondary transition"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full text-center bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
