import { Suspense } from 'react'
import AdminLoginForm from '@/components/admin/AdminLoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login',
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1410]" />}>
      <AdminLoginForm />
    </Suspense>
  )
}
