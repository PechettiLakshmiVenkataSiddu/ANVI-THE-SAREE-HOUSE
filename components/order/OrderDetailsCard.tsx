'use client'

import { Copy, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { Order } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { getStatusColor } from '@/lib/data/orders'

interface OrderDetailsCardProps {
  order: Order
}

export default function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  const [copied, setCopied] = useState(false)

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">ORDER DETAILS</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-semibold">{order.orderNumber}</span>
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1 text-xs text-accent hover:text-primary font-semibold"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>
        <span className={`font-semibold text-sm capitalize ${getStatusColor(order.status)}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-border">
        <div>
          <p className="text-muted-foreground">Order Date</p>
          <p className="font-semibold">
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="font-bold text-lg">₹{order.total.toLocaleString()}</p>
        </div>
        {order.estimatedDelivery && (
          <div>
            <p className="text-muted-foreground">Estimated Delivery</p>
            <p className="font-semibold">{order.estimatedDelivery}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Payment</p>
          <p className="font-semibold">{order.paymentMethod}</p>
        </div>
      </div>

      <h3 className="font-bold text-foreground mb-4">Items Ordered</h3>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={`${item.productId}-${item.color}`} className="flex gap-3">
            <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Qty: {item.quantity} × ₹{item.price.toLocaleString()} · {item.color}
              </p>
              {item.deliveryDate && (
                <p className="text-xs text-green-600 mt-1">Delivered on {item.deliveryDate}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-bold text-foreground mb-3">SHIPPING ADDRESS</h3>
        <div className="text-sm space-y-1">
          <p className="font-semibold">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-muted-foreground">
            {order.shippingAddress.address},<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            <br />
            {order.shippingAddress.country}
          </p>
          <p className="text-muted-foreground">
            Phone: <span className="text-foreground font-semibold">{order.shippingAddress.phone}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
