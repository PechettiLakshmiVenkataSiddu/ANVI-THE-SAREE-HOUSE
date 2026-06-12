'use client'

import { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import { getOrders, getOrder, updateOrderStatus } from '@/lib/admin/queries'
import type { DbOrder, AdminOrderStatus } from '@/lib/types/admin'
import { ADMIN_ORDER_STATUSES } from '@/lib/types/admin'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<DbOrder | null>(null)
  const [updating, setUpdating] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<DbOrder | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const openOrder = async (id: string) => {
    const order = await getOrder(id)
    setSelected(order)
  }

  const handleStatusChange = async (status: AdminOrderStatus) => {
    if (!selected) return
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(selected.id, status)
      setSelected(updated)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const statusLabel = (s: string) => ADMIN_ORDER_STATUSES.find((x) => x.value === s)?.label ?? s

  const handleCancelClick = (e: React.MouseEvent, order: DbOrder) => {
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
          razorpayPaymentId: orderToCancel.razorpay_payment_id,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setCancelModalOpen(false)
        setOrderToCancel(null)
        // Refresh orders
        const updatedOrders = await getOrders()
        setOrders(updatedOrders)
        if (selected?.id === orderToCancel.id) {
          setSelected(null)
        }
      } else {
        setError('Failed to cancel order: ' + data.error)
      }
    } catch (error) {
      setError('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <AdminHeader title="Orders" description="View and manage customer orders" />
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={`border-b border-border last:border-0 hover:bg-secondary/10 cursor-pointer ${selected?.id === order.id ? 'bg-secondary/30' : ''}`} onClick={() => openOrder(order.id)}>
                  <td className="p-4 font-medium">{order.order_number}</td>
                  <td className="p-4 text-muted-foreground">{order.customer_name ?? order.customer_email ?? '—'}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-secondary text-xs rounded-full">{statusLabel(order.status)}</span></td>
                  <td className="p-4 text-right font-semibold">₹{Number(order.total).toLocaleString()}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={(e) => handleCancelClick(e, order)}
                      className="px-2 py-1 text-xs font-semibold text-destructive border border-destructive rounded hover:bg-destructive/10 transition"
                    >
                      Cancel
                    </button>
                    <Eye size={16} className="text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-8 text-center text-muted-foreground">No orders in database yet.</p>}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 h-fit sticky top-8">
          {selected ? (
            <div className="space-y-4">
              <h3 className="font-bold">{selected.order_number}</h3>
              <p className="text-sm text-muted-foreground">{new Date(selected.created_at).toLocaleString()}</p>
              <div>
                <p className="text-xs font-semibold mb-1">Update Status</p>
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(e.target.value as AdminOrderStatus)}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-input"
                >
                  {ADMIN_ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2">Items</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="text-sm py-2 border-b border-border last:border-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity} × ₹{item.price} · {item.color}</p>
                  </div>
                ))}
              </div>
              <div className="text-sm space-y-1 pt-2 border-t border-border">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(selected.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{Number(selected.total).toLocaleString()}</span></div>
              </div>
              {selected.shipping_address && (
                <div className="text-sm">
                  <p className="text-xs font-semibold mb-1">Shipping</p>
                  <p className="text-muted-foreground">{JSON.stringify(selected.shipping_address, null, 0).replace(/[{}"]/g, ' ')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an order to view details</p>
          )}
        </div>
      </div>

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
              Are you sure you want to cancel order {orderToCancel?.order_number}? This will trigger a full refund to the customer's original payment method.
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
    </div>
  )
}
