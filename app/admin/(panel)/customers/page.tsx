'use client'

import { useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import { getCustomers, getCustomerOrders } from '@/lib/admin/queries'
import type { DbProfile, DbOrder } from '@/lib/types/admin'
import { supabase } from '@/lib/supabase'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<DbProfile[]>([])
  const [selected, setSelected] = useState<DbProfile | null>(null)
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    getCustomers()
      .then(async (customersData) => {
        setCustomers(customersData)
        // Fetch all orders and count per customer
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, user_id, shipping_address')
        
        const counts: Record<string, number> = {}
        customersData.forEach((customer) => {
          const customerOrders = ordersData?.filter((order: any) => {
            // Primary match: order.user_id === profile.id
            if (order.user_id === customer.id) return true
            // Fallback match: shipping_address.email === profile.email
            if (order.shipping_address) {
              const shippingAddress = typeof order.shipping_address === 'string'
                ? JSON.parse(order.shipping_address)
                : order.shipping_address
              if (shippingAddress.email === customer.email) return true
            }
            return false
          }) || []
          counts[customer.id] = customerOrders.length
        })
        setOrderCounts(counts)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const selectCustomer = async (customer: DbProfile) => {
    setSelected(customer)
    try {
      const customerOrders = await getCustomerOrders(customer.id)
      setOrders(customerOrders)
    } catch {
      setOrders([])
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <AdminHeader title="Customers" description="View registered customers and their orders" />
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className={`border-b border-border last:border-0 hover:bg-secondary/10 cursor-pointer ${selected?.id === c.id ? 'bg-secondary/30' : ''}`}
                >
                  <td className="p-4 font-medium">
                    {c.first_name} {c.last_name}
                    {orderCounts[c.id] > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        {orderCounts[c.id]}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">{c.email}</td>
                  <td className="p-4 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="p-8 text-center text-muted-foreground">No customers registered yet.</p>}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 h-fit sticky top-8">
          {selected ? (
            <div className="space-y-4">
              <h3 className="font-bold">{selected.first_name} {selected.last_name}</h3>
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                {selected.phone && <p><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>}
                <p><span className="text-muted-foreground">Role:</span> {selected.role}</p>
                <p><span className="text-muted-foreground">Joined:</span> {new Date(selected.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-2">Orders ({orders.length})</p>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders</p>
                ) : (
                  orders.map((o) => (
                    <div key={o.id} className="text-sm py-2 border-b border-border last:border-0">
                      <p className="font-medium">{o.order_number}</p>
                      <p className="text-muted-foreground">₹{Number(o.total).toLocaleString()} · {o.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a customer to view details</p>
          )}
        </div>
      </div>
    </div>
  )
}
