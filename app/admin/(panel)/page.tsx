'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Users, IndianRupee } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'
import StatCard from '@/components/admin/StatCard'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import { getDashboardStats } from '@/lib/admin/queries'
import type { DashboardStats } from '@/lib/types/admin'
import { ADMIN_ORDER_STATUSES } from '@/lib/types/admin'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message ?? 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <p className="text-destructive text-sm">{error}</p>
  if (!stats) return null

  const statusLabel = (s: string) => ADMIN_ORDER_STATUSES.find((x) => x.value === s)?.label ?? s

  return (
    <div>
      <AdminHeader title="Dashboard" description="Overview of your store performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
        <StatCard title="Total Products" value={stats.totalProducts} icon={Package} />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} />
        <StatCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          subtitle="All time"
        />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-foreground">Recent Orders</h2>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 font-semibold">Order</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4 text-muted-foreground">{order.customer_name ?? order.customer_email ?? '—'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-secondary text-xs rounded-full capitalize">{statusLabel(order.status)}</span>
                    </td>
                    <td className="p-4 text-right font-semibold">₹{Number(order.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
