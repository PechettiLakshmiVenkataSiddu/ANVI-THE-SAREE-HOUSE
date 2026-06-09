'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

const mobileLinks = [
  { href: '/', label: 'HOME' },
  { href: '/shop', label: 'SHOP' },
  { href: '/shop?category=kanchipuram', label: 'COLLECTIONS' },
  { href: '/shop?filter=new', label: 'NEW ARRIVALS' },
  { href: '/shop?filter=bestseller', label: 'BEST SELLERS' },
  { href: '/about', label: 'ABOUT US' },
  { href: '/contact', label: 'CONTACT US' },
  { href: '/wishlist', label: 'WISHLIST' },
  { href: '/cart', label: 'CART' },
  { href: '/orders', label: 'MY ORDERS' },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { isAuthenticated, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setIsOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        className="md:hidden p-2 hover:bg-secondary rounded-full transition"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background z-50 shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-serif font-bold text-primary">ANVI THE SAREE HOUSE</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-md transition"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-md transition"
                    >
                      MY ACCOUNT
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-md transition text-left flex items-center gap-2 text-destructive disabled:opacity-60"
                    >
                      {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                      {loggingOut ? 'LOGGING OUT...' : 'LOGOUT'}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-sm font-medium hover:bg-secondary rounded-md transition"
                  >
                    LOGIN
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
