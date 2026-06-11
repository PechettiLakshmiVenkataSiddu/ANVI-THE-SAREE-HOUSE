'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useCart } from '@/lib/context/cart-context'
import { useOrders } from '@/lib/context/order-context'
import { calculateTotal } from '@/lib/utils/cart'
import type { ShippingAddress } from '@/lib/types'
import Image from 'next/image'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const paymentMethods = ['Cash on Delivery', 'Razorpay']

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutPageContent />
    </ProtectedRoute>
  )
}

function CheckoutPageContent() {
  const router = useRouter()
  const { items, couponCode, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { subtotal, shipping, discount, total } = calculateTotal(items, couponCode)

  const [form, setForm] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})
  const [loading, setLoading] = useState(false)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <a href="/shop" className="text-accent font-semibold hover:text-primary">
            Continue Shopping
          </a>
        </div>
        <Footer />
      </main>
    )
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {}
    if (!form.firstName.trim()) newErrors.firstName = 'Required'
    if (!form.lastName.trim()) newErrors.lastName = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required'
    if (!form.phone.trim()) newErrors.phone = 'Required'
    if (!form.address.trim()) newErrors.address = 'Required'
    if (!form.city.trim()) newErrors.city = 'Required'
    if (!form.state.trim()) newErrors.state = 'Required'
    if (!form.pincode.trim()) newErrors.pincode = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      // If Razorpay is selected, handle Razorpay payment flow
      if (paymentMethod === 'Razorpay') {
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        })

        const { order } = await response.json()

        if (!order) {
          throw new Error('Failed to create Razorpay order')
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SzazBWGfFjJ39u',
          amount: order.amount,
          currency: order.currency,
          name: 'ANVI THE SAREE HOUSE',
          description: 'Saree Purchase',
          order_id: order.id,
          handler: async function (response: any) {
            // Verify payment signature
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              // Payment verified, create order
              const order = await createOrder(items, form, paymentMethod, couponCode)
              clearCart()
              router.push(`/checkout/confirmation?orderId=${order.id}`)
            } else {
              alert('Payment verification failed. Please try again.')
              setLoading(false)
            }
          },
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#8B5E3C',
          },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.on('payment.failed', function (response: any) {
          alert('Payment failed. Please try again.')
          setLoading(false)
        })
        razorpay.open()
      } else {
        // For other payment methods, create order directly
        const order = await createOrder(items, form, paymentMethod, couponCode)
        clearCart()
        router.push(`/checkout/confirmation?orderId=${order.id}`)
      }
    } catch (err) {
      console.error('Order failed:', err)
      alert('Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['firstName', 'lastName', 'email', 'phone'] as const).map((field) => (
                    <div key={field} className={field === 'email' || field === 'phone' ? 'sm:col-span-1' : ''}>
                      <label className="text-sm font-medium capitalize block mb-1">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        value={form[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Address</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['city', 'state', 'pincode'] as const).map((field) => (
                      <div key={field}>
                        <label className="text-sm font-medium capitalize block mb-1">{field}</label>
                        <input
                          type="text"
                          value={form[field]}
                          onChange={(e) => updateField(field, e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-card rounded-lg border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Payment Method</h2>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition ${paymentMethod === method ? 'border-primary bg-secondary/50' : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div>
              <div className="bg-card rounded-lg border border-border p-6 sticky top-28">
                <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.color}`} className="flex gap-3">
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold mt-6 hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? 'PROCESSING...' : 'PLACE ORDER'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  )
}
