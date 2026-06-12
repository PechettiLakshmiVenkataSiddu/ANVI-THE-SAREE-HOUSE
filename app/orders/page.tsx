'use client'

import Link from 'next/link'
import { Package, ChevronRight, X } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useOrders } from '@/lib/context/order-context'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { getStatusColor } from '@/lib/data/orders'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useState } from 'react'

export default function OrdersPage() {
  const { orders } = useOrders()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)

  const handleCancelClick = (e: React.MouseEvent, order: any) => {
    e.preventDefault()
    e.stopPropagation()
    setOrderToCancel(order)
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return
    setCancelling(true)
    try {
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderToCancel.id,
          razorpayPaymentId: orderToCancel.razorpayPaymentId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setCancelModalOpen(false)
        setOrderToCancel(null)
        // Refresh orders
        window.location.reload()
      } else {
        alert('Failed to cancel order: ' + data.error)
      }
    } catch (error) {
      alert('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'My Orders' }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-6">No orders yet</p>
            <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-card border border-border rounded-lg p-5 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      <span className={`text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={(e) => handleCancelClick(e, order)}
                        className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Cancel Order</h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to cancel order {orderToCancel?.orderNumber}? This will trigger a full refund to your original payment method.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-secondary/50 transition"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-semibold disabled:opacity-60 transition"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    </ProtectedRoute>
  )
}
