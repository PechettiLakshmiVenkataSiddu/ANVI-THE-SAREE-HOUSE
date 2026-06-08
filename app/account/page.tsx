'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import LogoutButton from '@/components/auth/LogoutButton'
import AuthLayout from '@/components/auth/AuthLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Package, ShoppingBag } from 'lucide-react'

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountPageContent />
    </ProtectedRoute>
  )
}

function AccountPageContent() {
  const { user, displayName, role } = useAuth()

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col">
        <div className="text-center lg:text-left mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Account</h1>
          <div className="w-12 h-px bg-accent mx-auto lg:mx-0 mb-3" />
          <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
        </div>

        <div className="bg-secondary/40 rounded-lg p-5 mb-6 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{' '}
            <span className="font-medium">{user?.email}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span>{' '}
            <span className="font-medium capitalize">{role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link
            href="/orders"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/50 transition text-sm font-semibold"
          >
            <Package size={18} className="text-primary" />
            My Orders
          </Link>
          <Link
            href="/shop"
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-secondary/50 transition text-sm font-semibold"
          >
            <ShoppingBag size={18} className="text-primary" />
            Continue Shopping
          </Link>
        </div>

        <LogoutButton className="w-full" />
      </div>
    </AuthLayout>
  )
}
