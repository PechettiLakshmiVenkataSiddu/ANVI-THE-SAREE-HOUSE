'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import { useOrders } from '@/lib/context/order-context'
import { motion } from 'framer-motion'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { getOrder } = useOrders()
  const order = orderId ? getOrder(orderId) : null

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Link href="/orders" className="text-accent font-semibold">View Orders</Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center py-12"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">Thank you for shopping with ANVI THE SAREE HOUSE</p>

      <div className="bg-card border border-border rounded-lg p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order Number</span>
          <span className="font-bold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Paid</span>
          <span className="font-bold">₹{order.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment</span>
          <span>{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Delivery</span>
          <span>{order.estimatedDelivery}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/orders/${order.id}`}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold flex items-center justify-center gap-2"
        >
          <Package size={18} /> Track Order
        </Link>
        <Link href="/shop" className="border border-primary text-primary px-6 py-3 rounded-md font-semibold">
          Continue Shopping
        </Link>
      </div>
    </motion.div>
  )
}

export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </main>
  )
}
