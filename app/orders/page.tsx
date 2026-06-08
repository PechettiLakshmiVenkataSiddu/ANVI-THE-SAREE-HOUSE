'use client'

import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useOrders } from '@/lib/context/order-context'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { getStatusColor } from '@/lib/data/orders'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function OrdersPage() {
  const { orders } = useOrders()

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
                  <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
    </ProtectedRoute>
  )
}
