'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import AuthTrustBadges from '@/components/auth/AuthTrustBadges'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#EBE4DC] flex flex-col">
      {/* Top shipping banner */}
      <div className="bg-primary text-primary-foreground py-2.5 text-center text-sm tracking-wide flex items-center justify-center gap-2">
        <span className="opacity-90">🚚</span>
        FREE SHIPPING ON ORDERS ABOVE ₹1999
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-5xl bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
            {/* Left branding panel */}
            <div className="relative hidden lg:flex flex-col bg-secondary/80 p-10 overflow-hidden">
              <Link href="/" className="relative z-10 mb-8">
                <div className="text-2xl font-serif font-bold text-primary">
                  ANVI
                  <div className="text-xs text-accent tracking-[0.35em] font-sans font-normal mt-0.5">THE SAREE HOUSE</div>
                </div>
                <div className="w-16 h-px bg-accent mt-2" />
              </Link>

              <div className="relative z-10 mt-auto mb-6">
                <h2 className="text-3xl font-serif font-bold text-foreground leading-snug mb-2">
                  Grace in Every Drape
                </h2>
                <p className="text-sm text-muted-foreground">Timeless sarees for every occasion</p>
              </div>

              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/hero-saree.png"
                  alt="ANVI THE SAREE HOUSE"
                  fill
                  className="object-cover object-top opacity-90"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />
              </div>
            </div>

            {/* Right form panel */}
            <div className="relative flex flex-col p-8 md:p-10 lg:p-12">
              {/* Mobile logo */}
              <Link href="/" className="lg:hidden mb-6 text-center">
                <div className="text-xl font-serif font-bold text-primary inline-block">
                  ANVI
                  <div className="text-[10px] text-accent tracking-[0.3em]">THE SAREE HOUSE</div>
                </div>
              </Link>

              {children}

              <AuthTrustBadges />

              {/* Decorative lotus hint */}
              <div className="absolute bottom-4 right-4 opacity-[0.07] pointer-events-none select-none text-6xl font-serif text-primary">
                ✿
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} ANVI THE SAREE HOUSE. All Rights Reserved.</p>
        <p>
          <Link href="#" className="hover:text-primary transition">Privacy Policy</Link>
          {' '}|{' '}
          <Link href="#" className="hover:text-primary transition">Terms &amp; Conditions</Link>
        </p>
      </footer>
    </div>
  )
}
