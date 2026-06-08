import type { Order, OrderStatus, TrackingStep } from '@/lib/types'

export function generateOrderNumber(): string {
  return `#SE${Math.floor(1000000 + Math.random() * 9000000)}`
}

export function createTrackingSteps(status: OrderStatus = 'placed'): TrackingStep[] {
  const baseSteps: Omit<TrackingStep, 'completed'>[] = [
    { status: 'placed', label: 'Order Placed', date: formatDate(new Date()), time: formatTime(new Date()) },
    { status: 'confirmed', label: 'Confirmed', date: '', time: '' },
    { status: 'shipped', label: 'Shipped', date: '', time: '' },
    { status: 'out_for_delivery', label: 'Out for Delivery', date: '', time: '' },
    { status: 'delivered', label: 'Delivered', date: '', time: '' },
  ]

  const statusOrder: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']
  const currentIndex = statusOrder.indexOf(status)

  return baseSteps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    date: index <= currentIndex ? step.date || formatDate(addDays(new Date(), index)) : '',
    time: index <= currentIndex ? step.time || formatTime(addHours(new Date(), index + 1)) : '',
  }))
}

export function createDemoOrder(): Order {
  return {
    id: 'demo-order-1',
    orderNumber: '#SE1023456',
    items: [
      {
        productId: '1',
        name: 'Royal Pink Banarasi Silk Saree',
        price: 2899,
        image: '/images/saree-1.png',
        quantity: 1,
        color: 'Pink',
        deliveryDate: '18 May 2024',
      },
      {
        productId: '2',
        name: 'Mehendi Green Woven Saree',
        price: 2699,
        image: '/images/saree-2.png',
        quantity: 1,
        color: 'Green',
        deliveryDate: '18 May 2024',
      },
    ],
    subtotal: 5598,
    shipping: 0,
    discount: 0,
    total: 5598,
    status: 'delivered',
    trackingSteps: [
      { status: 'placed', label: 'Order Placed', date: '16 May 2024', time: '10:30 AM', completed: true },
      { status: 'confirmed', label: 'Confirmed', date: '16 May 2024', time: '11:00 AM', completed: true },
      { status: 'shipped', label: 'Shipped', date: '17 May 2024', time: '09:20 AM', completed: true },
      { status: 'out_for_delivery', label: 'Out for Delivery', date: '18 May 2024', time: '08:30 AM', completed: true },
      { status: 'delivered', label: 'Delivered', date: '18 May 2024', time: '02:15 PM', completed: true },
    ],
    shippingAddress: {
      firstName: 'Neha',
      lastName: 'Sharma',
      email: 'neha@example.com',
      phone: '+91 98765 43210',
      address: '123, Green Street',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      country: 'India',
    },
    paymentMethod: 'Cash on Delivery',
    createdAt: '2024-05-16T10:30:00',
    estimatedDelivery: '18 May 2024',
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function addHours(date: Date, hours: number): Date {
  const d = new Date(date)
  d.setHours(d.getHours() + hours)
  return d
}

export function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    placed: 'text-blue-600',
    confirmed: 'text-indigo-600',
    shipped: 'text-purple-600',
    out_for_delivery: 'text-orange-600',
    delivered: 'text-green-600',
  }
  return colors[status]
}
