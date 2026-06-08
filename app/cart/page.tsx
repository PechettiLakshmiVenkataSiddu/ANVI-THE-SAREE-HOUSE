'use client'

import { Minus, Plus, Trash2, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useCart } from '@/lib/context/cart-context'
import { calculateTotal, validateCoupon } from '@/lib/utils/cart'
import { COUPONS } from '@/lib/constants'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function CartPage() {
  const { items, updateQuantity, removeItem, couponCode, applyCoupon, removeCoupon } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const { subtotal, shipping, discount, total } = calculateTotal(items, couponCode)

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal)
    setCouponMessage(result.message)
    if (result.valid) {
      applyCoupon(couponInput)
      setCouponInput('')
    }
  }

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Your Cart' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-8">YOUR CART ({items.length})</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-xs font-bold tracking-wide border-b border-border">
                  <div className="col-span-5">PRODUCT</div>
                  <div className="col-span-2 text-center">PRICE</div>
                  <div className="col-span-3 text-center">QUANTITY</div>
                  <div className="col-span-2 text-right">TOTAL</div>
                </div>

                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0 items-center"
                  >
                    <div className="md:col-span-5 flex gap-4">
                      <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.color} · {item.size} · {item.blouseOption}
                        </p>
                        <button
                          onClick={() => removeItem(item.productId, item.color, item.size)}
                          className="text-xs text-destructive mt-2 flex items-center gap-1 hover:underline md:hidden"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 text-center text-sm font-semibold">
                      ₹{item.price.toLocaleString()}
                    </div>
                    <div className="md:col-span-3 flex justify-center">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                          className="p-2 hover:bg-secondary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                          className="p-2 hover:bg-secondary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
                      <span className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button
                        onClick={() => removeItem(item.productId, item.color, item.size)}
                        className="p-1.5 hover:bg-secondary rounded hidden md:block"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-28">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>

                <div className="mb-4">
                  <button
                    onClick={() => document.getElementById('coupon-input')?.focus()}
                    className="text-sm text-accent font-semibold flex items-center gap-1 hover:text-primary"
                  >
                    <Tag size={14} /> Apply Coupon
                  </button>
                  <div className="flex gap-2 mt-2">
                    <input
                      id="coupon-input"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-input"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs mt-1 ${couponCode ? 'text-green-600' : 'text-destructive'}`}>{couponMessage}</p>
                  )}
                  {couponCode && (
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-green-600 font-semibold">{couponCode} applied</span>
                      <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Try: {COUPONS.map((c) => c.code).join(', ')}
                  </p>
                </div>

                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-md font-semibold mt-6 hover:opacity-90 transition"
                >
                  PROCEED TO CHECKOUT
                </Link>
                <Link href="/shop" className="block text-center text-sm text-accent mt-4 hover:text-primary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
    </ProtectedRoute>
  )
}
