'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTrackingSteps, generateOrderNumber } from '@/lib/data/orders'
import { calculateTotal } from '@/lib/utils/cart'
import { useAuth } from '@/components/providers/AuthProvider'
import type { CartItem, Order, ShippingAddress } from '@/lib/types'

interface OrderContextType {
  orders: Order[]
  isHydrated: boolean
  createOrder: (
    items: CartItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string,
    couponCode?: string | null,
    razorpayPaymentId?: string | null
  ) => Promise<Order>
  getOrder: (id: string) => Order | undefined
  getOrderByNumber: (orderNumber: string) => Order | undefined
  refreshOrders: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([])
      setIsHydrated(true)
      return
    }

    try {
      const { data, error } = await supabase  
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } else {
        // Transform Supabase data to Order type
        const transformedOrders = (data || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          items: order.items,
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          status: order.status,
          trackingSteps: createTrackingSteps(order.status),
          shippingAddress: order.shipping_address,
          paymentMethod: order.payment_method,
          couponCode: order.coupon_code,
          razorpayPaymentId: order.razorpay_payment_id,
          createdAt: order.created_at,
          estimatedDelivery: order.estimated_delivery,
        }))
        setOrders(transformedOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsHydrated(true)
    }
  }, [user, supabase])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  const createOrder = useCallback(
    async (
      items: CartItem[],
      shippingAddress: ShippingAddress,
      paymentMethod: string,
      couponCode: string | null = null,
      razorpayPaymentId: string | null = null
    ): Promise<Order> => {
      if (!user) {
        throw new Error('User must be logged in to create an order')
      }

      const { subtotal, shipping, discount, total } = calculateTotal(items, couponCode)
      const orderNumber = generateOrderNumber()
      const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })

      // Allowed order statuses per database constraint
      const allowedStatuses = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

      // Determine status based on payment method
      // Razorpay payments are successful, so order should be in processing
      // Cash on Delivery orders start as pending
      let orderStatus = paymentMethod === 'Razorpay' ? 'processing' : 'pending'

      // Defensive validation: ensure status is in allowed list
      if (!allowedStatuses.includes(orderStatus)) {
        console.error('[OrderContext] Invalid status detected:', orderStatus, 'Defaulting to pending')
        orderStatus = 'pending'
      }

      const orderData: any = {
        user_id: user.id,
        order_number: orderNumber,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          color: item.color,
        })),
        subtotal,
        shipping,
        discount,
        total,
        status: orderStatus,
        payment_status: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        estimated_delivery: estimatedDelivery,
      }

      if (razorpayPaymentId) {
        orderData.razorpay_payment_id = razorpayPaymentId
      }

      console.log('[OrderContext] Creating order with payload:', {
        orderNumber,
        paymentMethod,
        status: orderStatus,
        payment_status: paymentMethod === 'Razorpay' ? 'paid' : 'pending',
        total,
      })

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        console.error('[OrderContext] Error creating order:', error)
        console.error('[OrderContext] Order payload:', orderData)
        throw new Error('Failed to create order')
      }

      console.log('[OrderContext] Order created successfully:', data.id)

      const newOrder: Order = {
        id: data.id,
        orderNumber: data.order_number,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        discount: data.discount,
        total: data.total,
        status: data.status,
        trackingSteps: createTrackingSteps(data.status),
        shippingAddress: data.shipping_address,
        paymentMethod: data.payment_method,
        paymentStatus: data.payment_status,
        couponCode: data.coupon_code,
        razorpayPaymentId: data.razorpay_payment_id,
        createdAt: data.created_at,
        estimatedDelivery: data.estimated_delivery,
      }

      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    },
    [user, supabase]
  )

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  const getOrderByNumber = useCallback(
    (orderNumber: string) => orders.find((o) => o.orderNumber === orderNumber),
    [orders]
  )

  return (
    <OrderContext.Provider value={{ orders, isHydrated, createOrder, getOrder, getOrderByNumber, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within OrderProvider')
  return context
}