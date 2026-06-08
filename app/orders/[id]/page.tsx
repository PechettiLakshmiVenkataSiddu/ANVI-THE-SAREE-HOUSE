'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import OrderTracking from '@/components/OrderTracking'
import OrderDetailsCard from '@/components/order/OrderDetailsCard'
import { useOrders } from '@/lib/context/order-context'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const { getOrder } = useOrders()
  const order = getOrder(id)

  if (!order) notFound()

  return (
    <ProtectedRoute>
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'My Orders', href: '/orders' },
          { label: order.orderNumber },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OrderDetailsCard order={order} />
          <OrderTracking orderId={order.orderNumber} steps={order.trackingSteps} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop" className="text-accent font-semibold hover:text-primary">
            Continue Shopping →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
    </ProtectedRoute>
  )
}
