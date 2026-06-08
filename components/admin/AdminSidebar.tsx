'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Layers,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { signOut, displayName } = useAuth()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col min-h-screen flex-shrink-0">
      <div className="p-6 border-b border-primary-foreground/20">
        <Link href="/admin" className="block">
          <p className="font-serif text-xl font-bold">SAREE</p>
          <p className="text-[10px] tracking-[0.3em] text-accent">ADMIN</p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition ${
                active ? 'bg-primary-foreground/15 text-white' : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-primary-foreground/20 space-y-2">
        <p className="text-xs text-primary-foreground/60 px-4 truncate">{displayName}</p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2 text-sm text-primary-foreground/70 hover:text-white transition"
        >
          <ExternalLink size={16} />
          View Store
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary-foreground/70 hover:text-white transition disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}
