'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import { useOrders } from '@/lib/context/order-context'
import { motion } from 'framer-motion'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { getOrder } = useOrders()
  const order = orderId ? getOrder(orderId) : null
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleCancelClick = () => {
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          razorpayPaymentId: order.razorpayPaymentId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setCancelModalOpen(false)
        alert('Order cancelled successfully')
        window.location.href = '/orders'
      } else {
        alert('Failed to cancel order: ' + data.error)
      }
    } catch (error) {
      alert('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

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
        {(order.status === 'pending' || order.status === 'processing') && (
          <button
            onClick={handleCancelClick}
            className="px-6 py-3 text-destructive border border-destructive rounded-md font-semibold hover:bg-destructive/10 transition"
          >
            Cancel Order
          </button>
        )}
      </div>

      <ConfirmationContent.CancelModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        cancelling={cancelling}
        orderNumber={order.orderNumber}
      />
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

ConfirmationContent.CancelModal = function CancelModal({ open, onClose, onConfirm, cancelling, orderNumber }: { open: boolean; onClose: () => void; onConfirm: () => void; cancelling: boolean; orderNumber: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Cancel Order</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to cancel order {orderNumber}? This will trigger a full refund to your original payment method.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-secondary/50 transition"
          >
            No, Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-semibold disabled:opacity-60 transition"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
