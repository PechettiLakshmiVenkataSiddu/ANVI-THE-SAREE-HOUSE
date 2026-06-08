'use client'

import { useAuth } from '@/components/providers/AuthProvider'

interface CustomerInfoProps {
  className?: string
}

/** Displays logged-in customer details — use inside protected pages only */
export default function CustomerInfo({ className = '' }: CustomerInfoProps) {
  const { customer, loading } = useAuth()

  if (loading || !customer) return null

  return (
    <div className={`text-sm space-y-1 ${className}`}>
      <p>
        <span className="text-muted-foreground">Signed in as</span>{' '}
        <span className="font-semibold text-foreground">{customer.displayName}</span>
      </p>
      <p className="text-muted-foreground">{customer.email}</p>
    </div>
  )
}
