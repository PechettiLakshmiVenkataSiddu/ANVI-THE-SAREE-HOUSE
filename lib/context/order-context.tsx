'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'
import { createDemoOrder, createTrackingSteps, generateOrderNumber } from '@/lib/data/orders'
import { calculateTotal } from '@/lib/utils/cart'
import type { CartItem, Order, ShippingAddress } from '@/lib/types'

interface OrderContextType {
  orders: Order[]
  isHydrated: boolean
  createOrder: (
    items: CartItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string,
    couponCode?: string | null
  ) => Order
  getOrder: (id: string) => Order | undefined
  getOrderByNumber: (orderNumber: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

const defaultOrders: Order[] = [createDemoOrder()]

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders, isHydrated] = useLocalStorage<Order[]>('saree-orders', defaultOrders)

  const createOrder = useCallback(
    (
      items: CartItem[],
      shippingAddress: ShippingAddress,
      paymentMethod: string,
      couponCode: string | null = null
    ): Order => {
      const { subtotal, shipping, discount, total } = calculateTotal(items, couponCode)
      const order: Order = {
        id: `order-${Date.now()}`,
        orderNumber: generateOrderNumber(),
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
        status: 'placed',
        trackingSteps: createTrackingSteps('placed'),
        shippingAddress,
        paymentMethod,
        couponCode: couponCode ?? undefined,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      }
      setOrders((prev) => [order, ...prev])
      return order
    },
    [setOrders]
  )

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  const getOrderByNumber = useCallback(
    (orderNumber: string) => orders.find((o) => o.orderNumber === orderNumber),
    [orders]
  )

  return (
    <OrderContext.Provider value={{ orders, isHydrated, createOrder, getOrder, getOrderByNumber }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrders must be used within OrderProvider')
  return context
}
